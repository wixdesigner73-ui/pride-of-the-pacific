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

  /* ---------- header: solid background after scrolling; hero parallax on the homepage ---------- */
  var heroMedia = doc.querySelector('.hero-media');
  var hero = doc.querySelector('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 40);
    if (heroMedia && hero && !reduceMotion && y < hero.offsetHeight) {
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
  if (mobileNav.addEventListener) mobileNav.addEventListener('change', function () { setMenu(false); });

  /* The current page is marked in the HTML with aria-current="page" and class is-active. */

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

  /* ---------- site search (jumps to the best matching page) ---------- */
  var SITE_INDEX = [
    { url: 'index.html', title: 'Home', words: 'home one pacific one dream inspiring generation ocean mountains stronger together' },
    { url: 'our-story.html', title: 'Our Story', words: 'our story about us mission values why we exist brand emblem' },
    { url: 'expeditions.html', title: 'Expeditions', words: 'expeditions climb mountain everest 2027 pete vinaka manaslu summit' },
    { url: 'everest-2027.html', title: 'Everest 2027', words: 'everest 2027 pete vinaka ultimate challenge education health opportunity' },
    { url: 'athletes.html', title: 'Athletes', words: 'athletes swimmer talei rawamila sport support apply ambassador' },
    { url: 'impact.html', title: 'Impact', words: 'impact community giving back education health opportunity children' },
    { url: 'the-pacific.html', title: 'The Pacific', words: 'pacific islands ocean culture home canoe voyaging inspiration' },
    { url: 'shop.html', title: 'Shop', words: 'shop apparel clothing tee t-shirt hoodie jacket cap beanie men women accessories bag buy' },
    { url: 'news.html', title: 'News', words: 'news journal latest updates stories blog' },
    { url: 'article-manaslu.html', title: 'Manaslu Expedition Update', words: 'manaslu expedition update summit mountain' },
    { url: 'article-talei.html', title: 'Rising Star: Talei Rawamila', words: 'talei rawamila swimmer rising star records butterfly' },
    { url: 'article-community.html', title: 'Working with Pacific Communities', words: 'working pacific communities sport education adventure children' },
    { url: 'get-involved.html', title: 'Get Involved', words: 'get involved volunteer join help support explore represent' },
    { url: 'partners.html', title: 'Partners', words: 'partners partnership brand organisation collaborate' },
    { url: 'sponsorship.html', title: 'Sponsorship', words: 'sponsorship sponsor athletes expedition' },
    { url: 'donate.html', title: 'Donate', words: 'donate donation give fund' },
    { url: 'careers.html', title: 'Careers', words: 'careers jobs work with us join the team hiring' },
    { url: 'shop-men.html', title: 'Shop Men', words: 'men mens tee hoodie shell jacket' },
    { url: 'shop-women.html', title: 'Shop Women', words: 'women womens tee hoodie rashguard' },
    { url: 'shop-accessories.html', title: 'Shop Accessories', words: 'accessories cap beanie hat' },
    { url: 'contact.html', title: 'Contact', words: 'contact message email enquiry form' },
    { url: 'privacy.html', title: 'Privacy Policy', words: 'privacy policy data cookies' },
    { url: 'terms.html', title: 'Terms & Conditions', words: 'terms conditions legal' }
  ];

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
    var raw = searchInput.value.trim();
    var terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { searchMsg.textContent = 'Type something to search.'; return; }
    var best = null, bestScore = 0;
    SITE_INDEX.forEach(function (p) {
      var title = p.title.toLowerCase();
      var hay = title + ' ' + p.words;
      var score = 0;
      terms.forEach(function (t) {
        if (title.indexOf(t) > -1) score += 3;
        if (hay.indexOf(t) > -1) score += 1;
      });
      if (score > bestScore) { best = p; bestScore = score; }
    });
    if (!best) { searchMsg.textContent = 'No results for “' + raw + '”.'; return; }
    window.location.href = best.url;
  });

  /* ---------- newsletter ---------- */
  var form = doc.getElementById('subscribe');
  var subMsg = doc.getElementById('sub-msg');
  if (form) form.addEventListener('submit', function (e) {
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

  /* ---------- toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // force a reflow so the transition replays when toasts are fired back to back
    void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- bag counter (demo: count is kept in localStorage) ---------- */
  var bagBadge = doc.querySelector('.bag-count');
  function getBag() {
    try { return parseInt(window.localStorage.getItem('pop-bag'), 10) || 0; } catch (err) { return 0; }
  }
  function setBag(n) {
    try { window.localStorage.setItem('pop-bag', String(n)); } catch (err) { /* storage unavailable */ }
    renderBag(n);
  }
  function renderBag(n) {
    if (!bagBadge) return;
    bagBadge.hidden = n < 1;
    bagBadge.textContent = String(n);
    var link = bagBadge.closest('a');
    if (link) link.setAttribute('aria-label', n ? 'Shopping bag, ' + n + (n === 1 ? ' item' : ' items') : 'Shopping bag');
  }
  renderBag(getBag());

  /* ---------- filter chips (shop + news) ---------- */
  doc.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var scope = doc.querySelector(group.getAttribute('data-filter-group'));
    if (!scope) return;
    var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-cat]'));
    var countEl = doc.querySelector('[data-count]');
    var emptyEl = doc.querySelector('[data-empty]');

    function apply(cat, push) {
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === cat)); });
      items.forEach(function (it) {
        var on = cat === 'all' || it.getAttribute('data-cat') === cat;
        it.hidden = !on;
        if (on) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' item' : ' items');
      if (emptyEl) emptyEl.hidden = shown > 0;
      if (push && window.history && history.replaceState) {
        history.replaceState(null, '', cat === 'all' ? location.pathname + location.search : '#' + cat);
      }
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.getAttribute('data-filter'), true); }); });

    var wanted = (location.hash || '').replace('#', '').toLowerCase();
    var known = chips.some(function (c) { return c.getAttribute('data-filter') === wanted; });
    apply(known ? wanted : 'all', false);
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#', '').toLowerCase();
      if (chips.some(function (c) { return c.getAttribute('data-filter') === h; })) apply(h, false);
    });
  });

  /* ---------- shop: add to bag ---------- */
  doc.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBag(getBag() + 1);
      toast(btn.getAttribute('data-add') + ' added to your bag.');
    });
  });

  /* ---------- contact / enquiry forms ---------- */
  var enquiry = doc.getElementById('enquiry');
  if (enquiry) {
    var topicSel = enquiry.elements.topic;
    var topicWanted = (new URLSearchParams(location.search).get('topic') || '').toLowerCase();
    if (topicSel && topicWanted) {
      Array.prototype.forEach.call(topicSel.options, function (o) { if (o.value === topicWanted) topicSel.value = o.value; });
    }
    var enqMsg = doc.getElementById('enquiry-msg');
    var rules = {
      name: function (v) { return v.length >= 2 ? '' : 'Please tell us your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.'; },
      topic: function (v) { return v ? '' : 'Please choose a topic.'; },
      message: function (v) { return v.length >= 10 ? '' : 'Please write a short message (at least 10 characters).'; }
    };
    enquiry.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var el = enquiry.elements[name];
        var err = rules[name](el.value.trim());
        var slot = doc.getElementById(name + '-err');
        if (slot) slot.textContent = err;
        if (err) { el.setAttribute('aria-invalid', 'true'); if (!firstBad) firstBad = el; }
        else { el.removeAttribute('aria-invalid'); }
      });
      if (enquiry.elements.company && enquiry.elements.company.value) return; // honeypot: bots fill this in
      if (firstBad) {
        enqMsg.className = 'form-msg is-err';
        enqMsg.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      // No backend is wired up yet: swap this block for a fetch() to your form endpoint.
      enqMsg.className = 'form-msg is-ok';
      enqMsg.textContent = 'Thank you — your message is ready to send once the form is connected. We will be in touch.';
      enquiry.reset();
    });
  }
})();
