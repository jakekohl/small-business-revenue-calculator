# Business Projector

A local web app for projecting small-business growth from revenue opportunities, upsells, and monthly expenses.

```bash
npm install
npm run dev
```

Numbers save in the browser. Use Export / Import to keep a JSON backup.

## End-to-end tests

Regression tests run against a production build on [http://127.0.0.1:4173](http://127.0.0.1:4173):

```bash
npm run test:e2e
```

Open the Cypress app against the same preview server:

```bash
npm run test:e2e:open
```

## Cypress Cloud

CI records runs to [Cypress Cloud](https://cloud.cypress.io) from `.github/workflows/cypress.yml`.

1. Create a project at [Cypress Cloud](https://cloud.cypress.io).
2. Copy `.env.example` to `.env` and set `CYPRESS_PROJECT_ID` and `CYPRESS_RECORD_KEY` (`.env` is gitignored).
3. Add the same values as GitHub Actions secrets `CYPRESS_PROJECT_ID` and `CYPRESS_RECORD_KEY`.

Until those two values exist, the recorded GitHub Action job will fail on purpose so Cloud is not skipped silently.

## AI contributors

Coding-agent conventions live in [`AGENTS.md`](./AGENTS.md). That file is the source of truth for Cursor, GitHub Copilot, Claude Code, Gemini CLI, and other tools. Vendor-specific files only point at it — add new rules there, not in a tool folder.
