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
    // v2 — Antigravity-style behaviors
    initAurora();
    initCursorAura();
    initMagnetic();
    initSplitText();
    initCameraLock();
    initRingParticles();
    initTilt3D();
    initPageEnter();
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
    btn.addEventListener('click', () => menu.classList.toggle('open'));
    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') menu.classList.remove('open');
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

  /* =========================================================================
     v2 — Antigravity-style behaviors
     Aurora background · cursor aura · magnetic buttons · split-text reveals
     Camera-lock scrollytelling · ring particles · 3D tilt · page enter
     ========================================================================= */

  /* --- Inject aurora layer if missing --- */
  function initAurora() {
    if (document.querySelector('.aurora-bg')) return;
    const aurora = document.createElement('div');
    aurora.className = 'aurora-bg';
    aurora.innerHTML = '<div class="aurora-blob"></div>';
    document.body.prepend(aurora);
  }

  /* --- Dual-layer cursor follower (orb + dot, rAF lerp, GPU-only) --- */
  function initCursorAura() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const orb = document.createElement('div'); orb.className = 'cursor-orb';
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.appendChild(orb);
    document.body.appendChild(dot);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let lx = mx, ly = my;
    let active = false;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!active) {
        active = true;
        document.body.classList.add('cursor-active');
        // snap orb on first move so it doesn't fly in
        lx = mx; ly = my;
      }
      const target = e.target;
      const isHot = target.closest && target.closest('a, button, .btn, .btn-magnetic, .btn-glass, .service-card, .glass, .model-card, [data-magnet]');
      document.body.classList.toggle('cursor-hot', !!isHot);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', () => {
      active = false;
      document.body.classList.remove('cursor-active', 'cursor-hot');
    });

    const tick = () => {
      // ease orb toward cursor (lerp)
      lx += (mx - lx) * 0.14;
      ly += (my - ly) * 0.14;
      orb.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      // dot pinned to actual cursor
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* --- Magnetic buttons (cursor-tracked transform) --- */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn-magnetic, .magnet, [data-magnet]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnet || '0.35');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* --- Split text into per-word spans for staggered reveal --- */
  function initSplitText() {
    document.querySelectorAll('[data-split], .split-text').forEach((el) => {
      if (el.dataset._split === '1') return;
      const text = el.textContent;
      const words = text.split(/(\s+)/);
      el.innerHTML = '';
      let i = 0;
      words.forEach((w) => {
        if (/^\s+$/.test(w)) {
          el.appendChild(document.createTextNode(w));
          return;
        }
        const span = document.createElement('span');
        span.className = 'word';
        span.style.setProperty('--i', i++);
        const inner = document.createElement('span');
        inner.textContent = w;
        span.appendChild(inner);
        el.appendChild(span);
      });
      el.dataset._split = '1';
    });

    // Wrap each line of .display-1 children too
    document.querySelectorAll('.display-1').forEach((h) => {
      if (h.dataset._lined === '1') return;
      // Walk children and wrap text-only line breaks if needed
      h.childNodes.forEach((node) => {
        if (node.nodeType === 3 && node.textContent.trim()) {
          const wrap = document.createElement('span');
          wrap.className = 'line';
          const inner = document.createElement('span');
          inner.textContent = node.textContent;
          wrap.appendChild(inner);
          node.parentNode.replaceChild(wrap, node);
        }
      });
      h.dataset._lined = '1';
      // Trigger reveal slightly after mount
      requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('in')));
    });
  }

  /* --- Camera-lock scrollytelling --- */
  function initCameraLock() {
    document.querySelectorAll('.camera-lock').forEach((wrap) => {
      const stage = wrap.querySelector('.camera-lock-stage');
      const steps = Array.from(wrap.querySelectorAll('.camera-lock-step'));
      if (!stage || !steps.length) return;

      // Build progress dots
      let dots = wrap.querySelector('.camera-lock-progress');
      if (!dots) {
        dots = document.createElement('div');
        dots.className = 'camera-lock-progress';
        steps.forEach(() => dots.appendChild(document.createElement('span')));
        stage.appendChild(dots);
      }
      const dotEls = dots.children;

      const setActive = (idx) => {
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        Array.from(dotEls).forEach((d, i) => d.classList.toggle('active', i === idx));
      };
      setActive(0);

      let raf = 0;
      const update = () => {
        const r = wrap.getBoundingClientRect();
        const total = wrap.offsetHeight - window.innerHeight;
        const traveled = Math.max(0, -r.top);
        let p = total > 0 ? traveled / total : 0;
        p = Math.max(0, Math.min(1, p));
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
        setActive(idx);
        wrap.style.setProperty('--lock-progress', p.toFixed(4));
        raf = 0;
      };
      window.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* --- Ring particles (canvas) — perf-tuned, warm only --- */
  function initRingParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hosts = document.querySelectorAll('[data-ring-particles]');
    hosts.forEach((host) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'ring-particles-canvas';
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
      host.style.position = host.style.position || 'relative';
      host.appendChild(canvas);

      const ctx = canvas.getContext('2d', { alpha: true });
      let w, h, dpr, t = 0, raf = 0, visible = true;
      // Warm palette only
      const colors = ['#f74c30', '#ff7a59', '#ffb86b', '#ff8a3d', '#f7c560'];
      const RINGS = 3;
      const PARTICLES_PER_RING = 24;
      const isMobile = window.matchMedia('(max-width: 720px)').matches;
      const finalRings = isMobile ? 2 : RINGS;
      const finalPerRing = isMobile ? 14 : PARTICLES_PER_RING;

      const resize = () => {
        const rect = host.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = rect.width; h = rect.height;
        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      const particles = [];
      for (let r = 0; r < finalRings; r++) {
        for (let i = 0; i < finalPerRing; i++) {
          particles.push({
            ring: r,
            angle: (i / finalPerRing) * Math.PI * 2,
            speed: (0.0005 + r * 0.00015) * (r % 2 ? 1 : -1),
            size: 1.4 + Math.random() * 1.2,
            color: colors[(r * 2 + i) % colors.length],
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      const draw = () => {
        if (!visible) { raf = 0; return; }
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h * 0.55;
        const baseR = Math.min(w, h) * 0.18;
        const ringStep = Math.min(w, h) * 0.075;

        // Simple ring strokes (no conic gradient — much cheaper)
        ctx.lineWidth = 1;
        for (let r = 0; r < finalRings; r++) {
          ctx.strokeStyle = 'rgba(247, 76, 48, ' + (0.18 - r * 0.04) + ')';
          ctx.beginPath();
          ctx.arc(cx, cy, baseR + r * ringStep, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Particles — solid circles with shadowBlur for glow (fast)
        ctx.shadowBlur = 12;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.angle += p.speed;
          const radius = baseR + p.ring * ringStep;
          const x = cx + Math.cos(p.angle) * radius;
          const y = cy + Math.sin(p.angle) * radius;
          const pulse = 0.7 + Math.sin(t * 0.001 + p.phase) * 0.3;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = pulse;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        t += 16;
        raf = requestAnimationFrame(draw);
      };

      const start = () => { if (!raf && visible) raf = requestAnimationFrame(draw); };
      const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

      // Pause when scrolled offscreen
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            visible = e.isIntersecting;
            if (visible) start(); else stop();
          });
        }, { threshold: 0 });
        io.observe(host);
      }

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });

      start();
    });
  }

  /* --- 3D card tilt with real perspective --- */
  function initTilt3D() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.tilt-3d').forEach((el) => {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 14;
        const ry = (px - 0.5) * 14;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* --- Soft page enter animation --- */
  function initPageEnter() {
    document.body.classList.add('page-entering');
    setTimeout(() => document.body.classList.remove('page-entering'), 600);
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
