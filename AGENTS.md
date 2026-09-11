# Agent instructions

This repo is **Business Projector**, a local Vue 3 app for projecting small-business revenue, upsells, and monthly expenses.

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

Prefer existing PrimeVue components and APIs (`Button`, `InputNumber`, `Select`, `DataTable`, `pt` passthrough, confirmation/toast services) before custom markup or one-off widgets.

## Layout

- `src/components/` — editors, KPIs, charts, spreadsheet
- `cypress/e2e/` — one user-story spec per file
- `cypress/support/commands/` — reusable Cypress commands (`app`, `forms`, `select`, `assert`)

## `data-test` attributes

Every control tests click, type, or assert must have a `data-test` attribute.

- kebab-case, role-first: `hero-export`, `revenue-price`, `kpi-monthly-profit`
- no indexes in the attribute (`revenue-name`, not `revenue-name-0`)
- repeated rows share one name (`revenue-card`, `expense-row`, `upsell-row`); Cypress commands pick the row
- nested fields keep the same names inside each row (`revenue-name` inside `revenue-card`)
- put `data-test` on the PrimeVue component so it falls through to the root
- teleported PrimeVue UI (Toast, ConfirmDialog, Select overlay) gets `data-test` through `pt`

When you add or change interactive UI, add or update the matching `data-test` in the same change.

## Cypress

- Specs live in `cypress/e2e/*.cy.js` and follow one user story per file
- Specs must go through `cypress/support/commands` (plus assertions). Do not use `.p-button`, `[data-pc-name]`, or other PrimeVue internals in `*.cy.js`
- Select with `data-test` only. Repeated rows: `revenueCard`, `expenseRow`, `upsellRow`, or `sheetRowByLabel`
- Prefer many assertions on a short path over extra specs (chrome, KPIs, toasts, dialogs, sheet lines)
- Put new reusable steps in `cypress/support/commands`, not in the spec
- Clear/seed `inc-exp-calc-projection` via `cy.visitApp()` so runs do not leak
- Cypress Cloud IDs live in `.env` (`CYPRESS_PROJECT_ID`, `CYPRESS_RECORD_KEY`). Copy `.env.example`; never commit `.env`

## Git

Commit subject prefix is `chore`, `bug`, or `feature`, then a short why:

- `feature: added Cypress user-story coverage for import`
- `bug: updated blank-plan confirm to avoid stale KPIs`
- `chore: wired Cypress Cloud project id`

Do not commit secrets, record keys, or `cypress/videos|screenshots|downloads`.
