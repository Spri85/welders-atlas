# Welder’s Atlas

A multilingual workbench for metal fabrication calculations and cutting templates. The application runs entirely in the browser.

Select round reducer, square-to-round transition or branch saddle from the action selector. Each calculator provides formed and flat views, millimetres or decimal inches, and a PDF download. The download button opens paper and printing options in a separate dialog.

The square-to-round pattern uses four matching panels and a 16-sided approximation of the round rim. The saddle wrap includes a 20 mm reference band for transferring the profile. Templates use zero allowances. Print at actual size and complete the physical checks described in [pattern verification](docs/pattern-verification.md) before workshop use.

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

## Verify the application

Run the tests and production build from `frontend`.

```sh
npm test
npm run build
```

The production build writes static files to `dist/welders-atlas/browser`.

## Code structure

Each fitting has a pure TypeScript calculation and colocated geometry tests. Angular calculator components own their input state and translations. Shared drawing types, previews and calculator styles support the fitting UIs. PDF options live in their own dialog component, and the PDF renderer is loaded when a download is requested. Both preview and export consume the calculated drawing geometry.
