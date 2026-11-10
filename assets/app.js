/* CreatorChahiye — shared behaviour */
(function () {
  const SHEET_URL = "https://script.google.com/macros/s/AKfycbw7efpYwB0lbGBv-E7X5Ta0HbdIQaBg0PZt_2feRtXrSdKzLsctMIurS-Pxyn88PNY/exec";
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* sticky nav */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); burger.focus();
      }
    });
    document.querySelectorAll('.mobile a').forEach(a =>
      a.addEventListener('click', () => document.body.classList.remove('menu-open')));
  }

  /* active nav link */
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a =>
    a.classList.toggle('on', a.dataset.nav === page));

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  requestAnimationFrame(() =>
    document.querySelectorAll('.hero .rv, .phead .rv').forEach(el => el.classList.add('in')));

  /* budget estimator (Brands page) */
  const eb = document.getElementById('eb'), et = document.getElementById('et');
  if (eb && et) {
    const RATES = { nano: { cost: 2500, reach: 6000 }, micro: { cost: 14000, reach: 45000 }, mixed: { cost: 30000, reach: 160000 } };
    const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : n;
    const run = () => {
      const r = RATES[et.value], creators = Math.max(1, Math.round(+eb.value * 0.78 / r.cost));
      document.getElementById('eoC').textContent = creators;
      document.getElementById('eoR').textContent = fmt(creators * r.reach) + '+';
      document.getElementById('eoP').textContent = (creators * 2) + '+';
    };
    eb.addEventListener('change', run); et.addEventListener('change', run); run();
  }

  document.addEventListener('input', e => { if (e.target.classList) { e.target.classList.remove('bad'); e.target.removeAttribute('aria-invalid'); } });

  /* forms -> Google Sheet (brand leads / creators routed by form_type) */
  document.querySelectorAll('form[data-type]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form._hp && form._hp.value) return;
      const btn = form.querySelector('button[type=submit]'), msg = form.querySelector('.fmsg');
      /* validate: form is novalidate, so check fields ourselves */
      msg.classList.remove('err');
      let bad = null;
      form.querySelectorAll('input,select,textarea').forEach(f => {
        if (f.name === '_hp') return;
        const v = f.value.trim();
        let ok = !(f.required && !v);
        if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 10;
        f.classList.toggle('bad', !ok);
        if (ok) f.removeAttribute('aria-invalid'); else f.setAttribute('aria-invalid', 'true');
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        msg.classList.add('err');
        msg.textContent = bad.type === 'email' && bad.value ? 'Please enter a valid email.' :
          bad.type === 'tel' && bad.value ? 'Please enter a valid 10-digit phone number.' : 'Please fill in the highlighted fields.';
        bad.focus();
        return;
      }
      const label = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Sending…'; msg.textContent = '';
      try {
        const p = new URLSearchParams();
        p.set('form_type', form.dataset.type);
        new FormData(form).forEach((v, k) => { if (k !== '_hp') p.set(k, v); });
        await fetch(SHEET_URL + '?' + p.toString(), { method: 'GET', mode: 'no-cors' });
        msg.textContent = form.dataset.ok;
        form.reset(); btn.textContent = 'Sent ✓';
      } catch (err) {
        msg.classList.add('err');
        msg.innerHTML = 'Something went wrong. <a href="https://wa.me/917065555395" target="_blank" rel="noopener">WhatsApp us</a> or email marketing@creatorchahiye.com';
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  });

  /* scroll progress hairline */
  const bar = document.querySelector('.progress');
  if (bar) {
    const upd = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* hero matching demo — briefs use only real creator facts (niche, city, platform) */
  const match = document.querySelector('.match');
  if (match) {
    const briefs = [
      { t: 'Lifestyle & ethnic wear · North India · Reels', k: ['ayantika'] },
      { t: 'Fashion & fitness brand · Instagram Reels', k: ['utkarsh', 'vinod'] },
      { t: 'Entertainment launch · YouTube + Instagram', k: ['shubham'] },
    ];
    const title = document.getElementById('mBrief');
    const scan = match.querySelector('.m-scan');
    const rows = [...match.querySelectorAll('.m-row')];
    const show = b => {
      rows.forEach(r => r.classList.toggle('on', b.k.includes(r.dataset.k)));
      match.classList.remove('scanning'); match.classList.add('done');
    };
    if (reduce) { show(briefs[0]); }
    else {
      let i = 0, started = false;
      const step = () => {
        const b = briefs[i % briefs.length];
        match.classList.remove('done'); match.classList.add('scanning');
        title.classList.add('out');
        scan.classList.remove('run'); void scan.offsetWidth;
        setTimeout(() => { title.textContent = b.t; title.classList.remove('out'); scan.classList.add('run'); }, 350);
        setTimeout(() => show(b), 1400);
        i++;
        setTimeout(step, 4600);
      };
      const ob = new IntersectionObserver(es => {
        if (es[0].isIntersecting && !started) { started = true; step(); ob.disconnect(); }
      }, { threshold: 0.3 });
      ob.observe(match);
    }
  }
  /* swipe rows: mark which edge still has content, so CSS can fade it */
  document.querySelectorAll('.mcar, .chips-row').forEach(el => {
    const mark = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.classList.toggle('sw-none', max < 4);
      el.classList.toggle('sw-mid', max >= 4 && el.scrollLeft > 4 && el.scrollLeft < max - 4);
      el.classList.toggle('sw-end', max >= 4 && el.scrollLeft >= max - 4);
    };
    el.addEventListener('scroll', mark, { passive: true });
    addEventListener('resize', mark, { passive: true });
    mark();
  });

  /* mobile footer: link groups collapse into tap-to-open rows; Connect stays open */
  const fmq = window.matchMedia('(max-width:640px)');
  const fgroups = [...document.querySelectorAll('.fgrid > div')].filter(d => {
    const h = d.querySelector('h4'); return h && /explore|services|get started/i.test(h.textContent);
  });
  const setFooter = () => {
    fgroups.forEach(d => {
      const h = d.querySelector('h4');
      if (fmq.matches) {
        h.classList.add('fc-t'); h.setAttribute('role', 'button'); h.tabIndex = 0;
        if (!h.hasAttribute('aria-expanded')) h.setAttribute('aria-expanded', 'false');
        const open = h.getAttribute('aria-expanded') === 'true';
        d.classList.toggle('fc-closed', !open); d.classList.toggle('fc-open', open);
      } else {
        h.classList.remove('fc-t'); h.removeAttribute('role'); h.removeAttribute('tabindex'); h.removeAttribute('aria-expanded');
        d.classList.remove('fc-closed', 'fc-open');
      }
    });
  };
  fgroups.forEach(d => {
    const h = d.querySelector('h4');
    const toggle = () => {
      if (!fmq.matches) return;
      h.setAttribute('aria-expanded', h.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      setFooter();
    };
    h.addEventListener('click', toggle);
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  fmq.addEventListener('change', setFooter);
  setFooter();
})();
