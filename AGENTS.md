# Agent instructions

This repo is **Business Projector**, a local Vue 3 app for projecting small-business revenue, upsells, and expenses (monthly or on a due month).

This file is the **single source of truth** for coding agents. Vendor files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules`, `.gemini/settings.json`) only point here. Put new conventions in this file, not in a tool-specific folder.

## Commands

- Install: `npm install` (Node 22, matching CI)
- Dev: `npm run dev`
- Production preview (E2E target): `npm run preview` → http://127.0.0.1:4173
- E2E (build + preview + Cypress): `npm run test:e2e`
- E2E UI: `npm run test:e2e:open`

After UI or Cypress changes, run `npm run test:e2e` and fix failures before finishing.

## Stack

- Vue 3 (`<script setup>`) + Vite
- PrimeVue 4 + Aura theme (teal preset in `src/main.js`)
- Pinia store in `src/stores/projection.js` (persists to `localStorage` key `inc-exp-calc-projection`)
- Projection math in `src/utils/projectionMath.js` — do not duplicate it in components
- Sample / empty / normalize factories in `src/utils/sampleData.js`

Prefer existing PrimeVue components and APIs (`Button`, `InputNumber`, `Select`, `DataTable`, `Drawer`, `Tag`, `pt` passthrough, confirmation/toast services) before custom markup or one-off widgets.

## Saved data (backwards compatibility)

Plans persist in `localStorage` (`inc-exp-calc-projection`) and as exported JSON. A new change must still load those older files — never ship an update that makes existing data fail.

- Put compatibility in `normalizeProjection` / `createRevenue` / `createUpsell` / `createExpense` in `src/utils/sampleData.js` (and helpers such as `normalizeExpenseFrequency`). Do not require new fields in the UI or store.
- New fields need defaults in the create* factories **and** in normalize* so missing keys from old saves and imports still work.
- Renames: read the old key in normalize and write the new shape. Do not unload old files.
- Do not change the meaning of existing numbers without a normalize migration (for example annual → monthly).
- Never wipe or ignore `localStorage` because the schema grew.
- When the saved shape changes, add a Cypress fixture in the **old** shape and import it. `cypress/fixtures/projection.json` already omits newer expense fields on purpose.

## Layout

- `src/components/` — editors, KPIs, charts, spreadsheet, changelog drawer
- `src/data/` — changelog notes and GitHub repo links
- `cypress/e2e/` — one user-story spec per file
- `cypress/support/commands/` — reusable Cypress commands (`app`, `forms`, `select`, `assert`)

## `data-test` attributes

Every control tests click, type, or assert must have a `data-test` attribute.

- kebab-case, role-first: `hero-export`, `revenue-price`, `kpi-monthly-profit`
- no indexes in the attribute (`revenue-name`, not `revenue-name-0`)
- repeated rows share one name (`revenue-card`, `expense-row`, `upsell-row`, `changelog-entry`); Cypress commands pick the row
- nested fields keep the same names inside each row (`revenue-name` inside `revenue-card`)
- put `data-test` on the PrimeVue component so it falls through to the root
- teleported PrimeVue UI (Toast, ConfirmDialog, Select overlay, Drawer) gets `data-test` through `pt`

When you add or change interactive UI, add or update the matching `data-test` in the same change.

## Cypress

- Specs live in `cypress/e2e/*.cy.js` and follow one user story per file
- Specs must go through `cypress/support/commands` (plus assertions). Do not use `.p-button`, `[data-pc-name]`, or other PrimeVue internals in `*.cy.js`
- Select with `data-test` only. Repeated rows: `revenueCard`, `expenseRow`, `upsellRow`, `sheetRowByLabel`, or `changelogEntry`
- Prefer many assertions on a short path over extra specs (chrome, KPIs, toasts, dialogs, sheet lines)
- Put new reusable steps in `cypress/support/commands`, not in the spec
- Clear/seed `inc-exp-calc-projection` via `cy.visitApp()` so runs do not leak
- Cypress Cloud IDs live in `.env` (`CYPRESS_PROJECT_ID`, `CYPRESS_RECORD_KEY`). Copy `.env.example`; never commit `.env`

## Changelog

The star on the right edge opens a PrimeVue `Drawer` fed by `src/data/changelog.js`. That file is the list for **this running build** — do not fetch GitHub at runtime (the app is local, should work offline, and PR titles are often too technical).

For each **user-visible** feature or bugfix, prepend one short note in the same PR and link to GitHub for details:

```js
{
  date: '2026-09-11', // YYYY-MM-DD
  type: 'feature', // or 'bug'
  title: 'Short owner-facing name',
  summary: 'One sentence of what they can do now.',
  pr: 12, // GitHub PR number when known; omit if not
}
```

- Newest entry first. Do not rewrite or delete older notes.
- Skip `chore`, docs-only, and test-only work unless the owner would notice it in the app.
- Write titles and summaries for the business owner, not commit-message voice.
- Set `pr` when you know the pull request number so the row can link to GitHub. If the number is not known yet, omit `pr` — the drawer footer still links to merged PRs.

## Git

Commit subject prefix is `chore`, `bug`, or `feature`, then a short why:

- `feature: added Cypress user-story coverage for import`
- `bug: updated blank-plan confirm to avoid stale KPIs`
- `chore: wired Cypress Cloud project id`

Do not commit secrets, record keys, or `cypress/videos|screenshots|downloads`.
