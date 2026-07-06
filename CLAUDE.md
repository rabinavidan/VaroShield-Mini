# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small Data Security Posture Management (DSPM) simulation POC, built primarily as an **automation/testing architecture showcase** rather than a production app. The demo app is intentionally minimal; the point is the test layering (API + UI + async), reusable clients/page-objects, and CI.

Business flow: sensitive file → permission exposure → async scan → risk alert → dashboard update. See `README.md` for the full write-up, risk-rule table, and interview talking points — read it before making behavioral changes so you don't contradict the documented design.

## Running the stack

```bash
docker compose up -d --build
```
- Backend: http://localhost:8000 (docs at `/docs`)
- Frontend: http://localhost:3000
- Postgres: localhost:5432 (db/user/pass all `varoshield`)

Ports in the committed `docker-compose.yml` must stay 5432/8000/3000 — CI's
health-check step and test env vars hardcode `localhost:8000`/`:3000`. If those
ports collide with something else on your machine, don't edit the committed
file; add a gitignored `docker-compose.override.yml` instead (`docker compose`
merges it automatically). Compose concatenates `ports:` lists by default, so a
plain override list ends up requesting *both* the old and new port and fails
the same way — use the `!override` YAML tag on the `ports:` key to fully
replace it:
```yaml
services:
  backend:
    ports: !override
      - "8010:8000"
```
The Postgres data lives in the named volume `varoshield_pgdata`, so it
persists across `docker compose up`/`down` (not `down -v`) — don't assume a
fresh container means a fresh database.

Seed users (created on backend startup, see `backend/app/auth.py`):
| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |

Backend runs standalone too: `DATABASE_URL=... uvicorn app.main:app --reload` from `backend/` (defaults to Postgres on localhost, but accepts a `sqlite://` URL for lightweight local runs — see `backend/app/database.py`).

**Seeding realistic demo data**: `FileItem.classification` and any `RiskAlert`s only get computed when a scan actually runs (`POST /scan/start`, then poll `GET /scan/{job_id}` until `"done"`) — inserting rows directly into Postgres skips that logic and leaves `classification: "unknown"` with no alerts. To seed a clean demo set: create files via `POST /files` (as admin, `Authorization: Bearer fake-admin-token`) with content that actually matches the sensitivity rules (an email address, a keyword like `ssn`/`secret`/`password`), optionally `POST /files/{id}/permissions` to share one with `everyone`, then trigger and wait out a scan so classification/risk are computed for real. To wipe accumulated test junk first (e.g. from repeated local Playwright runs), truncate the non-user tables directly: `docker exec varoshield-mini-postgres-1 psql -U varoshield -d varoshield -c "TRUNCATE TABLE risk_alerts, permissions, files, scan_jobs RESTART IDENTITY CASCADE;"` (leaves `users` untouched).

## Automation (tests)

```bash
cd automation
pip install -r requirements.txt
playwright install
pytest --alluredir=allure-results       # full suite
pytest tests/api -m api                 # API layer only
pytest tests/ui -m ui                   # UI layer only
pytest tests/api -m "smoke or api"      # what CI runs for API
pytest -k test_name                     # single test
allure serve allure-results             # view report
```

Requires the stack to be running (`API_BASE_URL`, `UI_BASE_URL` env vars override defaults of `localhost:8000`/`:3000`, see `automation/utils/config.py`).

Pytest markers (`automation/pytest.ini`): `api`, `ui`, `smoke`, `regression`, `permissions`, `scan`, `risks`. CI (`.github/workflows/automation-ci.yml`) only runs `smoke` + layer marker — new tests should carry a marker or they won't run in CI's smoke gate.

