# Welder’s Atlas

A multilingual workbench for metal fabrication calculations and cutting templates. The application runs entirely in the browser.

Choose one of 25 calculators from the action selector. Tools cover fitting layouts, pipe offsets and bends, frames and bar spacing, stock and sheet cutting, material estimates, weld preparation and measured process values. Inputs and results support Ukrainian, Russian and English. Lengths support millimetres or decimal inches, preserving the physical job when switching units.

Drawings show reference identifiers; hover or focus them for numeric measurements. Matching results and marking tables stay below the drawing. Tools use formed views, sections, flat outlines or timelines as appropriate.

Full-scale PDF templates are available for the round reducer, square-to-round and square-to-square transitions, branch saddle, mitered corner, bolt circle, angled plate opening and segmented elbow. The download button opens paper and printing options in a separate dialog.

Flat outlines include measurement tables. Square-to-round panels have numbered vertices with every cut-edge and fold-line length, overall dimensions and vertex coordinates. PDF downloads begin with the matching dimension reference sheet, followed by full-scale tiles.

For manual saddle layout on metal, use the top-left reference corner. The outline labels the top-edge-to-profile heights A at 0°/180°/360° and B at 90°/270°. The marking table supplies absolute X distances across and Y distances down at 15° intervals.

For square-to-round panels, mark M at the midpoint of 1–2 and use h to locate point 5 vertically above it. At height H, center the measured 3–7 construction span over M. Use the coordinates for points 4 and 6 and follow the 3–4–5–6–7 cutting path. Blue dash-dot lines identify construction guides.

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

Each fitting has a pure TypeScript calculation and colocated geometry tests. The shared calculator workbench uses small tool adapters for input definitions, translations, results and tables. The stock planner adds editable part and stock rows. The original fitting components retain their shared preview/export contracts. Shared drawing types, previews and calculator styles support the tools. PDF options live in their own dialog component, and the PDF renderer is loaded when a download is requested. Both preview and export consume the calculated drawing geometry.
