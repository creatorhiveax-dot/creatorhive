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

  /* forms -> Google Sheet (brand leads / creators routed by form_type) */
  document.querySelectorAll('form[data-type]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form._hp && form._hp.value) return;
      const btn = form.querySelector('button[type=submit]'), msg = form.querySelector('.fmsg');
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
        msg.textContent = 'Something went wrong. Email karan@creatorchahiye.com';
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  });
})();
