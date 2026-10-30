# Welder’s Atlas

A multilingual workbench for metal fabrication calculations and cutting templates. The Angular starter runs entirely in the browser.

| Language selector | Product name |
| --- | --- |
| `ua` | Атлас зварника |
| `ru` | Атлас сварщика |
| `en` | Welder’s Atlas |

## Run locally

Use Node.js 24.22.1 and npm to match the Docker image. If you use nvm, run `nvm install` and `nvm use` at the repository root before starting Angular.

Start the app from the repository root.

```sh
cd frontend
npm ci
npm start
```

Open [the workbench](http://localhost:4200). Use Ctrl+C to stop.

## Run with Docker

With Docker and Compose running, execute these commands from the repository root.

```sh
docker compose up --build --wait
docker compose ps
```

Open [the same workbench](http://localhost:4200). The single development container watches `frontend/src` for edits. Rebuild after changing dependencies or configuration. Local and Docker modes use the same host port, so run one mode at a time.

```sh
docker compose logs -f
docker compose down
```

## Verify the starter

Run the tests and production build from `frontend`.

```sh
npm test
npm run build
```

The production build writes static files to `dist/welders-atlas/browser`.
