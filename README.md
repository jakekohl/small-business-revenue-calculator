# Business Projector

A local web app for projecting small-business growth from revenue opportunities, upsells, and expenses (monthly or scheduled).

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

## AI contributors

Coding-agent conventions live in [`AGENTS.md`](./AGENTS.md). That file is the source of truth for Cursor, GitHub Copilot, Claude Code, Gemini CLI, and other tools. Vendor-specific files only point at it — add new rules there, not in a tool folder.
