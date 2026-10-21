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
