// Dark/Light theme handling with localStorage + toggle button binding.
// Works even when header loads via partials (listens for 'partials:loaded').

(() => {
  const STORAGE_KEY = 'portfolioTheme'; // keep same key as old project
  const COLOR_DARK = '#0d0d1a';
  const COLOR_LIGHT = '#e8e8f5';

  function applyTheme(mode) {
    const body = document.body;
    if (!body) return;

    if (mode === 'light') {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      mode = 'dark'; // normalize
    }

    try { localStorage.setItem(STORAGE_KEY, mode); } catch (_) {}

    // Update meta theme-color if present (mobile address bar color)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? COLOR_LIGHT : COLOR_DARK);

    // Notify listeners
    document.dispatchEvent(new CustomEvent('theme:change', { detail: { mode } }));
  }

  function detectPreferredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}

    // Fallback: respect OS if no saved theme; default to dark
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  function bindToggle() {
    const btn = document.getElementById('darkModeToggle');
    if (!btn) return false;

    btn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-mode');
      applyTheme(isLight ? 'dark' : 'light');
    });
    return true;
  }

  // Initialize as soon as DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // If body has default class from HTML, keep it unless saved theme differs.
    const mode = detectPreferredTheme();
    applyTheme(mode);

    // Try to bind now; if header is injected later via partials, bind then.
    if (!bindToggle()) {
      document.addEventListener('partials:loaded', () => bindToggle(), { once: true });
    }
  });
})();