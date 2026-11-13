# Visual QA evidence

`visual-report-preview.json` is the latest production-build preview run (Astro preview at `127.0.0.1:4322`); `visual-report-dev.json` preserves the preceding development-server run. `visual-report.json` is the most recent run and may be replaced by `pnpm qa:visual`.

The 18 screenshots under `screenshots/` cover these six pages at each size:

- `390x844` — mobile
- `768x1024` — tablet
- `1440x900` — desktop

Run again with a local server already running using `pnpm qa:visual`. Set `BASE_URL` to an Astro preview URL to exercise the production build. The script starts a fresh Playwright Chromium context, captures network/console errors, checks responsive navigation and layout, and does not log in to Admin or mutate CMS data.

Empty states are expected for Projects, Blog, and Contact until owner-approved content is added. There are no image entries in the current local seed, so image validation did not exercise a real EmDash media object.
