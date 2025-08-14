// assets/js/main.js
// Core interactions: header/nav, sticky behavior, role typer, filters, skill bars,
// contact form (AJAX → always redirect to /thanks), on-scroll reveals, cursor glow, scroll-to-top.

(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function setCurrentYear() {
    const y = $('#currentYear');
    if (y) y.textContent = new Date().getFullYear();
  }

  // Header: keep fixed, add shadow when scrolled
  function bindHeaderInteractions() {
    const header = $('#main-header');
    const menuToggle = $('#menuToggle');
    const navLinks = $('.nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        const expanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });

      $$('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
          if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    if (header) {
      header.style.top = '0';
      const onScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        if (y > 8) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // Hero role typer (home)
  function setupRoleTyper() {
    const el = $('#role-typer');
    if (!el) return;

    const roles = [
      'Web Developer',
      'UI/UX Enthusiast',
      'Creative Coder',
      'Problem Solver',
      'Tech Alchemist'
    ];

    if (prefersReduced) {
      el.textContent = roles[0];
      const cursor = $('.cursor');
      if (cursor) cursor.style.display = 'none';
      return;
    }

    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
      const full = roles[roleIndex];
      el.textContent = isDeleting ? full.substring(0, --charIndex) : full.substring(0, ++charIndex);
      let speed = isDeleting ? 75 : 120;

      if (!isDeleting && charIndex === full.length) {
        speed = 1800; isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; speed = 500;
      }
      setTimeout(type, speed);
    }
    type();
  }

  // Project filters (projects page)
  function setupProjectFilters() {
    const container = $('.project-filters');
    const buttons = $$('.project-filters .filter-btn');
    const cards = $$('.projects-showcase-grid .project-showcase-card');

    if (!container || buttons.length === 0 || cards.length === 0) return;
    container.style.display = 'flex';

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const cats = (card.getAttribute('data-category') || '').split(/\s+/);
          card.style.display = (filterValue === 'all' || cats.includes(filterValue)) ? 'flex' : 'none';
        });
      });
    });
  }

  // Skills bars animation on view
  function setupSkillBars() {
    const bars = $$('.level-bar');
    if (bars.length === 0 || prefersReduced) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const final = bar.style.width || bar.getAttribute('data-width') || bar.getAttribute('style')?.match(/width:\s*([^;]+)/)?.[1] || '';
          if (final) {
            bar.style.transition = 'width .8s ease-out';
            bar.style.width = '0%';
            bar.getBoundingClientRect();
            bar.style.width = final;
          }
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.25 });

    bars.forEach(b => io.observe(b));
  }

  // Reveal on scroll (.animate-on-scroll)
  function setupScrollReveal() {
    const items = $$('.animate-on-scroll');
    if (items.length === 0) return;

    items.forEach(el => {
      const delay = el.getAttribute('data-delay') || '0s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity .6s ease-out ${delay}, transform .6s ease-out ${delay}`;
      el.style.willChange = 'opacity, transform';
    });

    if (prefersReduced) {
      items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'none';
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  }

  // Contact form (AJAX → always redirect to /thanks on success)
  function setupContactForm() {
    const form = $('#contactForm');
    const statusEl = $('#form-status');
    const submitBtn = $('#submitBtn');
    if (!form || !statusEl || !submitBtn) return;

    // Make sure we are NOT in pure-HTML fallback mode
    // (উপায়–১ করলে data-ajax="off" দিয়ে রেখেছিলে — সেটা এবার মুছে দাও বা off না থাকে)
    if (form.getAttribute('data-ajax') === 'off') return;

    const defaultIcon = submitBtn.querySelector('.icon-default');
    const loadingIcon = submitBtn.querySelector('.icon-loading');
    const buttonText = submitBtn.querySelector('.btn-text');

    const isNetlify = form.hasAttribute('data-netlify') || form.getAttribute('method') === 'POST';

    function setLoading(on) {
      submitBtn.disabled = on;
      if (defaultIcon) defaultIcon.style.display = on ? 'none' : 'inline-block';
      if (loadingIcon) loadingIcon.style.display = on ? 'inline-block' : 'none';
      if (buttonText) buttonText.textContent = on ? 'Transmitting...' : 'Send_Signal_';
    }
    function setStatus(msg, type = '') {
      statusEl.textContent = msg;
      statusEl.className = `form-status-message ${type}`;
    }
    function encodeFormData(fd) {
      const params = new URLSearchParams();
      for (const [k, v] of fd.entries()) params.append(k, v);
      return params.toString();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // we’ll handle it via fetch

      setStatus('');
      setLoading(true);

      const fd = new FormData(form);

      // Honeypot
      if (fd.get('bot-field')) {
        setLoading(false);
        return setStatus('Spam detected.', 'error');
      }

      try {
        if (isNetlify) {
          const name = fd.get('form-name') || form.getAttribute('name') || 'contact';
          if (!fd.get('form-name')) fd.append('form-name', name);

          const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encodeFormData(fd)
          });

          if (res.ok) {
            // Always redirect to /thanks
            window.location.assign('/thanks');
            return;
          } else {
            setStatus(`Transmission_Error (Netlify). Status: ${res.status}`, 'error');
          }
        } else {
          // Custom endpoint (if you set data-endpoint)
          const endpoint = form.getAttribute('data-endpoint') || '';
          if (!endpoint) {
            setStatus('No endpoint configured. Enable Netlify Forms or set data-endpoint.', 'error');
          } else {
            const payload = {};
            fd.forEach((v, k) => (payload[k] = v));
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              window.location.assign('/thanks'); // redirect on success
              return;
            } else {
              setStatus(`Transmission_Error. Status: ${res.status}`, 'error');
            }
          }
        }
      } catch (err) {
        console.error('Form submission error:', err);
        setStatus('Network_Failure. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  // Smooth scroll for internal anchors
  function setupSmoothAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // Cursor-follow glow on .skill-card (sets CSS vars)
  function setupCursorSpotOnSkillCards() {
    const cards = $$('.skill-card');
    if (cards.length === 0) return;

    cards.forEach(card => {
      let raf = 0;
      let pendingX = null, pendingY = null;

      function updateVars() {
        raf = 0;
        if (pendingX == null || pendingY == null) return;
        card.style.setProperty('--spot-x', pendingX + 'px');
        card.style.setProperty('--spot-y', pendingY + 'px');
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        pendingX = e.clientX - rect.left;
        pendingY = e.clientY - rect.top;
        if (!raf) raf = requestAnimationFrame(updateVars);
      });
    });
  }

  // Scroll-To-Top button
  function setupScrollToTop() {
    if (prefersReduced) return;

    if (!$('#scrollTopStyles')) {
      const style = document.createElement('style');
      style.id = 'scrollTopStyles';
      style.textContent = `
      .scroll-top-btn{
        position: fixed; right: 22px; bottom: 24px; z-index: 1100;
        width: 46px; height: 46px; border-radius: 50%;
        display: grid; place-items: center;
        background: var(--accent-primary); color: var(--bg-color);
        border: 2px solid var(--accent-primary);
        box-shadow: 0 8px 20px rgba(var(--accent-primary-rgb,0,240,255), .25);
        transition: opacity .25s ease, transform .25s ease, background .2s, color .2s, border-color .2s;
        opacity: 0; transform: translateY(12px); pointer-events: none;
      }
      .scroll-top-btn:hover{
        background: transparent; color: var(--accent-primary);
      }
      .scroll-top-btn.show{ opacity: 1; transform: translateY(0); pointer-events: auto; }
      `;
      document.head.appendChild(style);
    }

    if (!$('.scroll-top-btn')) {
      const btn = document.createElement('button');
      btn.className = 'scroll-top-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
      document.body.appendChild(btn);

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      });

      const onScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        if (y > 500) btn.classList.add('show');
        else btn.classList.remove('show');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    bindHeaderInteractions();
    setupRoleTyper();
    setupProjectFilters();
    setupSkillBars();
    setupScrollReveal();
    setupContactForm();
    setupSmoothAnchors();
    setupCursorSpotOnSkillCards();
    setupScrollToTop();
  });

  // Re-bind after partials loaded
  document.addEventListener('partials:loaded', () => {
    setCurrentYear();
    bindHeaderInteractions();
    setupScrollToTop();
  });
})();