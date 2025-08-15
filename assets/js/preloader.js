// HUD-style preloader: shows once per tab (session), supports ?nohud=1 & prefers-reduced-motion.
// Uses avatar: /assets/img/avatar/munna-avatar.webp
// Gate support: if HEAD-এ <style id="hud-gate-css"> + <html class="hud-gate"> দেওয়া থাকে,
// এই স্ক্রিপ্ট finish/skip হলে গেট খুলে দেয়, তাই কনটেন্ট ফ্ল্যাশ হবে না।

(() => {
  var KEY = 'hudShown';
  var MIN_TIME = 900;     // minimally visible time (ms)
  var FORCE_HIDE = 4000;  // safety timeout (ms)
  var IMG = '/assets/img/avatar/munna-avatar.webp';
  var ALT = 'Mohiuddin Munna';

  // Preload avatar ASAP so it shows instantly inside the HUD
  (function preloadAvatar() {
    try {
      var l = document.createElement('link');
      l.rel = 'preload';
      l.as = 'image';
      l.href = IMG;
      l.setAttribute('fetchpriority', 'high');
      if (document.head) document.head.appendChild(l);
    } catch (_) {}
  })();

  // Small helpers (old-browser safe; no optional chaining)
  function removeGate() {
    try {
      var html = document.documentElement;
      if (html) html.classList.remove('hud-gate');
    } catch (_) {}
    try {
      var gateStyle = document.getElementById('hud-gate-css');
      if (gateStyle && gateStyle.parentNode) gateStyle.parentNode.removeChild(gateStyle);
    } catch (_) {}
    // extra retry next tick (some browsers reflow late)
    setTimeout(function () {
      try {
        var html2 = document.documentElement;
        if (html2) html2.classList.remove('hud-gate');
      } catch (_) {}
      try {
        var gateStyle2 = document.getElementById('hud-gate-css');
        if (gateStyle2 && gateStyle2.parentNode) gateStyle2.parentNode.removeChild(gateStyle2);
      } catch (_) {}
    }, 0);
  }
  function unlockScroll() {
    try {
      if (document.body) document.body.classList.remove('hud-noscroll');
    } catch (_) {}
  }
  function safeSetSession(key, val) {
    try { sessionStorage.setItem(key, val); } catch (_) {}
  }
  function safeGetSession(key) {
    try { return sessionStorage.getItem(key); } catch (_) { return null; }
  }

  // Skip via query string
  var qs;
  try { qs = new URLSearchParams(location.search); } catch (_) {}
  if (qs && qs.has('nohud')) {
    safeSetSession(KEY, '1');
    removeGate();
    return;
  }

  // Respect reduced motion
  var prefersReduced = false;
  try {
    prefersReduced = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (_) {}
  if (prefersReduced) {
    safeSetSession(KEY, '1');
    removeGate();
    return;
  }

  try {
    // Already shown in this tab?
    if (safeGetSession(KEY) === '1') {
      removeGate();
      return;
    }

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'hud-preloader';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = ''
      + '<div class="hud-wrap" role="status" aria-live="polite">'
      + '  <div class="hud-core">'
      + '    <div class="hud-ring-dashed"></div>'
      + '    <div class="hud-ring"></div>'
      + '    <div class="hud-hex">'
      + '      <div class="hud-hex-inner">'
      + '        <img class="hud-avatar" src="' + IMG + '" alt="' + ALT + '" fetchpriority="high" decoding="async" />'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '  <p class="hud-text">Calibrating interface</p>'
      + '  <div class="hud-progress" aria-label="Loading progress">'
      + '    <span class="hud-progress-fill"></span>'
      + '  </div>'
      + '  <div class="hud-percent"><span>0</span>%</div>'
      + '  <div class="hud-scan"></div>'
      + '</div>';

    function mount() {
      if (!document.body) return;
      document.body.appendChild(overlay);
      document.body.classList.add('hud-noscroll');
      // IMPORTANT: overlay লাগার সাথে সাথেই gate খুলে দেই,
      // যাতে overlay ফেড হলে কন্টেন্ট দেখা যায় (mobile black screen fix).
      removeGate();
    }

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });

    // Mark as shown (avoid multiple shows in this tab)
    safeSetSession(KEY, '1');

    // Simulated progress
    var fill = overlay.querySelector('.hud-progress-fill');
    var pct  = overlay.querySelector('.hud-percent span');
    var progress = 0;

    function setProgress(p) {
      progress = Math.max(0, Math.min(100, p));
      if (fill) fill.style.width = progress + '%';
      if (pct)  pct.textContent = Math.round(progress);
    }

    var sim = setInterval(function () {
      if (progress < 88) {
        setProgress(progress + Math.max(1, (88 - progress) * 0.08));
      } else if (progress < 96) {
        setProgress(progress + 0.5);
      }
    }, 70);

    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      clearInterval(sim);

      // Ensure gate is definitely removed (mobile safety)
      removeGate();

      var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      var elapsed = now - t0;
      var wait = Math.max(0, MIN_TIME - elapsed);

      setTimeout(function () {
        var t = setInterval(function () {
          if (progress >= 100) {
            clearInterval(t);
            try { overlay.classList.add('hud-fade'); } catch (_) {}
            removeGate(); // double safety
            setTimeout(function () {
              try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (_) {}
              unlockScroll();
            }, 350);
          } else {
            setProgress(progress + Math.max(2, (100 - progress) * 0.2));
          }
        }, 28);
      }, wait);
    }

    // Hide on DOM ready (no need to wait for full window load)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', finish, { once: true });
    } else {
      finish();
    }

    // Safety timeout: never get stuck
    setTimeout(function () {
      try { overlay.classList.add('hud-fade'); } catch (_) {}
      removeGate();
      setTimeout(function () {
        try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (_) {}
        unlockScroll();
      }, 350);
    }, FORCE_HIDE);

    // Extra safety: on window load and after 1s ensure gate is gone
    window.addEventListener('load', removeGate);
    setTimeout(removeGate, 1000);

    // Debug/manual escape
    window.__hideHUD = finish;
    window.addEventListener('keydown', function (e) {
      if (e && e.key === 'Escape') finish();
    });
  } catch (e) {
    try { console.error('HUD preloader error:', e); } catch (_) {}
    // Clean up and show content
    try {
      var hud = document.getElementById('hud-preloader');
      if (hud && hud.parentNode) hud.parentNode.removeChild(hud);
    } catch (_) {}
    unlockScroll();
    removeGate();
  }
})();