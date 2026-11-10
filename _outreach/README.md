# Outreach tool: brand ka naam do, Claude research karke mail likhega, Titan se bhejega, lead track karega

This folder starts with `_`, so GitHub Pages does not publish it on creatorchahiye.com.
`leads.csv` and `.env` (your leads and passwords) are in `.gitignore` and never get committed.

## What it does

1. **Research**: Claude searches the web and reads the brand's own website (home, about, contact).
2. **Find contact**: if you give only the brand name, it looks for a public business email, the founder's name and a phone number on their site. It never guesses an email.
3. **Write**: a short, personal pitch from CreatorChahiye that opens with something real about their brand (`profile.md` controls what it says about you).
4. **Send**: from your Titan business mail (SMTP), with a copy saved in Titan's Sent folder.
5. **Track**: every lead lives in `leads.csv` (opens in Excel / Google Sheets) with a status:
   `new → drafted → approved → sent → replied / bounced / unsubscribed` (plus `no_email`, `skipped`, `failed`).
6. **Follow up**: after 4 days with no reply, Claude writes a short follow-up in the same thread (max 2).
7. **Check replies**: reads your Titan inbox and marks who replied, bounced or asked to unsubscribe.

## One-time setup (10 minutes)

```bash
cd _outreach
pip install anthropic
cp .env.example .env
```

Then open `.env` and fill in:
- `ANTHROPIC_API_KEY`: create one at platform.claude.com, Settings > API keys (add some credit).
- `TITAN_EMAIL` / `TITAN_PASSWORD`: your Titan mailbox login.
- `SENDER_NAME`: the name that signs the emails.

Titan settings are already filled in (`smtp.titan.email:465`, `imap.titan.email:993`). If login fails,
check in Titan's settings that third-party apps / IMAP access is turned on for your mailbox.

## Daily use

**Sirf brand ka naam (Claude khud email dhoondhega):**
```bash
python outreach.py run "Brand Name"
```

**Brand + email aapke paas hai:**
```bash
python outreach.py run "Brand Name" --email founder@brand.com --send
```
`--send` shows you the email and asks you to type `yes` before it goes out.

**Apni 1000 startups ki list:** save it as CSV (columns like `name, email, phone, website`; extra columns are ignored):
```bash
python outreach.py import startups.csv
python outreach.py draft --limit 25        # Claude researches + writes 25 emails
python outreach.py review                  # read them (or open leads.csv and edit)
python outreach.py approve --all
python outreach.py send --limit 25         # sends with a 1-2.5 min gap between emails
```

**Every morning:**
```bash
python outreach.py check-replies           # who replied / bounced
python outreach.py followup                # follow-ups for no-replies
python outreach.py stats                   # pipeline summary + reply rate
```

## Important: don't burn your domain

- Start slow: 15-20 emails/day for the first week, then go up. `DAILY_SEND_LIMIT` (default 40) is enforced.
  Titan also has its own hourly/daily sending caps depending on your plan; sending too many gets the mailbox blocked.
- Set up SPF, DKIM and DMARC for creatorchahiye.com in Titan / your DNS before sending in bulk.
- Read the first 20-30 drafts yourself before using `approve --all`.
- Every email ends with an "reply 'unsubscribe'" line, and `check-replies` stops emailing anyone who asks.
- Emails found by research are usually `info@`/`hello@` addresses. For founder emails, a tool like Apollo
  gives verified addresses; put them in the `email` column and they will be used.

## Cost

Each lead uses one research call (web search + website reads) and one writing call. With the default
model (`claude-opus-5-5`) expect very roughly ₹15-30 per lead including web searches, so about ₹15k-30k for
1000 leads. To spend less, set `CLAUDE_MODEL=claude-sonnet-5-5` in `.env` and compare a few drafts.

## Files

| File | What it is |
|---|---|
| `outreach.py` | The tool |
| `profile.md` | What Claude is allowed to say about CreatorChahiye. Edit freely. |
| `.env.example` | Settings template; copy to `.env` |
| `leads.csv` | Your tracker (created on first use, not committed) |
| `sample_import.csv` | Example import format |
