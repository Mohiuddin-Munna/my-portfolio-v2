# Mohiuddin Munna — Portfolio (v2)

Modern, fast, and SEO‑optimized portfolio with clean URLs, modular CSS/JS, Netlify Forms, and enhanced UX (theme toggle, preloader, scroll‑to‑top, cursor glow etc.).

## Features
- Clean URLs (e.g., /about, /projects)
- Modular structure: partials, pages, assets (css/js/img)
- Unified page heroes (except Home)
- Dark/Light theme with localStorage
- HUD preloader (shown once per tab)
- Sticky header + shadow on scroll
- Scroll‑to‑top button
- Cursor‑follow glow on skill cards
- SEO: canonical, Open Graph, Twitter cards, JSON‑LD (Person/Project/Breadcrumb)
- Netlify Forms (+ honeypot) and optional thanks page
- Robots.txt + Sitemap.xml
- Local dev clean‑URL fallback

## Tech
- HTML5, CSS3 (split into theme/base/components/pages), vanilla JS
- Google Fonts (Orbitron, Roboto Mono), Font Awesome
- Netlify (hosting, forms, redirects)

## Project Structure (important)

my-portfolio-v2
├─ index.html
├─ pages
│ ├─ about.html
│ ├─ projects.html
│ ├─ skills.html
│ ├─ testimonials.html
│ ├─ contact.html
│ ├─ thanks.html
│ └─ projects
│ └─ alokchhaya-high-school.html
├─ partials
│ ├─ header.html
│ └─ footer.html
├─ assets
│ ├─ css (theme.css, base.css, components.css, pages.css)
│ ├─ js (theme.js, include-partials.js, preloader.js, main.js)
│ ├─ img (avatar, projects, testimonials, ...)
│ ├─ favicons
│ ├─ fonts
│ └─ audio
├─ 404.html
├─ robots.txt
├─ sitemap.xml
├─ netlify.toml
└─ README.md


## Local Development
You can use any static server. Two options:

- VS Code Live Server (recommended for quick preview)
  - index: http://127.0.0.1:5500/
  - Clean URLs like /about typically 404 in dev. We fixed this via include-partials.js dev fallback mapping:
    - /about → /pages/about.html
    - /projects → /pages/projects.html
    - …
    - /thanks → /pages/thanks.html
- Netlify CLI (closest to production)

npm i -g netlify-cli
netlify login
netlify init # once
netlify dev # http://localhost:8888


## Build & Deploy (Netlify)
- We’re using just netlify.toml (no _headers file). Already configured:
- Pretty URL rewrites (200)
- Canonical redirects (301)
- Security headers
- Caching (immutable for assets)
- 404 fallback
- When ready:
- netlify deploy --build --prod
- Or connect repo to Netlify; it will auto-deploy on push.

## Contact Form (Netlify Forms)
- Markup already set in pages/contact.html:
- `name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field"`
- Hidden `form-name` field present.
- We chose: AJAX submit → always redirect to `/thanks` (main.js handles success redirect).
- Fallback (no JS): If you want, add `action="/thanks"` to form (optional now).
- Notifications: Netlify Dashboard → Forms → contact → Notifications.

## Thanks Page
- /thanks is a clean URL that maps to /pages/thanks.html (netlify.toml).
- Dev fallback in include-partials.js ensures /thanks works locally too.

## Clean URLs in Dev (fallback)
include-partials.js rewrites absolute links in dev (localhost/127.0.0.1/file:) so:
- /about → /pages/about.html
- /projects/alokchhaya-high-school → /pages/projects/alokchhaya-high-school.html
- /thanks → /pages/thanks.html
This avoids 404 during local development.

## SEO Checklist
- Canonical domain: https://mohiuddinmunna.netlify.app/
- Open Graph/Twitter image: assets/img/avatar/Mohiuddin-Munna.jpeg
- JSON-LD:
- Person on Home (includes sameAs placeholders)
- AboutPage, CollectionPage, BreadcrumbList on internal pages
- CreativeWork for project detail
- robots.txt and sitemap.xml at root
- After deploy:
- Add site to Google Search Console
- Submit sitemap: https://mohiuddinmunna.netlify.app/sitemap.xml

## Images
- Use webp where possible (done for project images).
- Place project assets at: assets/img/projects/<slug>/
- Provide `alt` text for accessibility and SEO.

## Adding a New Project (quick recipe)
1) Create a page under pages/projects/<slug>.html
2) Add the card in pages/projects.html (projects-showcase-grid)
3) Add images under assets/img/projects/<slug>/
4) Add JSON-LD (CreativeWork) to the new detail page
5) Update sitemap.xml (one <url> block)

## Style Notes
- Unified hero styles across all non-home pages.
- Glitch effect replaced with gradient neon headline style.
- Cursor-follow glow on `.skill-card` via CSS variables; main.js updates `--spot-x`/`--spot-y`.

## Accessibility
- Skip link in header partial
- Focus-visible outline
- Sufficient contrast in light/dark
- Descriptive alt text

## Performance Tips
- Use webp and proper dimensions
- Lazy load non-critical images (already used on many places)
- Immutable caching for assets (configured)
- Avoid heavy external scripts (we use minimal CDNs only)

## Multi-Language (Roadmap)
- Keep `lang` attr per page (currently `lang="bn"` or `en"` as you prefer)
- For i18n: plan separate /en /bn folders or JSON-driven strings
- Update hreflang and alternate links when you add locales

## Known Dev Notes
- If a direct URL like http://127.0.0.1:5500/about 404s, that’s expected on simple servers. Use the header nav (rewritten by include-partials.js) or Netlify CLI for SPA-like behaviour.
- In production, /about works via netlify.toml rewrites (status 200).

## Commands & Checks
- Lint HTML/CSS (optional): use extensions or npm tools (stylelint/htmlhint)
- Lighthouse: open Chrome DevTools → Lighthouse → Run
- Headers check:
- curl -I https://mohiuddinmunna.netlify.app/ | findstr -i cache
- curl -I https://mohiuddinmunna.netlify.app/assets/css/pages.css | findstr -i cache

## Credits
- Design & development: Mohiuddin Munna
- Icons: Font Awesome
- Hosting: Netlify

---
Happy shipping! 🚀

