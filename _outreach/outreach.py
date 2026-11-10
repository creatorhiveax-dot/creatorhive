#!/usr/bin/env python3
"""
CreatorChahiye cold outreach: research a brand, write a pitch email with Claude,
send it from Titan mail, and track every lead in leads.csv.

Quick start (see README.md for the full guide):
    python outreach.py run "Brand Name"                 # research + draft, show it
    python outreach.py run "Brand Name" --email a@b.com --send
    python outreach.py import my_startups.csv           # load your 1000 startups
    python outreach.py draft --limit 20                 # draft emails for new leads
    python outreach.py send --limit 20                  # send approved drafts
    python outreach.py followup                          # follow up on no-replies
    python outreach.py check-replies                     # mark replies / bounces
    python outreach.py stats                             # pipeline summary

Only dependency: pip install anthropic
"""

from __future__ import annotations

import argparse
import csv
import email.utils
import imaplib
import json
import os
import random
import re
import shutil
import smtplib
import sys
import time
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.parser import BytesParser
from email import policy
from pathlib import Path

HERE = Path(__file__).resolve().parent
LEADS_FILE = HERE / "leads.csv"
PROFILE_FILE = HERE / "profile.md"

FIELDS = [
    "brand", "website", "email", "contact_name", "phone", "category",
    "status", "research", "subject", "body", "email_source",
    "sent_at", "message_id", "followups", "last_contact_at",
    "replied_at", "notes", "updated_at",
]

# Lead statuses, in pipeline order
NEW = "new"                 # imported, nothing done yet
DRAFTED = "drafted"         # Claude wrote an email; review it, then approve
APPROVED = "approved"       # ready to send
SENT = "sent"               # first email sent (followups counted separately)
REPLIED = "replied"         # they answered: take it from here yourself
BOUNCED = "bounced"         # address did not exist
UNSUBSCRIBED = "unsubscribed"
NO_EMAIL = "no_email"       # research found no public address
SKIPPED = "skipped"         # Claude judged it a poor fit (reason in notes)
FAILED = "failed"           # an error; see notes, fix and set back to new

STOP_STATUSES = {REPLIED, BOUNCED, UNSUBSCRIBED}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

def load_env() -> None:
    """Load KEY=VALUE lines from .env next to this script (no extra package)."""
    env_file = HERE / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        if value and key.strip() not in os.environ:
            os.environ[key.strip()] = value


