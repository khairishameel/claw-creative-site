/* =========================================================================
   Claw Creative — shared app.js
   Nav behavior · scroll reveal · typewriter · count-up · page transitions
   ========================================================================= */
(function () {
  'use strict';

  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  ready(() => {
    initNav();
    initMobileMenu();
    initScrollReveal();
    initCountUp();
    initTypewriter();
    initStickyProgress();
    initCardTilt();
    initButtonRipple();
    initActiveNav();
    initPageTransitions();
    initParallax();
  });

  /* --- Nav scroll behavior --- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile hamburger --- */
  function initMobileMenu() {
    const btn = document.querySelector('.hamburger');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-controls', 'mobile-menu');
    btn.setAttribute('aria-expanded', 'false');
    if (!menu.id) menu.id = 'mobile-menu';
    if (!menu.querySelector('.mobile-menu-close')) {
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'mobile-menu-close';
      close.setAttribute('aria-label', 'Close menu');
      close.innerHTML = '&times;';
      close.addEventListener('click', () => setOpen(false));
      menu.prepend(close);
    }
    function setOpen(open) {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!menu.classList.contains('open')); }
    });
    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
    });
  }

  /* --- Mark active nav link --- */
  function initActiveNav() {
    const here = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const target = href.replace(/\.html$/, '').replace(/\/index$/, '/');
      if (target === here || (target === '/' && here === '/')) a.classList.add('active');
    });
  }

  /* --- Scroll reveal (IntersectionObserver) --- */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  /* --- Count-up numbers (data-count) --- */
  function initCountUp() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const run = (el) => {
      if (el.dataset._ran === '1') return;
      el.dataset._ran = '1';
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = parseInt(el.dataset.dur || '1600', 10);
      const isFloat = !Number.isInteger(target);
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    // Safety net: if after 4s any counter is still visible but unfired, run it.
    setTimeout(() => {
      els.forEach((el) => {
        if (el.dataset._ran === '1') return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) run(el);
      });
    }, 4000);
  }

  /* --- Typewriter hero (data-typewriter on element) --- */
  function initTypewriter() {
    document.querySelectorAll('[data-typewriter]').forEach((el) => {
      const full = el.textContent.trim();
      el.textContent = '';
      el.insertAdjacentHTML('afterbegin', '<span class="tw-text"></span><span class="cursor"></span>');
      const textEl = el.querySelector('.tw-text');
      let i = 0;
      const speed = 42;
      const delay = parseInt(el.dataset.delay || '400', 10);
      setTimeout(() => {
        const tick = () => {
          if (i >= full.length) { return; }
          // render with .fire wrapped on keywords marked with  * * or __
          const next = full.slice(0, i + 1);
          textEl.innerHTML = next
            .replace(/\*([^*]+)\*/g, '<span class="fire">$1</span>');
          i += 1;
          setTimeout(tick, speed + (Math.random() * 25 - 12));
        };
        tick();
      }, delay);
    });
  }

  /* --- Scroll progress bar --- */
  function initStickyProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = Math.max(0, Math.min(1, scrolled)) * 100 + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Card tilt / cursor glow --- */
  function initCardTilt() {
    document.querySelectorAll('.card, .feature-card, .pricing-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* --- Button ripple --- */
  function initButtonRipple() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.add('rippling');
        setTimeout(() => btn.classList.remove('rippling'), 700);
      });
    });
  }

  /* --- Smooth page transitions for internal links --- */
  function initPageTransitions() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      // external / new-tab / hash / mailto / tel — skip
      if (a.target === '_blank') return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (/^https?:\/\//.test(href) && !href.includes(location.host)) return;
      // Only transition when the link is within this site
      try {
        const url = new URL(href, location.href);
        if (url.host !== location.host) return;
        if (url.pathname === location.pathname) return;
      } catch { return; }
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => { window.location.href = href; }, 230);
    });
  }

  /* --- Parallax on [data-parallax] --- */
  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    const onScroll = () => {
      const y = window.scrollY;
      els.forEach((el) => {
        const rate = parseFloat(el.dataset.parallax || '0.2');
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + y - window.innerHeight) * -rate;
        el.style.transform = `translate3d(0, ${offset * 0.25}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Chat demo scripted conversation --- */
  window.runChatDemo = function (container, script) {
    const list = container.querySelector('.chat-demo-body') || container;
    list.innerHTML = '';
    let i = 0;
    const step = () => {
      if (i >= script.length) {
        setTimeout(() => { list.innerHTML = ''; i = 0; step(); }, 4500);
        return;
      }
      const msg = script[i];
      if (msg.typing) {
        const row = document.createElement('div');
        row.className = 'chat-row ai';
        row.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
        list.appendChild(row);
        setTimeout(() => { row.remove(); i++; step(); }, msg.ms || 1100);
        return;
      }
      const row = document.createElement('div');
      row.className = 'chat-row ' + (msg.from === 'user' ? 'user' : 'ai');
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      row.appendChild(bubble);
      list.appendChild(row);
      if (msg.from === 'user') {
        bubble.textContent = msg.text;
        i++;
        setTimeout(step, msg.ms || 700);
      } else {
        // type out AI message
        const full = msg.text;
        let c = 0;
        const t = () => {
          if (c > full.length) { i++; setTimeout(step, 700); return; }
          bubble.textContent = full.slice(0, c);
          c += 1;
          setTimeout(t, 18 + Math.random() * 20);
        };
        t();
      }
    };
    step();
  };
})();
