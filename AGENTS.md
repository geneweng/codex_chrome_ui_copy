# Repository Guidelines

## Project Structure & Module Organization
- `index.html`, `styles.css`, `app.js`: static UI shell and client-side data loader. Keep markup semantic and leave hooks (`id`/`data-*` attributes) intact for JS updates.
- `server/`: Express API written in Node (ES modules). `src/server.js` defines routes, `src/mappers.js` shapes DB results, `src/db.js` owns the connection pool. `.env` is ignored—copy `.env.example` when configuring environments.
- `db/`: `schema.sql` installs PostGIS tables; `seed.sql` backfills demo data. Run these via `psql` after enabling the extensions.
- `media/`: intentionally empty; use as local storage for uploaded assets. Do not commit binaries.

## Build, Test, and Development Commands
- `npm install` (inside `server/`): install API dependencies.
- `npm run dev` (inside `server/`): start Express with live reload (`node --watch`).
- `npx serve .` (repo root) or any static file server: preview the front end.
- `psql -d viewpoint_explorer -f db/schema.sql` then `db/seed.sql`: bootstrap database tables and sample data.

## Coding Style & Naming Conventions
- JavaScript/Node: 2-space indentation, ES modules, camelCase for functions/variables, PascalCase for classes. Favor descriptive function names (`populateLatest`, not `load2`).
- SQL: uppercase keywords, snake_case identifiers. UUID primary keys.
- CSS: BEM-like class names only where necessary; leverage CSS variables defined in `:root`.

## Testing Guidelines
- No automated test suite yet. When adding one, colocate under `server/tests/` using Jest or Vitest. Mirror route names (e.g., `viewpoints.test.js`).
- Manual smoke tests: hit `GET /health`, `GET /api/viewpoints`, `GET /api/viewpoints/:id`. Confirm sidebar filters switch datasets in the UI.

## Commit & Pull Request Guidelines
- Follow imperative commit messages seen in history (`Enable sidebar filters`, `Wire front end to API`). Keep scope focused; one logical change per commit.
- Pull requests should include: purpose summary, test steps (e.g., `npm run dev`, `psql ...`), screenshots/GIFs for UI tweaks, and linked issues when available. Mention database migrations or schema changes explicitly.

## Security & Configuration Tips
- Never commit `.env` or real credentials. Use `.env.example` as the template.
- Database requires PostGIS + CITEXT extensions—document any custom roles or connection strings in PRs.
- For media uploads, keep local paths outside the repo or add them to `.gitignore` before testing.
