(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var header = doc.querySelector('.site-header');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileNav = window.matchMedia('(max-width: 899px)');

  /* ---------- page-load transition ---------- */
  function ready() { body.classList.remove('is-loading'); }
  if (doc.readyState === 'complete') { setTimeout(ready, 150); }
  else { window.addEventListener('load', function () { setTimeout(ready, 150); }); setTimeout(ready, 2500); }

  /* ---------- header: solid background after scrolling the hero ---------- */
  var heroMedia = doc.querySelector('.hero-media');
  var hero = doc.querySelector('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 40);
    if (heroMedia && !reduceMotion && y < hero.offsetHeight) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = doc.getElementById('burger');
  var nav = doc.getElementById('main-nav');
  nav.querySelectorAll('li').forEach(function (li, i) { li.style.setProperty('--i', i); });

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setSearch(false); } });
  mobileNav.addEventListener ? mobileNav.addEventListener('change', function () { setMenu(false); }) : null;

  /* ---------- active nav link ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a'));
  function setActive(hash) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === hash;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  var spy = [
    { id: 'home', hash: '#home' },
    { id: 'categories', hash: '#categories' },
    { id: 'everest', hash: '#categories' },
    { id: 'journal', hash: '#journal' },
    { id: 'contact', hash: '#contact' }
  ];
  if ('IntersectionObserver' in window) {
    var visible = {};
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      for (var i = spy.length - 1; i >= 0; i--) {
        if (visible[spy[i].id]) { setActive(spy[i].hash); return; }
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    spy.forEach(function (s) { var el = doc.getElementById(s.id); if (el) spyIO.observe(el); });
  }
  navLinks.forEach(function (a) { a.addEventListener('click', function () { setActive(a.getAttribute('href')); }); });

  /* ---------- scroll reveals ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- search ---------- */
  var searchToggle = doc.getElementById('search-toggle');
  var searchPanel = doc.getElementById('search-panel');
  var searchInput = doc.getElementById('search-input');
  var searchMsg = doc.getElementById('search-msg');

  function setSearch(open) {
    if (!searchPanel) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) { searchInput.focus(); } else { searchMsg.textContent = ''; }
  }
  searchToggle.addEventListener('click', function () { setSearch(searchPanel.hidden); });
  searchPanel.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = searchInput.value.trim().toLowerCase();
    if (!q) { searchMsg.textContent = 'Type something to search.'; return; }
    var targets = doc.querySelectorAll('.card, .news-card, .everest, .cta, .hero');
    var hit = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].textContent.toLowerCase().indexOf(q) > -1) { hit = targets[i]; break; }
    }
    if (!hit) { searchMsg.textContent = 'No results for “' + searchInput.value.trim() + '”.'; return; }
    searchMsg.textContent = '';
    setSearch(false);
    var top = hit.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
    hit.classList.add('search-hit');
    setTimeout(function () { hit.classList.remove('search-hit'); }, 2400);
  });

  /* ---------- newsletter ---------- */
  var form = doc.getElementById('subscribe');
  var subMsg = doc.getElementById('sub-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.elements.email;
    var value = input.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    subMsg.className = 'sub-msg ' + (ok ? 'is-ok' : 'is-err');
    if (!ok) {
      subMsg.textContent = 'Please enter a valid email address.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    // No backend is wired up yet: swap this block for a fetch() to your mailing-list endpoint.
    subMsg.textContent = 'Thank you — you have joined the community.';
    form.reset();
  });
})();
