# Developer Guide

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Running Cypress Tests](#running-cypress-tests)
4. [Developing Against a Local ISPyB](#developing-against-a-local-ispyb)
5. [Debugging](#debugging)

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Build | **Grunt** | Template precompilation, JS bundling, CSS minification |
| JS dependencies | **npm** | Frontend libraries (jQuery, Bootstrap, Handsontable, …) |
| Dev tooling | **npm** | Grunt plugins, Cypress, static dev server |
| E2E tests | **Cypress 13** | Shipping/MX widget tests with mocked ISPyB REST |
| Framework | **ExtJS 4** (MVC) | Hash-based routing, panels, grids |
| Templates | **Dust.js** | Precompiled to `min/precompiled.templates.min.js` |

---

## Getting Started

### Prerequisites

- **Node.js** (16+) and **npm**
- **Grunt CLI** installed globally:

```bash
npm install -g grunt-cli
```

### Install dependencies

```bash
npm install
```

This installs both build tooling (Grunt plugins, Cypress, http-server) and all frontend libraries (jQuery, Bootstrap, Handsontable, …) into `node_modules/`.

### Build for development

```bash
grunt dev
```

This runs three steps in order:

1. **`dustjs`** — precompiles `templates/**/*.js` into `min/precompiled.templates.min.js`
2. **`includeSource:dev`** — regenerates `mx/dev.html` from `mx/index.tpl.html`, injecting every JS source file individually (no bundling — ideal for debugging)
3. **`cssmin:prod`** + **`asset_cachebuster`** — minifies CSS and cache-busts asset URLs

Run `grunt dev` any time you add a new template or change CSS. Plain JS edits require no rebuild — `dev.html` references each source file directly so a browser refresh is enough.

### Build for production

```bash
grunt
```

The default task concatenates all JS into bundles under `min/`, runs Terser (minify + mangle), minifies CSS, compiles API docs, and cache-busts all asset URLs. Output entry point: `mx/index.html`.

---

## Running Cypress Tests

### Start the static dev server

Cypress needs a running HTTP server. The simplest option is the bundled `http-server`:

```bash
npm run serve          # serves the repo root on http://localhost:3000
```

`cypress.config.js` points `baseUrl` at `http://localhost:3000`, so Cypress opens `http://localhost:3000/mx/index.html` automatically.

### Run all E2E tests (headless)

```bash
npm run test:e2e       # cypress run --spec 'cypress/e2e/shipping/**'
```

### Open interactive Cypress runner

```bash
npm run cypress:open   # cypress open
```

Select **E2E Testing** → choose a browser → pick a spec file.

### How the tests work

All ISPyB REST calls are intercepted by `cy.intercept()` — no live backend is required. Fixtures live under `cypress/fixtures/` and are organised by domain:

```
cypress/fixtures/
  proposal/       # info.json (proteins, proposal)
  shipping/       # shipment.json, container-6.json, …
  mx/             # samples-*.json
  csv/            # *.csv files for CSV upload tests
```

---

## Developing Against a Local ISPyB

Running EXI through the same Tomcat instance as ISPyB eliminates CORS entirely — all REST calls are same-origin.

### Setup in IntelliJ IDEA

1. **Build the app** (`grunt dev` or `grunt` for production bundles).

2. **Create an Artifact** in IntelliJ:
   - **File → Project Structure → Artifacts → + → Other**
   - Set the output directory to `<tomcat-webapps>/exi` (or configure the Tomcat deployment to map the artifact to context path `/exi`).
   - Add the entire EXI repo root as the artifact content (so `mx/`, `js/`, `min/`, `css/`, `node_modules/` etc. are all served under `/exi`).

3. **Run/Debug Configuration** — add a **Tomcat Local** server:
   - On the **Deployment** tab, add the artifact above with context path `/exi`.
   - ISPyB itself should already be deployed under `/ispyb`.

4. **Access the app** at:
   ```
   http://localhost:8080/exi/mx/index.html       # production bundles
   http://localhost:8080/exi/mx/dev.html         # individual source files (for debugging)
   ```

ISPyB REST is served from `http://localhost:8080/ispyb/ispyb-ws/rest` — same host, same port, no CORS preflight.

### Pointing EXI at ISPyB

`mx/config.js` sets the REST base URL. In development it typically auto-detects the origin, but you can override it explicitly if needed.

---

## Debugging

The combination of `grunt dev` + `dev.html` preserves the original source file names and line numbers throughout the browser, making breakpoints reliable.

### Step 1 — Build in dev mode

```bash
grunt dev
```

`mx/dev.html` references every JS file individually (no bundling, no minification). Changes to `.js` files are picked up on the next browser refresh — no rebuild needed.

### Step 2 — Start Chromium with a remote debug port

```bash
chromium --remote-debugging-port=9222 \
         http://localhost:8080/exi/mx/dev.html
```

Or, if you prefer to launch from IntelliJ, add `--remote-debugging-port=9222` to the browser startup flags in **Settings → Tools → Web Browsers**.

### Step 3 — Attach the IntelliJ JavaScript debugger

1. **Run → Edit Configurations → + → JavaScript Debug**
2. Set URL to `http://localhost:8080/exi/mx/dev.html`
3. Set the remote debug port to `9222`
4. Click **Debug** — IntelliJ attaches to the running Chromium tab.

You can now set breakpoints directly in the project JS files (`js/core/`, `js/mx/`, etc.). Because `dev.html` loads each file individually, the browser's script URLs match the repo paths exactly and breakpoints resolve without source-map gymnastics.

### Tips

- **Template changes** do require `grunt dev` before refreshing, because Dust templates are precompiled.
- **Grunt watch** (`grunt watch`) re-runs `grunt dev` automatically when CSS or template files change.
- To inspect a specific view, find its constructor (e.g. `PuckFormView`) and set a breakpoint in `load()` or `save()` — the route handler instantiates a fresh view on every navigation.
