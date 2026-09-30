# QA Assignment — Playwright + TypeScript

UI and API test suite covering both parts of the assignment:

- **Part 1 — UI** against [saucedemo.com](https://www.saucedemo.com), Chromium
- **Part 2 — API** against [reqres.in](https://reqres.in), via Playwright's
  `request` fixture (no browser)

## Install

```bash
npm install
npx playwright install chromium
```

No `.env` file is required. Copy `.env.example` to `.env` only to point the
suite at a different base URL.

## Run

```bash
npx playwright test      # everything — 20 tests, ~13s

npm run test:ui          # Part 1 only (UI)
npm run test:api         # Part 2 only (API, no browser)
npm run test:headed      # watch the UI tests drive the browser
npm run ui-mode          # Playwright UI mode, best for debugging
npm run report           # open the HTML report from the last run
npm run typecheck        # tsc --noEmit
```

A single file or a single test:

```bash
npx playwright test tests/ui/checkout.spec.ts
npx playwright test -g "places an order end to end"
```

## Watching the tests run

Tests run headless by default. To see the browser:

```bash
npm run test:headed                                    # visible Chromium
npm run ui-mode                                        # test explorer, live pane + timeline
npx playwright test --project=ui --debug -g "badge"    # step through with the Inspector
```

Add `--workers=1` to `--headed` if you want one window at a time rather than five.

## Video recording

Video is **off by default** so ordinary runs stay light. Ask for it on the
command line:

```bash
VIDEO=on npx playwright test --project=ui      # record every UI test
VIDEO=failed npx playwright test               # keep the recording only on failure
npm run test:video                             # shorthand for VIDEO=on
```
