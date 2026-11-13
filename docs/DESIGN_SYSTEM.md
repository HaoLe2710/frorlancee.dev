# Design system

## Direction

The current site is a Vietnamese service portfolio with a clear blue-and-navy identity. Keep content and work samples as the main focus. This document describes the current files, not a request to restyle them.

## Tokens and typography

Visual overrides live in `src/styles/theme.css`; `src/styles/tokens.css` contains EmDash template defaults. Current theme values include:

| Token | Current value |
|---|---|
| Background | `#ffffff` |
| Text | `#0f172a` |
| Navy | `#0b1e35` |
| Blue accent | `#00a8f5` |
| Surface | `#f8fafc` |
| Border | `#e2e8f0` |
| Body font | `var(--font-heading), Inter, ui-sans-serif, system-ui, sans-serif` |

`astro.config.mjs` loads **Be Vietnam Pro** into `--font-heading`; headings use that variable. `theme.css` also maps the body font to it. The theme is light-only (`color-scheme: light`). Adjust tokens in `theme.css` for future visual changes; do not modify generated or EmDash-owned files to tune the public site.

## Layout and components

- `.shell`, `.header-shell`, and `.footer-shell` set a centered content column up to 1216px.
- Responsive navigation switches at 800px; footer and content grids also collapse at narrower breakpoints.
- Buttons, section headings, service cards, project/article cards, empty states, breadcrumbs, and contact calls to action are in `src/components/`.
- Focus-visible links and controls use the blue accent. The mobile menu supports click, Escape, and closing after following a navigation link.
- Images in content use the EmDash media object through `<Image>` from `emdash/ui`.

## Current QA coverage

Playwright screenshots cover 390×844, 768×1024, and 1440×900 on Home, Services, Projects, Blog, About, and Contact. Visual review found no clipping or layout break in the sampled home and services screenshots. The local seed has no published project/post/contact records or media, so those empty states are intentional and image rendering with real CMS media remains unverified.

See `docs/qa/README.md` for screenshots and machine-readable results.