After the suite runs, CI generates the Allure HTML report (via the Allure CLI, downloaded inline — there's no dedicated setup-allure action) and publishes it to GitHub Pages, then writes the link into the Job Summary. The `deploy-report` job only runs `if: github.event_name == 'push'` — GitHub's auto-created `github-pages` environment restricts deployment by branch, and a PR's merge ref (`refs/pull/N/merge`) can't be added to that allow-list, so PR runs skip the deploy (by design, not a failure) and only push-to-`main` runs actually publish. Deploying Pages requires the repo to be public (private repos need a paid plan for Pages).

## Frontend only

```bash
cd frontend
npm install
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
```

## Architecture

```
UI (React) --> FastAPI backend --> PostgreSQL
                     |--> Scanner service --> Risk service
Tests (Pytest/Playwright) --> API + UI
```

### Backend (`backend/app`)
- `main.py` wires routers, creates tables via `Base.metadata.create_all` (no migration tool — schema changes just require editing `models.py`), and seeds users on `startup`.
- Routers (`routers/*.py`) are thin: auth check via dependency, DB query, return Pydantic schema. Business logic lives in `services/`, not routers.
- `auth.py` is a **fake bearer-token scheme** for the POC: tokens are literally `fake-{role}-token` (see `make_token`/`role_from_token`). There's no per-user identity beyond role — `get_current_user` looks up a user *by role*, not by decoding a real credential. Don't mistake this for real auth when reasoning about security-sensitive changes.
- `services/scanner_service.py`: classifies file content as `risky`/`safe` via regex (email/credit-card/phone patterns) + keyword list, then calls `risk_service.evaluate_file_risk` per file. `run_scan_job` is fire-and-forgot (`asyncio.create_task` from the `/scan/start` route, not awaited) and includes an artificial `asyncio.sleep(2)` to simulate async work — this is what the `wait_until` polling utility in tests is built around.
- `services/risk_service.py`: pure risk-rule logic, decoupled from the scanner. Clears existing `open` alerts for a file before re-evaluating (so re-scanning doesn't duplicate alerts). Risk rules (also in README):
  - sensitive + public → HIGH
  - sensitive + shared with `everyone` group (read/write/admin) → HIGH
  - non-sensitive + public → LOW
  - sensitive + private → no alert (SAFE)
- Models (`models.py`): `User`, `FileItem` (1:N `Permission`, `RiskAlert` with cascade delete), `ScanJob`, `RiskAlert`. `FileItem.classification` starts `"unknown"` until a scan runs.

### Frontend (`frontend/src`)
Plain React + Vite + TS, no state library — pages fetch directly via `api/client.ts`. All styling lives in one global `index.css` (no CSS modules); design tokens (colors, fonts) are CSS custom properties on `:root`. Type system is Manrope (display/headings) + IBM Plex Sans (body) + IBM Plex Mono (labels, data, badges), loaded via a Google Fonts `<link>` in `index.html`.

- `auth.ts` — auth is reactive via a `useIsAuthenticated()` hook + `setAuth`/`clearAuth` helpers that dispatch a custom `window` event. **Don't call `localStorage.getItem("token")` directly in a component body expecting it to react to login/logout** — a plain `isAuthenticated()` check in `App.tsx`'s render body doesn't get re-evaluated on client-side navigation (React Router's `navigate()` doesn't force `App` to re-render, since `<App/>`'s element reference never changes across `BrowserRouter`'s internal re-renders — a real bug that shipped once: the navbar silently never appeared after a real login, only after a manual page refresh). Always go through the hook.
- `components/Navbar.tsx` — brand mark, pill-style active nav links, a role badge, logout. Only rendered when `useIsAuthenticated()` is true (in `App.tsx`).
- `components/StatCard.tsx` — takes a `tone` (`"default" | "warning" | "critical"`) so a stat card can visually flag itself (e.g. High Risks > 0 → critical/red) — set by the caller, not computed internally.
- `components/PostureBreakdown.tsx` — the Dashboard's two bar charts (open alerts by severity, files by classification). Colors are **status colors** (reused from the existing `severity-high`/`severity-low` reds/greens), not a generated categorical palette — deliberately, since severity/classification are meaning-bearing, not arbitrary series. See `references/color-formula.md` in the `dataviz` skill if extending this.
- `components/ScanConsole.tsx` — replaces a plain status string with a Queued/Scanning/Complete step tracker, an animated indeterminate progress bar, an elapsed timer, and a results summary using `ScanStatusResponse.summary` (scanned/sensitive counts) — data the backend already returned that the UI used to just discard.
- `components/Pagination.tsx` — shared Prev/Next + range/page-count control used by Files and Risks.
- `components/SystemMapDiagrams.tsx` — the two animated SVG flowcharts embedded on the login page (business logic, test layers); colors match the rest of the app, not a separate theme.
- **Files/Risks filters**: Files' filter options are derived live from the loaded data (only classifications/owners that actually exist show up). Risks' severity/status options are static constants (`["high","low"]` / `["open"]` in `RisksPage.tsx`) matching what `risk_service.py` can actually produce, **not** derived from the async-loaded list — deriving them live would race against an existing automation test that selects a severity option immediately after the table appears, before the fetch resolves.
- Pagination on both list pages is client-side (fetch everything, slice in the browser) and sorts newest-first (`id` descending) — the backend has no pagination/sort query params.

### Automation framework (`automation/`)
- `clients/` — one class per API resource (`auth_client`, `files_client`, `scan_client`, `risks_client`, `dashboard_client`), all subclassing `base_client.BaseClient` (adds bearer header, logs non-2xx responses). API tests call these directly rather than raw `requests`.
- `pages/` — Playwright page objects per UI page, used only by `tests/ui`.
- `utils/polling.py` — `wait_until(action, condition, timeout, interval)` is the *only* sanctioned way to wait on the async scan job; don't add `time.sleep` to new tests.
- `utils/config.py` — central env-driven config (base URLs, seed credentials/tokens). Add new env-driven settings here, not scattered `os.getenv` calls.
- Fixtures for clients are pre-wired with the right token in `conftest.py` (e.g. `files_client` = admin, `user_files_client` = user) — prefer these over constructing clients manually in tests.

## Design conventions worth preserving

- Routers stay thin; new business logic belongs in a `services/` module.
- API tests own business-logic coverage (auth, CRUD, scan lifecycle, risk rules); UI tests are limited to critical journeys only (login, dashboard summary, starting a scan, viewing/filtering risks) and should not re-verify things already covered at the API layer.
- Risk-alert tests should exercise sensitivity classification and permission exposure together, since a risk is a function of both — don't test them in isolation.
