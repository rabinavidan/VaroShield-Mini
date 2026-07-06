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

Seed users (created on backend startup, see `backend/app/auth.py`):
| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |

Backend runs standalone too: `DATABASE_URL=... uvicorn app.main:app --reload` from `backend/` (defaults to Postgres on localhost, but accepts a `sqlite://` URL for lightweight local runs — see `backend/app/database.py`).

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
- `services/scanner_service.py`: classifies file content as `sensitive`/`non_sensitive` via regex (email/credit-card/phone patterns) + keyword list, then calls `risk_service.evaluate_file_risk` per file. `run_scan_job` is fire-and-forgot (`asyncio.create_task` from the `/scan/start` route, not awaited) and includes an artificial `asyncio.sleep(2)` to simulate async work — this is what the `wait_until` polling utility in tests is built around.
- `services/risk_service.py`: pure risk-rule logic, decoupled from the scanner. Clears existing `open` alerts for a file before re-evaluating (so re-scanning doesn't duplicate alerts). Risk rules (also in README):
  - sensitive + public → HIGH
  - sensitive + shared with `everyone` group (read/write/admin) → HIGH
  - non-sensitive + public → LOW
  - sensitive + private → no alert (SAFE)
- Models (`models.py`): `User`, `FileItem` (1:N `Permission`, `RiskAlert` with cascade delete), `ScanJob`, `RiskAlert`. `FileItem.classification` starts `"unknown"` until a scan runs.

### Frontend (`frontend/src`)
Plain React + Vite + TS, no state library — pages fetch directly via `api/client.ts`. Auth token/role stored in `localStorage` (tests set this directly via `page.evaluate`, bypassing the login UI — see `authenticated_page` fixture in `automation/conftest.py`).

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
