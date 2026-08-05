# Developer Guide

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Running Cypress Tests](#running-cypress-tests)
4. [Developing Against a Local ISPyB](#developing-against-a-local-ispyb)
5. [Debugging](#debugging)
6. [Building the Documentation Site](#building-the-documentation-site)

---

## Tech Stack

| Layer | Tool              | Purpose |
|---|-------------------|---|
| Dev server | **Vite**          | Local dev server with an `/ispyb` proxy — no Tomcat needed to run EXI (see [Developing Against a Local ISPyB](#developing-against-a-local-ispyb)) |
| Build | **Vite**          | `npm run build` — bundles js/main.js, precompiles Dust templates, bundles CSS, copies ExtJS/vendor assets. Output: `dist/` |
| JS dependencies | **npm**           | Frontend libraries (jQuery, ExtJS, Handsontable, …) |
| Dev tooling | **npm**           | Vite, Cypress, static dev server |
| E2E tests | **Cypress 13**    | Shipping/MX widget tests with mocked ISPyB REST |
| Framework | **ExtJS 5** (MVC) | Hash-based routing, panels, grids |
| Templates | **Dust.js**       | Precompiled at dev/build time by a custom Vite plugin (`vite-plugins.mjs`, `virtual:dust-templates`) |

Only the MX entry point (`mx/index.html`) is built by Vite. `saxs/` and `tracking/` are
out of scope for this codebase (see `CLAUDE.md`) and are not part of this build.

---

## Getting Started

### Prerequisites

- **Node.js** (18+) and **npm**
- **GitHub Packages authentication** — ExtJS is served from a private npm registry.
  Add the following to `~/.npmrc` (create the file if it does not exist):

```
//npm.pkg.github.com/:_authToken=YOUR_PAT
```

Replace `YOUR_PAT` with a GitHub Personal Access Token that has the `read:packages` scope.
Without this, `npm install` will fail to resolve `@scientific-software-hub/extjs`.

### Install dependencies

```bash
npm install
```

Installs both dev tooling (Vite, Cypress, http-server, …) and all frontend libraries
(jQuery, Bootstrap, Handsontable, ExtJS, …) into `node_modules/`.

### Run the dev server

```bash
npm run dev
```

Opens a Vite dev server at `http://localhost:5173`. Every JS/CSS file is served
individually (no bundling), and a `/ispyb` proxy makes REST calls same-origin
against a local ISPyB — see [Developing Against a Local ISPyB](#developing-against-a-local-ispyb).
Edit any `.js`/`.css`/template file and refresh; no build step in between.

### Build for production

```bash
npm run build
```

Runs `vite build`: bundles `js/main.js` (the whole app) into a single hashed chunk,
precompiles Dust templates, bundles the legacy CSS list with `clean-css` (see
`vite-plugins.mjs` for why this bypasses Vite's own stricter CSS pipeline), and
copies ExtJS + vendor libraries verbatim. Output entry point: `dist/mx/index.html`.

```bash
npm run preview
```

Serves the `dist/` build locally (`http://localhost:4173`) to sanity-check a
production build before deploying.

### Docker image

The `Dockerfile` is multi-stage: it runs `npm ci && npm run build` itself in a
`node:22-alpine` build stage, then copies only the resulting `dist/` (plus
`images/`, `fonts/`, `csv/`) into a plain `nginx:1.25.3-alpine` runtime stage. You
do **not** need to run `npm run build` on the host first — `docker build` is the
only step.

`@scientific-software-hub/extjs` is a private GitHub Packages dependency, so the
build stage's `npm ci` needs a `read:packages` PAT — the same kind of token from
[Prerequisites](#prerequisites) above, but passed separately here rather than
read from your `~/.npmrc`, since that file lives on your host and isn't
available inside the build container. Pass it as a BuildKit secret, not a
`--build-arg` (build-args land in the image history; secrets don't):

```bash
export NPM_TOKEN=ghp_your_read_packages_token
docker build --secret id=npm_token,env=NPM_TOKEN -t mxhub-exi .
```

---

## Running Cypress Tests

### Start the static dev server

Cypress needs a running HTTP server against a **built** app (not the Vite dev server):

```bash
npm run build   # produces dist/
npm run serve   # copies images/fonts/csv into dist/, serves it on http://localhost:3000
```

`cypress.config.js` points `baseUrl` at `http://localhost:3000`.

### Run all E2E tests (headless)

```bash
npm run test:e2e
```

### Open interactive Cypress runner

```bash
npm run cypress:open
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

See [Testing & Quality](testing.md) for what the suite actually covers and why.

---

## Developing Against a Local ISPyB

### Setup (Vite — recommended)

EXI no longer needs to be deployed into the same Tomcat instance as ISPyB to avoid CORS.
`vite.config.js` runs a dev server with a `/ispyb` proxy to Tomcat:

```js
server: {
  proxy: {
    '/ispyb': { target: 'http://localhost:8080', changeOrigin: false },
  },
},
```

`mx/config.js` already points at the relative path `/ispyb/ispyb-ws/rest`, and ISPyB
authentication is token-in-URL rather than cookie-based
(`js/ispyb-client/dataadapter.js`), so the proxy needs no cookie rewriting — every
REST call is same-origin from the browser's point of view, exactly as if EXI were
served by the same Tomcat.

1. Have ISPyB running and reachable at `http://localhost:8080` (see the project's
   `ispyb-database` seeder docs for a local instance).
2. `npm run dev`
3. Open `http://localhost:5173/mx/index.html`. Log in as `ispyb` / `ispyb`.

No build step, no IntelliJ artifact, no Tomcat deployment for EXI itself — only for
ISPyB.

### Pointing EXI at ISPyB

`mx/config.js` sets the REST base URL. In development it typically auto-detects the origin, but you can override it explicitly if needed.

---

## Debugging

Vite's dev server serves every source file individually with accurate sourcemaps, so
breakpoints resolve directly against files under `js/` — no separate "dev build" step
(unlike the old Grunt `dev.html`, this needs no rebuild at all when you edit `.js`
files; only template changes need a page refresh, since Dust templates are
precompiled by a Vite plugin that re-runs automatically on change).

### Step 1 — Start the dev server

```bash
npm run dev
```

### Step 2 — Start Chromium with a remote debug port

```bash
chromium --remote-debugging-port=9222 \
         http://localhost:5173/mx/index.html
```

Or, if you prefer to launch from IntelliJ, add `--remote-debugging-port=9222` to the browser startup flags in **Settings → Tools → Web Browsers**.

### Step 3 — Attach the IntelliJ JavaScript debugger

1. **Run → Edit Configurations → + → JavaScript Debug**
2. Set URL to `http://localhost:5173/mx/index.html`
3. Set the remote debug port to `9222`
4. Click **Debug** — IntelliJ attaches to the running Chromium tab.

You can now set breakpoints directly in the project JS files (`js/core/`, `js/mx/`, etc.).

### Tips

- To inspect a specific view, find its constructor (e.g. `PuckFormView`) and set a breakpoint in `load()` or `save()` — the route handler instantiates a fresh view on every navigation.
- Editing a Dust template under `templates/` triggers Vite's dev-server watcher (see `dustTemplatesPlugin` in `vite-plugins.mjs`) — refresh the page to pick it up.

---

## Building the Documentation Site

This documentation is a small static site, built from the markdown files in `documentation/`
by a self-contained Node script — it does not depend on Grunt, Bower, or the private
`@scientific-software-hub/extjs` registry.

### Build once

```bash
npm run docs:build          # from the repo root — installs documentation/'s deps and builds
```

or, from inside `documentation/` directly:

```bash
cd documentation
npm install
npm run build                # -> documentation/_site/
```

### Preview locally

```bash
cd documentation
npm run serve                 # builds, then serves _site/ on http://localhost:4000
```

### What the build checks

`build-docs.js` runs two checks before writing any output, and **fails the build** (non-zero
exit) if either doesn't pass:

- **Link check** — every relative link between doc pages must resolve to a real page and, if it
  points at a heading, a real `#anchor` on that page.
- **Scrub check** — a list of real names, logins, emails, proposal codes and file paths that
  must never reappear in the public docs (see the top of `build-docs.js` for the current list).
  This exists because these docs were originally sanitised from working notes captured against
  a real facility's data — the check keeps a future edit from reintroducing something real.

Both checks run in CI (`.github/workflows/docs.yml`) on every pull request that touches
`documentation/`, so a broken link or a leaked name fails the PR rather than shipping.

### Publishing

Pushes to `main` that touch `documentation/**` trigger the same workflow, which then deploys
`documentation/_site/` to GitHub Pages. No manual steps beyond the initial one-time repo setting
(Settings → Pages → Source → **GitHub Actions**).
