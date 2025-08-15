// HUD-style preloader: shows once per tab (session), supports ?nohud=1 & prefers-reduced-motion.
// Uses avatar: /assets/img/avatar/munna-avatar.webp
// Gate support: if HEAD-এ <style id="hud-gate-css"> + <html class="hud-gate"> দেওয়া থাকে,
// এই স্ক্রিপ্ট finish/skip হলে গেট খুলে দেয়, তাই কনটেন্ট ফ্ল্যাশ হবে না।

(() => {
  const KEY = 'hudShown';
  const MIN_TIME = 900;      // minimally visible time (ms)
  const FORCE_HIDE = 4000;   // safety timeout (ms)
  const IMG = '/assets/img/avatar/munna-avatar.webp';
  const ALT = 'Mohiuddin Munna';

  // Small helpers
  const removeGate = () => {
    try { document.documentElement.classList.remove('hud-gate'); } catch(_) {}
    try { document.getElementById('hud-gate-css')?.remove(); } catch(_) {}
  };
  const unlockScroll = () => { try { document.body.classList.remove('hud-noscroll'); } catch(_) {} };

  // Skip via query string
  const qs = new URLSearchParams(location.search);
  if (qs.has('nohud')) {
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
    // gate থাকলে খুলে দেই, যেন কনটেন্ট দেখায়
    removeGate();
    return;
  }

  // Respect reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
    removeGate();
    return;
  }

  try {
    // Already shown in this tab?
    if (sessionStorage.getItem(KEY) === '1') {
      removeGate();
      return;
    }

    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'hud-preloader';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="hud-wrap" role="status" aria-live="polite">
        <div class="hud-core">
          <div class="hud-ring-dashed"></div>
          <div class="hud-ring"></div>
          <div class="hud-hex">
            <div class="hud-hex-inner">
              <img class="hud-avatar" src="${IMG}" alt="${ALT}" />
            </div>
          </div>
        </div>
        <p class="hud-text">Calibrating interface</p>
        <div class="hud-progress" aria-label="Loading progress">
          <span class="hud-progress-fill"></span>
        </div>
        <div class="hud-percent"><span>0</span>%</div>
        <div class="hud-scan"></div>
      </div>
    `;

    function mount() {
      document.body.appendChild(overlay);
      document.body.classList.add('hud-noscroll');
    }

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });

    // Mark as shown (avoid multiple shows in this tab)
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}

    // Simulated progress
    const fill = overlay.querySelector('.hud-progress-fill');
    const pct  = overlay.querySelector('.hud-percent span');
    let progress = 0;

    function setProgress(p) {
      progress = Math.max(0, Math.min(100, p));
      if (fill) fill.style.width = progress + '%';
      if (pct)  pct.textContent = Math.round(progress);
    }

    const sim = setInterval(() => {
      if (progress < 88) {
        setProgress(progress + Math.max(1, (88 - progress) * 0.08));
      } else if (progress < 96) {
        setProgress(progress + 0.5);
      }
    }, 70);

    const t0 = performance.now();
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      clearInterval(sim);

      const elapsed = performance.now() - t0;
      const wait = Math.max(0, MIN_TIME - elapsed);

      setTimeout(() => {
        const t = setInterval(() => {
          if (progress >= 100) {
            clearInterval(t);
            // Fade the HUD, then remove; gate খুলে দিই যেন কনটেন্ট পেইন্ট হয়
            overlay.classList.add('hud-fade');
            removeGate();
            setTimeout(() => {
              try { overlay.remove(); } catch (_) {}
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

    // Safety timeout
    setTimeout(() => {
      // Ensure gate/HUD never gets stuck
      try { overlay.classList.add('hud-fade'); } catch(_) {}
      removeGate();
      setTimeout(() => {
        try { overlay.remove(); } catch(_) {}
        unlockScroll();
      }, 350);
    }, FORCE_HIDE);

    // Debug/manual escape
    window.__hideHUD = finish;
    window.addEventListener('keydown', e => { if (e.key === 'Escape') finish(); });
  } catch (e) {
    console.error('HUD preloader error:', e);
    try { document.getElementById('hud-preloader')?.remove(); } catch(_) {}
    unlockScroll();
    removeGate();
  }
})();