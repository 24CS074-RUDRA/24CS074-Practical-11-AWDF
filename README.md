# Practical 12 — CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/24CS074-RUDRA/24CS074-Practical-11-AWDF/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/24CS074-RUDRA/24CS074-Practical-11-AWDF/actions/workflows/ci.yml)

This practical adds an automated CI workflow to the Practical 11 Task Management app. On every push to `main` and every pull request targeting `main`, GitHub Actions installs backend dependencies and runs the Jest/Supertest API tests. This demonstrates **Continuous Integration (CI)**; it does not automatically deploy the application, so it is not Continuous Deployment (CD).

## Run tests locally

From the project root in PowerShell:

```powershell
Set-Location .\backend
npm install
npm test
Set-Location ..
```

The tests exercise real API routes without requiring MongoDB: unauthenticated task-list access must return `401`, and invalid registration data must return `400`.

## Reproduce the fail-then-fix demonstration

1. Push the passing workflow and test baseline to `main` and capture the green run in GitHub **Actions**.
2. Open `backend\app.test.js`. Temporarily change the first test's expected status from `401` to `200`:
   ```js
   expect(response.statusCode).toBe(200);
   ```
3. Commit and push the deliberately failing test:
   ```powershell
   git add backend/app.test.js
   git commit -m "Demonstrate a failing CI test"
   git push
   ```
4. In GitHub, open **Actions → CI Pipeline**, select the run for that commit, and capture the red failed job. Open **Run automated tests** to show that the assertion failed.
5. Restore the expected status to `401`, then commit and push the fix:
   ```powershell
   git add backend/app.test.js
   git commit -m "Fix the CI test expectation"
   git push
   ```
6. Open the newest Actions run and capture the green successful job.

The repository should be connected to the Practical 11 GitHub repository before pushing. If Git reports that no remote is configured, check it with `git remote -v` and add the repository URL with `git remote add origin <repository-url>`.

## Screenshot checklist

Save screenshots in `docs/screenshots/` and include evidence for:

1. `01-workflow-file.png` — the workflow at `.github/workflows/ci.yml`.
2. `02-install-and-test.png` — the passing job's install and test steps.
3. `03-failed-run.png` — the deliberately failing test run and assertion error.
4. `04-passed-run.png` — the fixed commit's successful run.
5. `05-readme-badge.png` — the CI badge showing its current status.

Capture the failed run before pushing the fix. GitHub Actions workflow failures can take a short time to appear; refresh the Actions page if needed.

## CI versus CD

- **Continuous Integration:** automatically builds/validates changes and reports test results. This practical implements CI.
- **Continuous Deployment:** automatically deploys validated changes to an environment. This practical does not deploy.

Automated checks give feedback on every push, making regressions easier to identify near the change that introduced them. A wrong test file path also fails the job, but typically with Jest's “No tests found”/exit-code error rather than a failed assertion; inspect the Actions step logs to distinguish them.

# Practical 11 — Dockerized Task Management App

This project runs the Practical 10 Task Manager in three Docker Compose services:

- **frontend** — React/Vite app at `http://localhost:5173`
- **backend** — Express API at `http://localhost:5000`
- **mongodb** — MongoDB database, reachable from the backend as `mongodb:27017`

The frontend sends `/api` requests through its Vite preview proxy to the backend. The backend connects to MongoDB using the Compose service name; `localhost` inside a container would refer to that container itself.

## Requirements

- Docker Desktop (Windows/macOS) or Docker Engine
- Docker Compose v2 (`docker compose`)

Node.js is not needed on the host to run this stack.

## Run the full stack

Open PowerShell in this project folder and check Docker:

```powershell
docker --version
docker compose version
docker info
```

Make sure Docker Desktop is open and its engine is running. Start and build all services:

```powershell
docker compose up --build
```

Keep this terminal open. Open `http://localhost:5173` in a browser. Register a user, sign in, then create a task to verify that the frontend, API, and database work together.

In a second PowerShell terminal, confirm all three containers are running:

```powershell
docker ps
```

The API is also available directly at `http://localhost:5000`.

## Stop and restart

Press `Ctrl+C` in the Compose terminal, then stop and remove the containers:

```powershell
docker compose down
```

Task data is retained in the named `mongodb_data` volume. Start again with `docker compose up --build`. To intentionally delete the saved database data too:

```powershell
docker compose down --volumes
```

## Set the JWT signing secret

`JWT_SECRET` is the private key the backend uses to sign and verify login tokens. It is not itself a JWT. Generate a strong 64-byte random secret directly into the root `.env` file with Node.js:

```powershell
node -e "require('node:fs').writeFileSync('.env', 'JWT_SECRET=' + require('node:crypto').randomBytes(64).toString('hex') + '\n', { flag: 'wx' })"
docker compose up --build
```

Run this from the project root. The `wx` flag prevents overwriting an existing `.env`; if the file already exists, keep its secret or remove it only if you intend to generate a replacement. Keep `.env` private: it is excluded from Git and Docker build contexts. Do not share or commit it. Changing the secret invalidates tokens that were signed with the previous value.

## Useful checks and troubleshooting

```powershell
docker compose ps
docker compose logs backend
docker compose logs mongodb
docker compose down
```

- **Docker cannot connect to its engine:** start Docker Desktop and wait until it reports that the engine is running, then retry `docker info`.
- **A port is already in use:** stop the process/container using `5173`, `5000`, or `27017`, or change the host-side port in `docker-compose.yml`.
- **Backend cannot connect to MongoDB:** keep `MONGO_URI` set to `mongodb://mongodb:27017/taskdb`; `mongodb` must match the Compose service name.
- **Changes are not reflected:** rebuild with `docker compose up --build`.
- **Build context is unexpectedly large:** ensure `node_modules`, `.env`, and generated `dist` files remain excluded by the folder `.dockerignore` files.
