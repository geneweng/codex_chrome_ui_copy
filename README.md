# ViewPoint Explorer Prototype

This prototype pairs the dark YouTube-inspired UI with a PostgreSQL/PostGIS backend that stores geolocated "view points" (photos, videos, coordinates, notes). It includes SQL migrations, seed data, a Node/Express API, and a lightweight front-end script that hydrates the static layout with live data.

## Stack overview

- **Database:** PostgreSQL 14+ with PostGIS and CITEXT extensions
- **Backend API:** Node 20+, Express 4, node-postgres (`pg`)
- **Front end:** Static HTML/CSS with a small ES module (`app.js`) that fetches from the API
- **Media files:** Stored on the local filesystem initially (paths persisted in the database). Swap `MEDIA_BASE_URL` when moving to S3 or another CDN later.

## Getting started

### 1. Create the database

```bash
createdb viewpoint_explorer
psql -d viewpoint_explorer -f db/schema.sql
psql -d viewpoint_explorer -f db/seed.sql
```

> Ensure the `postgis` and `citext` extensions are available in your PostgreSQL instance.

### 2. Configure and run the API

```bash
cd server
npm install
cp .env.example .env
# adjust DATABASE_URL and optional CORS origins if needed
npm run dev
```

The API listens on `http://localhost:4000` by default. Key endpoints:

- `GET /api/viewpoints?near_lat=45.3265&near_lng=-121.7112&radius=6000` – list nearby viewpoints (returns media and tags).
- `GET /api/viewpoints/:id` – fetch full detail plus comments for a single viewpoint.
- `GET /health` – readiness probe.

### 3. Serve the front end

From the project root, serve the static assets with any dev server (Vite preview, `npx http-server`, `python -m http.server`, etc.).

Example using `npx`:

```bash
npx serve .
```

Open `http://localhost:3000` (or the port printed by the dev server). The page loads `app.js`, which targets `http://localhost:4000` by default. If the API is unavailable, the UI falls back to `sample-data.json` so the sidebar still displays demo viewpoints.
If you host the API elsewhere, update the snippet near the bottom of `index.html` or set `window.API_BASE_URL` in the console to point to the new origin.

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | API bind port (default 4000). |
| `DATABASE_URL` | PostgreSQL connection string with PostGIS enabled. |
| `PG_POOL_MAX` | Maximum connections in the pool (default 10). |
| `CORS_ORIGINS` | Comma-separated list of allowed origins for the API. |
| `MEDIA_BASE_URL` *(front end)* | Optional global that prefixes media paths returned by the API. |

## Local media storage

Media rows in `media_assets.storage_path` now default to hosted Unsplash URLs so the mock renders out of the box. When you start managing your own assets, replace those URLs with your CDN/local paths and update `MEDIA_BASE_URL` if needed.

## Next steps

- Implement POST endpoints with validation for creating viewpoints and comments.
- Add authentication/authorization (JWT) and rate limiting.
- Swap local media for S3 or GCS and introduce background workers for thumbnail generation.
- Layer in search/caching (Elasticsearch, Redis) as usage grows.

## Testing

Run the integration and UI smoke tests from the `server/` directory (PostgreSQL + PostGIS should be seeded first):

```bash
cd server
npm install
npm test
```

All tests are skipped by default in CI-like environments. Set `RUN_API_TESTS=1` to exercise the Postgres/Express integration suite, and `RUN_UI_TESTS=1` for the jsdom sidebar test.
