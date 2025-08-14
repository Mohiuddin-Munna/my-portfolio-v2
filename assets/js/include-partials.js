// assets/js/include-partials.js
/*
  Partials include (header/footer) + active nav + clean-URL dev fallback.

  Usage in pages:
    <div data-include="/partials/header.html"></div>
    ... content ...
    <div data-include="/partials/footer.html"></div>

  Include in <head>:
    <script src="/assets/js/include-partials.js" defer></script>
*/

(() => {
  function normalizePath(p) {
    if (!p) return '/';
    const u = new URL(p, location.origin);
    let path = u.pathname;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path === '/index.html') path = '/';
    return path || '/';
  }

  // Active nav matching (clean + file paths)
  const aliasMap = {
    '/': ['/', '/index.html'],
    '/about': ['/about', '/pages/about.html'],
    '/projects': ['/projects', '/pages/projects.html'],
    '/skills': ['/skills', '/pages/skills.html'],
    '/testimonials': ['/testimonials', '/pages/testimonials.html'],
    '/contact': ['/contact', '/pages/contact.html'],
    '/projects/alokchhaya-high-school': [
      '/projects/alokchhaya-high-school',
      '/pages/projects/alokchhaya-high-school.html'
    ],
    '/thanks': ['/thanks', '/pages/thanks.html'] // NEW: for dev/local active-state and rewriting
  };

  async function includeNode(node) {
    const src = node.getAttribute('data-include');
    if (!src) return;
    try {
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      node.outerHTML = html;
    } catch (err) {
      console.error('Partial include failed:', src, err);
      node.outerHTML = `
        <div role="alert" style="padding:12px;border:1px dashed #888;color:#888;background:#111;">
          Failed to load: ${src}
        </div>`;
    }
  }

  function isMatch(current, linkPath) {
    if (current === linkPath) return true;
    const aliases = aliasMap[linkPath];
    return Array.isArray(aliases) ? aliases.includes(current) : false;
  }

  function setActiveNav() {
    const current = normalizePath(location.pathname);
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(a => {
      const hrefAttr = a.getAttribute('href') || '/';
      const hrefPath = normalizePath(hrefAttr);
      if (isMatch(current, hrefPath)) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  }

  // DEV fallback: rewrite clean URLs → file paths on localhost/127.0.0.1/file:
  function enableDevCleanUrlFallback() {
    const DEV = location.protocol === 'file:' ||
                location.hostname === '127.0.0.1' ||
                location.hostname === 'localhost';
    if (!DEV) return;

    const map = {
      '/': '/index.html',
      '/about': '/pages/about.html',
      '/projects': '/pages/projects.html',
      '/skills': '/pages/skills.html',
      '/testimonials': '/pages/testimonials.html',
      '/contact': '/pages/contact.html',
      '/projects/alokchhaya-high-school': '/pages/projects/alokchhaya-high-school.html',
      '/thanks': '/pages/thanks.html' // NEW: ensure /thanks works in dev
    };

    // Rewrite header/nav anchors (and any absolute anchors) to file paths
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(a => {
      try {
        const raw = a.getAttribute('href');
        const u = new URL(raw, location.origin);
        let path = u.pathname;
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        const hash = u.hash || '';
        const mapped = map[path || '/'];
        if (mapped) {
          a.setAttribute('data-clean-href', raw);
          a.setAttribute('href', mapped + hash);
        }
      } catch (e) {
        // ignore parse errors
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const targets = Array.from(document.querySelectorAll('[data-include]'));
    if (targets.length) {
      await Promise.all(targets.map(includeNode));
    }
    requestAnimationFrame(() => {
      enableDevCleanUrlFallback(); // local dev mapping
      try { setActiveNav(); } catch (e) { console.warn('setActiveNav error', e); }
      document.dispatchEvent(new CustomEvent('partials:loaded'));
    });
  });
})();