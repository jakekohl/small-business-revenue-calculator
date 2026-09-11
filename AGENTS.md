# Agent instructions

This repo is **Business Projector**, a local Vue 3 app for projecting small-business revenue, upsells, and monthly expenses.

## Stack

- Vue 3 (`<script setup>`) + Vite
- PrimeVue 4 + Aura theme (see `src/main.js`)
- Pinia store in `src/stores/projection.js`
- Projection math in `src/utils/projectionMath.js`

Prefer existing PrimeVue components and APIs (`Button`, `InputNumber`, `Select`, `DataTable`, `pt` passthrough, confirmation/toast services) before custom markup or one-off widgets.

## `data-test` attributes

Every control tests click, type, or assert must have a `data-test` attribute.

- kebab-case, role-first: `hero-export`, `revenue-price`, `kpi-monthly-profit`
- no indexes in the attribute (`revenue-name`, not `revenue-name-0`)
- repeated rows share one name (`revenue-card`, `expense-row`, `upsell-row`); Cypress commands pick the row
- nested fields keep the same names inside each row (`revenue-name` inside `revenue-card`)
- teleported PrimeVue UI (Toast, ConfirmDialog, Select overlay) gets `data-test` through `pt`

When you add or change interactive UI, add or update the matching `data-test` in the same change.

## Cypress

- Specs live in `cypress/e2e/*.cy.js` and follow one user story per file
- Specs must go through `cypress/support/commands` (plus assertions). Do not put one-off `cy.get('.p-button')` or PrimeVue internal selectors in `*.cy.js`
- Prefer many assertions on a short path over extra specs
- Clear/seed `inc-exp-calc-projection` via `cy.visitApp()` so runs do not leak
- Run locally with `npm run test:e2e` (build + preview + Cypress) or `npm run test:e2e:open`
- Cypress Cloud IDs live in `.env` (`CYPRESS_PROJECT_ID`, `CYPRESS_RECORD_KEY`). Copy `.env.example`; never commit `.env`.

## Git

Commit subject prefix is `chore`, `bug`, or `feature`, then a short why:

- `feature: added Cypress user-story coverage for import`
- `bug: updated blank-plan confirm to avoid stale KPIs`
- `chore: wired Cypress Cloud project id`

Do not commit secrets, record keys, or `cypress/videos|screenshots|downloads`.
