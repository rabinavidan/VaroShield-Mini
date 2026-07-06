# VaroShield Mini Automation POC

## Why this project exists

This project was built as a mini Data Security automation POC. It simulates
sensitive data discovery, permission exposure, async scan processing, risk
alerting and dashboard validation — the kind of workflow a DSPM-style product
would run in production, scaled down to something a single engineer can build,
run, and test end to end.

## Architecture

```mermaid
flowchart TD
  UI[React UI] --> API[FastAPI Backend]
  API --> DB[(PostgreSQL)]
  API --> Scanner[Scanner Service]
  Scanner --> Risk[Risk Service]
  Tests[Pytest + Playwright] --> API
  Tests --> UI
  CI[GitHub Actions] --> Tests
  CI --> Pages[GitHub Pages: Allure report]
```

## Business flow

Sensitive file → Permission exposure → Async scan → Risk alert → Dashboard update

1. Admin logs in
2. Admin creates a file with content and permissions
3. Admin starts a security scan
4. The system scans files asynchronously and classifies sensitive data
5. The system checks if sensitive files are exposed (public or shared with "everyone")
6. The system creates risk alerts (high / low / safe)
7. The dashboard shows a live summary of files, sensitive files, exposure and open alerts

### Risk rules

| Condition | Result |
|---|---|
| Sensitive file content (email / phone / credit card / secret keywords) + public access | **HIGH** risk |
| Sensitive file + shared with `everyone` group (read/write/admin) | **HIGH** risk |
| Non-sensitive file + public access | **LOW** risk |
| Sensitive file, private, accessible only by owner/admin | **SAFE** (no alert) |

## Tech stack

- **Backend**: FastAPI, Python 3.11+, SQLAlchemy, PostgreSQL, Pydantic, Uvicorn
- **Frontend**: React + Vite, TypeScript, plain CSS (Manrope / IBM Plex Sans / IBM Plex Mono type system, semantic status colors, dataviz-informed charts)
- **Automation**: Pytest, Playwright (Python), Requests, Allure Pytest, pytest-xdist
- **Infra**: Docker, Docker Compose
- **CI**: GitHub Actions (builds the stack, runs the suite, publishes the Allure report to GitHub Pages)

## Frontend highlights

- **Login page** doubles as a system map: two animated diagrams (business logic
  flow, test-automation layers) built straight from the repo's own architecture.
- **Dashboard** has a live posture breakdown (open alerts by severity, files by
  classification) as thin status-colored bar charts, plus a scan console with a
  Queued → Scanning → Complete step tracker, an animated progress bar, a live
  elapsed timer, and a results summary once a scan finishes.
- **Files / Risks** pages have dynamic filters (options derived from the data
  actually loaded, not hardcoded) and client-side pagination, newest-first.

## Test strategy

- API tests validate business logic: auth, file/permission CRUD, async scan
  lifecycle, and risk rules.
- UI tests validate critical user journeys only (login, dashboard summary,
  starting a scan, viewing and filtering risks) — they do not duplicate full
  API coverage.
- Async tests (scan jobs) use a `wait_until` polling utility with timeout
  instead of hard-coded sleeps, so the suite stays fast and stable.
- Risk tests validate sensitive-data detection and permission exposure
  together, since a risk alert is a function of both.
- CI runs the full stack via Docker Compose and uploads Allure results for
  fast, readable debugging.

## Repository structure

```
varoshield-mini/
  backend/        FastAPI app: models, schemas, services, routers
  frontend/       React + Vite + TypeScript UI
  automation/     Pytest + Playwright test framework (clients, page objects, tests)
  .github/        GitHub Actions workflow
  CLAUDE.md       Guidance for AI coding agents working in this repo
  docker-compose.yml
```

## How to run locally

```bash
docker compose up -d --build
```

- Backend docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

If those ports are already taken by something else on your machine, don't edit
`docker-compose.yml` (CI relies on 5432/8000/3000) — instead create a local,
gitignored `docker-compose.override.yml` remapping the host ports; `docker
compose` picks it up automatically. Use `!override` on the `ports:` key so it
replaces rather than merges with the base file's list:

```yaml
services:
  backend:
    ports: !override
      - "8010:8000"
```

Seed users:

| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |

### Run automation

```bash
cd automation
pip install -r requirements.txt
playwright install
pytest --alluredir=allure-results
```

### View the Allure report

```bash
allure serve allure-results
```

CI also generates the report and publishes it to GitHub Pages on every push to
`main` — no local Allure install needed to view the latest run:
https://rabinavidan.github.io/VaroShield-Mini/

## Demo script for interview

1. Open this README and walk through the architecture diagram
2. Start the app with `docker compose up -d --build`
3. Log in as admin — point out the two animated system-map diagrams on the
   login page (business logic flow, test-automation layers)
4. Create a sensitive file (e.g. content with an email + credit card number)
5. Expose it to the `everyone` group
6. Start a scan from the dashboard — watch the scan console's step tracker and
   progress bar, then the results summary and updated posture charts
7. Show the HIGH risk alert appear on the Risks page; try the severity/status
   filters and pagination
8. Run the API tests: `pytest automation/tests/api -m api`
9. Run the UI tests: `pytest automation/tests/ui -m ui`
10. Show the live Allure report (https://rabinavidan.github.io/VaroShield-Mini/)
    or run it locally: `allure serve allure-results`
11. Show the GitHub Actions workflow (`.github/workflows/automation-ci.yml`),
    including the Pages deploy step

## Talking points for interview

- The product is intentionally small.
- The main value is the automation architecture, not the demo app.
- The API layer validates business logic; the UI layer validates critical
  user flows.
- The async scan is tested with polling, not hard sleeps.
- Permissions and sensitive data are tested together, since risk is a
  function of both.
- Reports include enough context (job id, file id, request/response) for
  fast debugging.
- Docker makes execution reproducible; CI gives release confidence.
- The frontend isn't an afterthought either: a small dataviz-informed design
  system (status-colored charts with hover tooltips, a real progress/step
  tracker for the async scan) shows the same attention to detail on the UI
  side, not just the test layer.

## Interview pitch

Before the interview, I built a small POC that simulates a data-security
product. It detects sensitive files, validates permission exposure, creates
risk alerts and includes API, UI and async automation with Pytest,
Playwright, Docker and CI.

The main value is not the demo app itself. The main value is the automation
architecture: clear test layers, reusable clients, stable async validation,
permission-risk coverage, CI execution and readable reports.