def cfg(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def require(name: str) -> str:
    value = cfg(name)
    if not value:
        sys.exit(f"Missing {name}. Add it to {HERE / '.env'} (see .env.example).")
    return value


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def parse_iso(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except ValueError:
        return None


# --------------------------------------------------------------------------- #
# Lead storage (a CSV you can open in Excel / Google Sheets)
# --------------------------------------------------------------------------- #

def load_leads() -> list[dict]:
    if not LEADS_FILE.exists():
        return []
    with LEADS_FILE.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        for field in FIELDS:
            row.setdefault(field, "")
            if row[field] is None:
                row[field] = ""
    return rows


def save_leads(leads: list[dict]) -> None:
    if LEADS_FILE.exists():
        shutil.copyfile(LEADS_FILE, LEADS_FILE.with_suffix(".csv.bak"))
    tmp = LEADS_FILE.with_suffix(".csv.tmp")
    with tmp.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(leads)
    tmp.replace(LEADS_FILE)


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def find_lead(leads: list[dict], brand: str) -> dict | None:
    key = norm(brand)
    return next((l for l in leads if norm(l["brand"]) == key), None)


def new_lead(brand: str, email_addr: str = "", phone: str = "",
             website: str = "", contact_name: str = "") -> dict:
    lead = {f: "" for f in FIELDS}
    lead.update(brand=brand.strip(), email=email_addr.strip().lower(),
                phone=phone.strip(), website=website.strip(),
                contact_name=contact_name.strip(), status=NEW,
                followups="0", updated_at=now_iso())
    if lead["email"]:
        lead["email_source"] = "provided"
    return lead


def touch(lead: dict, **changes) -> None:
    lead.update({k: ("" if v is None else str(v)) for k, v in changes.items()})
    lead["updated_at"] = now_iso()


# --------------------------------------------------------------------------- #
# Claude: research + writing
# --------------------------------------------------------------------------- #

_client = None


def claude():
    global _client
    if _client is None:
        try:
            import anthropic
        except ImportError:
            sys.exit("Install the Claude SDK first:  pip install anthropic")
        _client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    return _client


def model() -> str:
    return cfg("CLAUDE_MODEL", "claude-opus-5-5")


def call_claude(**kwargs):
    """One Messages API call with refusal fallback and pause_turn resume."""
    import anthropic

    messages = kwargs.pop("messages")
    for attempt in range(6):
        try:
            response = claude().beta.messages.create(
                model=model(),
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                messages=messages,
                **kwargs,
            )
        except anthropic.RateLimitError as e:
            wait = int(e.response.headers.get("retry-after", "30"))
            print(f"   rate limited, waiting {wait}s")
            time.sleep(wait)
            continue
        except anthropic.APIConnectionError:
            time.sleep(5 * (attempt + 1))
            continue

        if response.stop_reason == "pause_turn":
            # Server-side web tools paused; send the turn back and it resumes.
            messages = messages + [{"role": "assistant", "content": response.content}]
            continue
        if response.stop_reason == "refusal":
            raise RuntimeError("Claude declined this request")
        return response
    raise RuntimeError("Claude did not finish after several attempts")


def response_text(response) -> str:
    return "\n".join(b.text for b in response.content if b.type == "text").strip()


RESEARCH_PROMPT = """You are researching an Indian startup / brand so an influencer marketing \
agency can send them a relevant, personal cold email.

Brand: {brand}
Known website: {website}
Known email: {email}
Known contact person: {contact_name}

Use web search and fetch their website (home, about, contact pages) and anything recent \
about them. Find and report, as short plain notes:
1. Official website URL.
2. What they sell, to whom, price range, and their category (D2C, fintech, SaaS, travel, etc).
3. Stage and size signals: funding, founders, recent launches, new products, expansion, hiring.
4. Their current social / creator activity: Instagram handle, follower range, whether they \
already run influencer or UGC content, and what kind.
5. Contact details that are PUBLICLY listed on their own website or an official profile: \
a business email (prefer marketing, partnerships, founder, or hello@ / contact@), the \
founder or marketing head's name, and a business phone number. Write the exact URL where \
you saw each one. Never guess or construct an email address from a pattern.
6. One specific, recent, verifiable detail that would make a good personal opening line.
7. Red flags: the company seems shut down, is not a consumer-facing brand, or is a huge \
enterprise that would not hire a small agency.

If you cannot find something, say "not found". Do not invent anything."""

WRITE_SCHEMA = {
    "type": "object",
    "properties": {
        "website": {"type": "string", "description": "Official website, or empty"},
        "category": {"type": "string", "description": "Short category, e.g. D2C skincare"},
        "contact_email": {"type": "string", "description": "Best public business email found in research, or empty. Never guessed."},
        "contact_email_source": {"type": "string", "description": "URL where that email was seen, or empty"},
        "contact_name": {"type": "string", "description": "Founder / marketing head name if found, or empty"},
        "phone": {"type": "string", "description": "Public business phone if found, or empty"},
        "research_summary": {"type": "string", "description": "3-5 line summary of the brand for the sales team"},
        "skip_reason": {"type": "string", "description": "Empty if we should email them. Otherwise one line on why not (shut down, poor fit, etc)."},
        "subject": {"type": "string"},
        "body": {"type": "string", "description": "Plain-text email body including greeting and sign-off"},
    },
    "required": ["website", "category", "contact_email", "contact_email_source", "contact_name",
                 "phone", "research_summary", "skip_reason", "subject", "body"],
    "additionalProperties": False,
}


def writing_rules() -> str:
    sender = cfg("SENDER_NAME", "Team CreatorChahiye")
    title = cfg("SENDER_TITLE", "CreatorChahiye")
    phone = cfg("SENDER_PHONE")
    language = cfg("EMAIL_LANGUAGE", "English")
    signoff = "\n".join(x for x in [sender, title, phone, "creatorchahiye.com"] if x)
    return f"""Email rules:
- Language: {language}. Warm, direct, human. Sounds like a founder wrote it in 5 minutes, not a template.
- 90 to 140 words in the body. Short paragraphs. No bullet lists, no bold, no emojis, no links except at most one relevant creatorchahiye.com page.
- Open with one specific, true detail about THEIR brand from the research (a launch, product, campaign, milestone). Never praise vaguely.
- Connect it to one concrete idea for creators/UGC that fits their product and audience (which creator niche, what format).
- One line of credibility from the agency profile, only facts that are in it.
- End with one easy ask: a 15-minute call this week, or "reply and I'll send 5 creator profiles that fit <brand>".
- Greet the contact by first name if known, otherwise "Hi <Brand> team".
- Subject: under 7 words, lowercase-friendly, specific to them, no clickbait, no "Collaboration opportunity".
- Do not use these words: synergy, leverage, elevate, unlock, game-changer, delve, seamless, revolutionize, I hope this email finds you well.
- Never claim we have worked with them, never invent numbers, clients or results.
- Sign off exactly as:
{signoff}
- After the sign-off add one blank line and then: "If this isn't relevant, just reply 'unsubscribe' and I won't email again." """


def research_brand(lead: dict) -> str:
    prompt = RESEARCH_PROMPT.format(
        brand=lead["brand"], website=lead["website"] or "unknown",
        email=lead["email"] or "unknown", contact_name=lead["contact_name"] or "unknown")
    response = call_claude(
        max_tokens=16000,
        output_config={"effort": "medium"},
        tools=[
            {"type": "web_search_20260209", "name": "web_search", "max_uses": 5,
             "user_location": {"type": "approximate", "country": "IN"}},
            {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 5},
        ],
        messages=[{"role": "user", "content": prompt}],
    )
    return response_text(response)


def write_email(lead: dict, research: str) -> dict:
    profile = PROFILE_FILE.read_text(encoding="utf-8")
    prompt = f"""{profile}

---
Lead from our tracker:
Brand: {lead['brand']}
Website: {lead['website'] or 'unknown'}
Email we already have: {lead['email'] or 'none'}
Contact name we already have: {lead['contact_name'] or 'none'}
Phone we already have: {lead['phone'] or 'none'}
Extra notes from the sales team: {lead['notes'] or 'none'}

Research notes:
{research}

---
{writing_rules()}

Fill every field. For contact_email, use only an address that appears in the research \
notes with a source; leave it empty if none was found."""
    response = call_claude(
        max_tokens=8000,
        output_config={"effort": "medium",
                       "format": {"type": "json_schema", "schema": WRITE_SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(response_text(response))


def draft_lead(lead: dict) -> None:
    print(f"-> {lead['brand']}: researching")
    research = research_brand(lead)
    print(f"   writing email")
    result = write_email(lead, research)

    found = (result["contact_email"] or "").strip().lower()
    if found and not EMAIL_RE.fullmatch(found):
        found = ""
    changes = dict(
        research=result["research_summary"],
        category=result["category"] or lead["category"],
        website=lead["website"] or result["website"],
        contact_name=lead["contact_name"] or result["contact_name"],
        phone=lead["phone"] or result["phone"],
        subject=result["subject"].strip(),
        body=result["body"].strip(),
    )
    if not lead["email"] and found:
        changes.update(email=found, email_source=result["contact_email_source"] or "research")
    touch(lead, **changes)

    if result["skip_reason"].strip():
        touch(lead, status=SKIPPED, notes=result["skip_reason"].strip())
    elif not lead["email"]:
        touch(lead, status=NO_EMAIL,
              notes="No public email found. Add one in leads.csv, set status to drafted.")
    else:
        touch(lead, status=DRAFTED)
    print(f"   status: {lead['status']}  email: {lead['email'] or '-'}")


FOLLOWUP_SCHEMA = {
    "type": "object",
    "properties": {"body": {"type": "string"}},
    "required": ["body"],
    "additionalProperties": False,
}


def write_followup(lead: dict, number: int) -> str:
    sender = cfg("SENDER_NAME", "Team CreatorChahiye")
    prompt = f"""We sent this cold email to {lead['brand']} and got no reply.

Subject: {lead['subject']}
{lead['body']}

Brand research: {lead['research']}

Write follow-up number {number}. Plain text, 35 to 70 words, same language and tone. \
Do not repeat the first email or say "just following up" / "bumping this". Add one new, \
useful angle (a specific creator format idea, a small pilot idea, or a quick question). \
{"This is the last follow-up: say you will not email again and leave the door open." if number >= int(cfg("MAX_FOLLOWUPS", "2")) else ""}
Sign off with just: {sender}"""
    response = call_claude(
        max_tokens=4000,
        output_config={"effort": "medium",
                       "format": {"type": "json_schema", "schema": FOLLOWUP_SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    return json.loads(response_text(response))["body"].strip()


# --------------------------------------------------------------------------- #
# Titan mail: send (SMTP) and read (IMAP)
# --------------------------------------------------------------------------- #

def smtp_send(to_addr: str, subject: str, body: str, in_reply_to: str = "") -> str:
    sender_email = require("TITAN_EMAIL")
    password = require("TITAN_PASSWORD")
    msg = EmailMessage()
    msg["From"] = email.utils.formataddr((cfg("SENDER_NAME", "CreatorChahiye"), sender_email))
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg["Date"] = email.utils.formatdate(localtime=True)
    domain = sender_email.split("@", 1)[1]
    msg["Message-ID"] = email.utils.make_msgid(domain=domain)
    msg["List-Unsubscribe"] = f"<mailto:{sender_email}?subject=unsubscribe>"
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    msg.set_content(body)

    host = cfg("TITAN_SMTP_HOST", "smtp.titan.email")
    port = int(cfg("TITAN_SMTP_PORT", "465"))
    with smtplib.SMTP_SSL(host, port, timeout=60) as server:
        server.login(sender_email, password)
        server.send_message(msg)

    # Keep a copy in Titan's Sent folder so the thread shows up in your mailbox.
    try:
        with imap_connect() as imap:
            imap.append(cfg("TITAN_SENT_FOLDER", "Sent"), "\\Seen",
                        imaplib.Time2Internaldate(time.time()), msg.as_bytes())
    except Exception as e:  # not fatal: the email itself was sent
        print(f"   (could not save to Sent folder: {e})")
    return msg["Message-ID"]


def imap_connect() -> imaplib.IMAP4_SSL:
    imap = imaplib.IMAP4_SSL(cfg("TITAN_IMAP_HOST", "imap.titan.email"),
                             int(cfg("TITAN_IMAP_PORT", "993")))
    imap.login(require("TITAN_EMAIL"), require("TITAN_PASSWORD"))
    return imap


def sent_today(leads: list[dict]) -> int:
    today = datetime.now(timezone.utc).date()
    return sum(1 for l in leads
               if (d := parse_iso(l["last_contact_at"])) and d.date() == today)


def pause_between_sends() -> None:
    low = int(cfg("MIN_DELAY_SECONDS", "60"))
    high = int(cfg("MAX_DELAY_SECONDS", "150"))
    wait = random.randint(low, max(low, high))
    print(f"   waiting {wait}s before the next email")
    time.sleep(wait)


# --------------------------------------------------------------------------- #
# Commands
# --------------------------------------------------------------------------- #

COLUMN_ALIASES = {
    "brand": ["brand", "name", "company", "startup", "company name", "brand name", "startup name"],
    "email": ["email", "mail", "email id", "e-mail", "email address"],
    "phone": ["phone", "number", "mobile", "phone number", "contact", "contact number", "whatsapp"],
    "website": ["website", "site", "url", "domain", "web"],
    "contact_name": ["contact name", "founder", "person", "contact person", "poc"],
}


def cmd_import(args) -> None:
    leads = load_leads()
    added = updated = 0
    with open(args.file, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        header = {h.strip().lower(): h for h in (reader.fieldnames or [])}
        mapping = {}
        for field, aliases in COLUMN_ALIASES.items():
            for alias in aliases:
                if alias in header:
                    mapping[field] = header[alias]
                    break
        if "brand" not in mapping:
            sys.exit(f"Could not find a brand/name column. Columns seen: {reader.fieldnames}")
        print(f"Column mapping: {mapping}")
        for row in reader:
            values = {k: (row.get(col) or "").strip() for k, col in mapping.items()}
            if not values.get("brand"):
                continue
            existing = find_lead(leads, values["brand"])
            if existing:
                for key in ("email", "phone", "website", "contact_name"):
                    if values.get(key) and not existing[key]:
                        existing[key] = values[key].lower() if key == "email" else values[key]
                        if key == "email":
                            existing["email_source"] = "provided"
                updated += 1
            else:
                leads.append(new_lead(values["brand"], values.get("email", ""),
                                      values.get("phone", ""), values.get("website", ""),
                                      values.get("contact_name", "")))
                added += 1
    save_leads(leads)
    print(f"Imported {added} new leads, updated {updated}. Total: {len(leads)}")


def cmd_add(args) -> dict:
    leads = load_leads()
    lead = find_lead(leads, args.brand)
    if lead:
        print(f"{lead['brand']} is already in the tracker (status: {lead['status']}).")
        if args.email and not lead["email"]:
            touch(lead, email=args.email.lower(), email_source="provided")
    else:
        lead = new_lead(args.brand, args.email or "", args.phone or "",
                        args.website or "", args.contact or "")
        if args.note:
            lead["notes"] = args.note
        leads.append(lead)
        print(f"Added {lead['brand']}.")
    save_leads(leads)
    return lead


def select(leads: list[dict], statuses: set[str], brand: str | None, limit: int) -> list[dict]:
    if brand:
        lead = find_lead(leads, brand)
        if not lead:
            sys.exit(f"{brand} is not in leads.csv. Add it with: python outreach.py add \"{brand}\"")
        return [lead]
    return [l for l in leads if l["status"] in statuses][:limit]


def cmd_draft(args) -> None:
    leads = load_leads()
    targets = select(leads, {NEW}, args.brand, args.limit)
    if not targets:
        print("No leads with status 'new' to draft.")
        return
    for lead in targets:
        try:
            draft_lead(lead)
        except Exception as e:
            touch(lead, status=FAILED, notes=f"draft error: {e}")
            print(f"   failed: {e}")
        save_leads(leads)  # save after each lead so nothing is lost
    print_drafts([l for l in targets if l["status"] == DRAFTED])


def print_drafts(leads: list[dict]) -> None:
    for lead in leads:
        print("\n" + "=" * 70)
        print(f"{lead['brand']}  <{lead['email']}>   [{lead['category']}]")
        print(f"Research: {lead['research']}")
        print("-" * 70)
        print(f"Subject: {lead['subject']}\n\n{lead['body']}")
    if leads:
        print("\n" + "=" * 70)
        print("Edit any draft in leads.csv if you like, then approve:")
        print('  python outreach.py approve --all      or   approve --brand "Name"')


def cmd_review(args) -> None:
    print_drafts([l for l in load_leads() if l["status"] == DRAFTED][: args.limit])


def cmd_approve(args) -> None:
    leads = load_leads()
    targets = select(leads, {DRAFTED}, args.brand, 10**9) if (args.all or args.brand) else []
    if not targets:
        sys.exit("Use --all or --brand \"Name\".")
    for lead in targets:
        if lead["status"] in (DRAFTED, NO_EMAIL) and lead["email"] and lead["body"]:
            touch(lead, status=APPROVED)
    save_leads(leads)
    print(f"Approved {sum(1 for l in targets if l['status'] == APPROVED)} drafts.")


def cmd_send(args) -> None:
    leads = load_leads()
    targets = select(leads, {APPROVED}, args.brand, args.limit)
    if args.brand and targets[0]["status"] not in (APPROVED, DRAFTED):
        sys.exit(f"{targets[0]['brand']} has status '{targets[0]['status']}', nothing to send.")
    targets = [l for l in targets if l["email"] and l["body"]]
    room = int(cfg("DAILY_SEND_LIMIT", "40")) - sent_today(leads)
    if room <= 0:
        sys.exit("Daily send limit reached. Try again tomorrow (or raise DAILY_SEND_LIMIT).")
    targets = targets[:room]
    if not targets:
        print("Nothing approved to send. Run draft, then approve.")
        return

    print(f"About to send {len(targets)} email(s) from {require('TITAN_EMAIL')}:")
    for l in targets:
        print(f"  - {l['brand']} <{l['email']}>: {l['subject']}")
    if not args.yes and input("Type 'yes' to send: ").strip().lower() != "yes":
        print("Cancelled.")
        return

    for i, lead in enumerate(targets):
        try:
            message_id = smtp_send(lead["email"], lead["subject"], lead["body"])
            touch(lead, status=SENT, sent_at=now_iso(), last_contact_at=now_iso(),
                  message_id=message_id, followups="0")
            print(f"   sent to {lead['brand']}")
        except Exception as e:
            touch(lead, status=FAILED, notes=f"send error: {e}")
            print(f"   failed for {lead['brand']}: {e}")
        save_leads(leads)
        if i < len(targets) - 1:
            pause_between_sends()


def cmd_followup(args) -> None:
    leads = load_leads()
    after = timedelta(days=int(cfg("FOLLOWUP_AFTER_DAYS", "4")))
    max_followups = int(cfg("MAX_FOLLOWUPS", "2"))
    due = [l for l in leads if l["status"] == SENT
           and int(l["followups"] or 0) < max_followups
           and (d := parse_iso(l["last_contact_at"])) and datetime.now(timezone.utc) - d >= after]
    room = int(cfg("DAILY_SEND_LIMIT", "40")) - sent_today(leads)
    due = due[: min(args.limit, max(room, 0))]
    if not due:
        print("No follow-ups due (or daily limit reached). Run check-replies first.")
        return

    drafts = []
    for lead in due:
        number = int(lead["followups"] or 0) + 1
        try:
            drafts.append((lead, number, write_followup(lead, number)))
        except Exception as e:
            print(f"   could not write follow-up for {lead['brand']}: {e}")
    for lead, number, body in drafts:
        print("\n" + "=" * 70 + f"\n{lead['brand']} <{lead['email']}>  follow-up #{number}\n{body}")
    if not drafts:
        return
    if not args.yes and input(f"\nSend these {len(drafts)} follow-ups? Type 'yes': ").strip().lower() != "yes":
        print("Cancelled.")
        return

    for i, (lead, number, body) in enumerate(drafts):
        subject = lead["subject"] if lead["subject"].lower().startswith("re:") else f"Re: {lead['subject']}"
        try:
            smtp_send(lead["email"], subject, body, in_reply_to=lead["message_id"])
            touch(lead, followups=number, last_contact_at=now_iso())
            print(f"   follow-up #{number} sent to {lead['brand']}")
        except Exception as e:
            print(f"   failed for {lead['brand']}: {e}")
        save_leads(leads)
        if i < len(drafts) - 1:
            pause_between_sends()


UNSUB_WORDS = ("unsubscribe", "remove me", "not interested", "stop emailing", "don't email", "do not email")


def cmd_check_replies(args) -> None:
    leads = load_leads()
    by_email = {l["email"]: l for l in leads if l["email"] and l["status"] == SENT}
    if not by_email:
        print("No sent leads waiting for a reply.")
        return
    since = (datetime.now() - timedelta(days=args.days)).strftime("%d-%b-%Y")
    changed = 0
    with imap_connect() as imap:
        imap.select("INBOX", readonly=True)
        _, data = imap.search(None, f'(SINCE "{since}")')
        ids = data[0].split()
        print(f"Checking {len(ids)} inbox messages since {since}...")
        for msg_id in ids:
            _, msg_data = imap.fetch(msg_id, "(BODY.PEEK[])")
            raw = next((part[1] for part in msg_data if isinstance(part, tuple)), None)
            if not raw:
                continue
            msg = BytesParser(policy=policy.default).parsebytes(raw)
            sender = email.utils.parseaddr(str(msg.get("From", "")))[1].lower()
            try:
                body_part = msg.get_body(preferencelist=("plain", "html"))
                text = body_part.get_content() if body_part else ""
            except Exception:
                text = ""

            if "mailer-daemon" in sender or "postmaster" in sender:
                for addr in set(a.lower() for a in EMAIL_RE.findall(text)):
                    lead = by_email.get(addr)
                    if lead and lead["status"] == SENT:
                        touch(lead, status=BOUNCED, notes="bounced")
                        print(f"   bounced: {lead['brand']} <{addr}>")
                        changed += 1
                continue

            lead = by_email.get(sender)
            if not lead or lead["status"] != SENT:
                continue
            reply_text = text.split("\nOn ")[0].lower()  # ignore quoted original
            if any(w in reply_text for w in UNSUB_WORDS):
                touch(lead, status=UNSUBSCRIBED, replied_at=now_iso())
                print(f"   unsubscribed: {lead['brand']}")
            else:
                touch(lead, status=REPLIED, replied_at=now_iso(),
                      notes=f"Reply: {str(msg.get('Subject', ''))[:80]}")
                print(f"   REPLIED: {lead['brand']} <{sender}>  -> reply from your inbox")
            changed += 1
    save_leads(leads)
    print(f"Updated {changed} lead(s).")


def cmd_stats(args) -> None:
    leads = load_leads()
    counts: dict[str, int] = {}
    for l in leads:
        counts[l["status"] or NEW] = counts.get(l["status"] or NEW, 0) + 1
    order = [NEW, DRAFTED, APPROVED, SENT, REPLIED, BOUNCED, UNSUBSCRIBED, NO_EMAIL, SKIPPED, FAILED]
    print(f"Total leads: {len(leads)}")
    for status in order + sorted(set(counts) - set(order)):
        if counts.get(status):
            print(f"  {status:<13} {counts[status]}")
    contacted = sum(counts.get(s, 0) for s in (SENT, REPLIED, BOUNCED, UNSUBSCRIBED))
    if contacted:
        print(f"Reply rate: {counts.get(REPLIED, 0) / contacted:.0%} of {contacted} contacted")
    print(f"Sent today: {sent_today(leads)} / {cfg('DAILY_SEND_LIMIT', '40')}")


def cmd_run(args) -> None:
    """One brand, end to end: add -> research -> draft -> (optionally) send."""
    cmd_add(args)
    leads = load_leads()
    lead = find_lead(leads, args.brand)
    if lead["status"] not in (NEW, FAILED, NO_EMAIL, SKIPPED) and not args.redo:
        print(f"Already {lead['status']}. Use --redo to research and rewrite it.")
        print_drafts([lead] if lead["body"] else [])
        return
    try:
        draft_lead(lead)
    except Exception as e:
        touch(lead, status=FAILED, notes=f"draft error: {e}")
        save_leads(leads)
        sys.exit(f"Failed: {e}")
    save_leads(leads)
    if lead["status"] == SKIPPED:
        print(f"\nClaude suggests skipping: {lead['notes']}\n")
    print_drafts([lead])
    if lead["status"] == NO_EMAIL:
        print("\nNo public email found. Re-run with --email to add one.")
        return
    if args.send and lead["status"] == DRAFTED:
        touch(lead, status=APPROVED)
        save_leads(leads)
        args.limit, args.brand = 1, lead["brand"]
        cmd_send(args)


# --------------------------------------------------------------------------- #

def main() -> None:
    load_env()
    p = argparse.ArgumentParser(description="CreatorChahiye outreach: research, write, send, track.")
    sub = p.add_subparsers(dest="cmd", required=True)

    def lead_args(sp):
        sp.add_argument("brand")
        sp.add_argument("--email")
        sp.add_argument("--phone")
        sp.add_argument("--website")
        sp.add_argument("--contact", help="Contact person's name")
        sp.add_argument("--note", help="Anything Claude should know (e.g. met at an event)")

    sp = sub.add_parser("run", help="One brand end to end: research + draft (+ --send)")
    lead_args(sp)
    sp.add_argument("--send", action="store_true", help="Send right after drafting (asks to confirm)")
    sp.add_argument("--yes", action="store_true", help="Skip the confirmation prompt")
    sp.add_argument("--redo", action="store_true", help="Research and rewrite even if already drafted")
    sp.set_defaults(func=cmd_run)

    sp = sub.add_parser("add", help="Add one brand to the tracker")
    lead_args(sp)
    sp.set_defaults(func=cmd_add)

    sp = sub.add_parser("import", help="Import a CSV of startups (name, email, phone, website)")
    sp.add_argument("file")
    sp.set_defaults(func=cmd_import)

    sp = sub.add_parser("draft", help="Research + write emails for 'new' leads")
    sp.add_argument("--brand")
    sp.add_argument("--limit", type=int, default=10)
    sp.set_defaults(func=cmd_draft)

    sp = sub.add_parser("review", help="Show drafted emails")
    sp.add_argument("--limit", type=int, default=50)
    sp.set_defaults(func=cmd_review)

    sp = sub.add_parser("approve", help="Mark drafts as ready to send")
    sp.add_argument("--brand")
    sp.add_argument("--all", action="store_true")
    sp.set_defaults(func=cmd_approve)

    sp = sub.add_parser("send", help="Send approved emails from Titan")
    sp.add_argument("--brand")
    sp.add_argument("--limit", type=int, default=20)
    sp.add_argument("--yes", action="store_true", help="Skip the confirmation prompt (for schedules)")
    sp.set_defaults(func=cmd_send)

    sp = sub.add_parser("followup", help="Write + send follow-ups to leads with no reply")
    sp.add_argument("--limit", type=int, default=20)
    sp.add_argument("--yes", action="store_true")
    sp.set_defaults(func=cmd_followup)

    sp = sub.add_parser("check-replies", help="Read Titan inbox, mark replies / bounces / unsubscribes")
    sp.add_argument("--days", type=int, default=30)
    sp.set_defaults(func=cmd_check_replies)

    sp = sub.add_parser("stats", help="Pipeline summary")
    sp.set_defaults(func=cmd_stats)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
