# Testing & Quality

## Why end-to-end tests, here

EXI is a decade-old ExtJS 5 application, and the project's medium-term goal is to move it to
ExtJS 6. That upgrade touches almost every screen at once — panels, grids, routing, form
validation — so the only realistic way to know whether it broke anything is a suite of tests that
drive the real UI the way a person would, against every screen that matters, *before* the upgrade
starts.

That suite is built with [Cypress](https://www.cypress.io/). It doesn't replace careful manual
testing, and it doesn't test the ISPyB backend itself — its job is narrower and more mechanical:
confirm that clicking the things a user clicks still renders what it used to render, and still
sends the request it used to send.

## How the framework works

- **No live backend, ever.** Every ISPyB REST call the app makes is intercepted with
  Cypress's `cy.intercept()` and answered from a fixture file instead. A spec run never touches a
  real database or a real ISPyB server — it only touches the EXI frontend, served by a plain
  static file server.
- **Fixtures come from real responses.** Rather than hand-guessing what an endpoint returns,
  fixtures were captured by pointing the real app at a real, seeded ISPyB instance and recording
  the actual JSON/CSV that came back. That matters for an app this old: several endpoints return
  shapes that don't match what the source code's naming would suggest, and a guessed fixture would
  have quietly tested the wrong thing.
- **Tests are organised by feature area**, under `cypress/e2e/<area>/` — `auth/`, `shipping/`,
  `mx/` — mirroring the app's own module boundaries.
- **It runs on every push and pull request.** A GitHub Actions workflow builds the app and runs
  the full suite headless; a broken test blocks the change rather than being discovered later.

See the [Developer Guide](developer-guide.md#running-cypress-tests) for the actual commands to
run the suite locally.

## What is covered

16 spec files, one row per [user journey](user-journeys.md) they exercise, in plain language
rather than test-framework jargon:

| Spec file | Journeys | What it actually checks |
|---|---|---|
| `auth/login.cy.js` | A1, X1, X4 | Filling in the login form, the "choose a beamtime period" date picker, a wrong password being rejected, and the difference between what a regular user sees versus a facility manager. |
| `auth/logout.cy.js` | X3 | Logging out returns you to the login screen and clears cached proposal data. |
| `shipping/shipment-list.cy.js` | (supports A2) | The list of a user's shipments renders, in the right order, and clicking one opens it. |
| `shipping/shipment-create.cy.js` | A2 | Filling in the "Create New Shipment" form and being taken to the new shipment's page. |
| `shipping/shipment-detail.cy.js` | A5, A6 | Everything on a shipment's own page: adding a parcel, adding a container, printing labels, and sending the shipment to the facility once every dewar is labelled. |
| `shipping/csv-upload.cy.js` | A4 | Uploading a spreadsheet of samples, and being stopped when it contains an unknown protein or a duplicate sample name. |
| `shipping/puck-form.cy.js` | A5 | Editing the sample list inside one physical puck by hand. |
| `shipping/protein.cy.js` | A3 | Registering a new protein, from both places that offer it — the main menu and the inline "Add Protein" button while filling in a puck. |
| `shipping/addresses.cy.js` | A9 | Viewing and editing a lab's shipping/contact address. |
| `mx/data-collections.cy.js` | A7, B3, B4, B5 | The main results screen: session data collections render as cards, every tab on a card works, and — the highest-priority test in the whole suite — the autoprocessing plots on the results tab render as real curves from real recorded data. |
| `mx/prepare-experiment.cy.js` | B1, B2 | The two-step "Prepare Experiment" wizard a local contact uses to load a shipment onto the sample changer, including the status-change icons that move a shipment through "processing" and onward. |
| `mx/comment.cy.js` | B6 | Adding a comment to a data collection, from both places that offer it. |
| `mx/manager-statistics.cy.js` | C1, C2 | The facility-manager-only "Manager" menu is only visible to a manager, and each of the three statistics dialogs opens and fires the right request. |
| `mx/protein-search.cy.js` | A8 | The acronym search box in the top menu bar. |
| `mx/proposal-sessions.cy.js` | C3 | Browsing every session for one proposal from a data collection page. |
| `mx/deep-links.cy.js` | X2 | Opening a link straight into a specific session/sample/shipment before logging in — the app should show the login form first, then land on the right page. |

That's every journey in the [journey catalogue](user-journeys.md) except A9's create-mode address
form and B2's drag-to-position sample-changer interaction — see below for why.

## What is deliberately not covered, and why

A handful of things are *not* tested, and the reason is itself a quality signal worth stating
plainly rather than leaving as a silent gap:

- **They're broken in the app, not in the test.** The phasing viewer,
  the autoprocessing "Files" download page, and the primary Workflow route all throw a JavaScript
  error before any request is even made — see
  [Dead ends and broken journeys](user-journeys.md#dead-ends-and-broken-journeys) for the exact
  errors. A test can't meaningfully pass against a screen that cannot render; writing one anyway
  would mean either asserting the crash (fragile and misleading) or quietly mocking around the bug
  (which would stop testing anything real the moment someone tried to fix it). The project's rule
  here is **file the bug, then write the test** — not the other way around.
- **A route with no reachable trigger.** The "sent to User" shipment status and the create-mode
  address form both have server/client code paths that exist but no UI element anywhere in the
  app actually reaches them.
- **A drag interaction never validated even by hand.** Assigning a puck to a sample-changer
  position via drag-and-drop on the "Prepare Experiment" wizard's SVG diagram was never confirmed
  working end-to-end even during manual exploration, so it wasn't a safe basis for a first
  automated test either — flagged as a follow-up rather than silently skipped.

## Running the tests

```bash
npm install
npm run serve          # static file server on :3000, in one terminal
npm run test:e2e       # headless run of the full suite, in another
```

Or `npm run cypress:open` for the interactive runner, useful when writing or debugging a spec.
Full detail — the `startPage` env var, dev vs. production bundle, CI behaviour — is in the
[Developer Guide](developer-guide.md#running-cypress-tests).

---

## Implementation reference

The sections below are the accumulated, hard-won detail from actually writing all 16 specs
against this specific, decade-old ExtJS codebase — kept because the next person writing a Cypress
test against this app will hit the exact same walls. Collapsed by default so the page above stays
readable as an overview.

<details>
<summary>ExtJS & Bootstrap DOM patterns that come up in almost every spec</summary>

- **Buttons** render as `<a class="x-btn">`, not `<button>`: `cy.contains('a.x-btn', 'Save')`.
- **Disabled state** is a class, not an attribute: `.should('have.class', 'x-disabled')`
  (buttons/menu items) or `x-tab-disabled` (tabs).
- **ExtJS windows** (`Ext.window.Window`) render as `.x-window`; **confirm dialogs**
  (`Ext.Msg.show`) render as `.x-message-box` — `cy.get('.x-message-box').contains('Yes').click()`.
- **Combo boxes** are a text input plus a trigger button; options appear as `.x-boundlist-item`
  after clicking the trigger.
- **ExtJS submenus only expand on a real mouseover event**, not a click —
  `Ext.menu.Menu#onMouseOver` is what actually expands a child menu, and a synthetic
  `.trigger('mouseover')` is unreliable in headless Cypress. The working approach calls the
  framework method directly: `Ext.getCmp(itemId).activate(true); Ext.getCmp(itemId).expandMenu(0);`
  — this is needed for Shipment ▸ Shipments, Manager ▸ Statistics, and any other flyout menu.
- **Bootstrap modals** (`.modal`, used for the date picker, comment form, and statistics forms)
  add the `.in` class immediately, but the modal is not actually focus-stable until Bootstrap's
  300ms fade transition finishes — typing into a field right after `.should('be.visible')` can
  race that transition and silently lose keystrokes. Add a short wait after opening a Bootstrap
  modal before typing into it.
- **Per-card Bootstrap tabs** (Summary, Beamline Parameters, etc. on a data-collection card) are
  plain anchor tags with `href="#some-id"`, not ExtJS tabs — select with
  `cy.get('.nav-tabs').contains('Beamline Parameters').click()`. Some of these tabs' content is
  fetched on-demand behind a short internal delay after the card renders; a click issued before
  that delay elapses updates the visible pane without ever firing the underlying request.
- **`[id$="-suffix"]` selectors** are the standard way to target ExtJS/Dust-templated fields whose
  outer id is a fresh random string per render (`BUI.id()`) — the suffix after the last `-` is
  stable.
- **Field wrapper vs. input:** an ExtJS field selector like `[id$="-container_code"]` resolves to
  the field's wrapper `<div>`, not the `<input>` itself. `.type()` auto-delegates to the focusable
  descendant, but value assertions and `.blur()` need the explicit `input` element.

</details>

<details>
<summary>Fixture catalogue (what already exists, reuse before writing a new one)</summary>

| Path | Contents |
|---|---|
| `cypress/fixtures/proposal/info.json` | Full proposal payload (proteins, sessions, lab contacts) |
| `cypress/fixtures/shipping/shipment.json` | A shipment with no dewars, status `opened` |
| `cypress/fixtures/shipping/shipment-with-containers.json` | A shipment with one dewar/container |
| `cypress/fixtures/shipping/shipment-with-dewars.json` | A shipment with a dewar in `label printed` status (enables the Send button) |
| `cypress/fixtures/shipping/container-6.json` | Single container (puck) detail |
| `cypress/fixtures/mx/samples-container-6.json` | Samples without data collections |
| `cypress/fixtures/mx/samples-container-6-collected.json` | Samples with data collections |
| `cypress/fixtures/mx/datacollections-session.json` | A session's data-collection list — the flat, per-`DataCollection` row shape (not grouped) the real endpoint actually returns |
| `cypress/fixtures/mx/datacollectiongroup-runs.json` | The "Data Collections" (runs) tab's own separate on-demand response |
| `cypress/fixtures/mx/autoproc/*.txt` | **Real recorded server responses** — six `xscale/*` metric CSVs, captured by pointing a live attachment row at a real autoPROC log fixture and recording what came back. See `cypress/fixtures/mx/autoproc/README.md` for the recipe if this ever needs to be re-captured against a different pipeline. |
| `cypress/fixtures/proposal/labcontacts.json` | Lab contacts for the shipment form's From/Return dropdowns |
| `cypress/fixtures/sessions/sessions-date-range.json` | A real session list, captured from the date-range endpoint |
| `cypress/fixtures/csv/*.csv` | Sample CSVs for the import-from-CSV flow, including one deliberately invalid one |

</details>

<details>
<summary>Notable app quirks found while writing tests (that a future spec should expect)</summary>

- **Two view classes share a similar name and are easy to confuse.** `ShipmentForm` is the
  read-only shipment-detail *header* widget; the actual create/edit form is `ShipmentEditForm`.
- **Grid/list "no results" states rarely have real empty-state text.** Several ExtJS grids
  configure an `emptyText`, but it never actually renders when the store is loaded with an empty
  array via `loadData([])` — the correct assertion is the *absence* of row elements, not a
  "No items to display" string. The protein-acronym search screen goes further: an empty result
  renders literally "0 Data Collections" with no placeholder row and no message at all.
- **A save doesn't always mean a re-fetch.** Several "success" handlers re-render straight from
  the save response's echoed data rather than firing a second `GET` — a test asserting on a second
  network call after Save will hang waiting for a request that never comes. Comment saves take
  this even further: the visible text updates from whatever was *typed*, not from the server
  response body at all, so even a nonsense mocked response is enough to test the happy path.
  Address book saves are the exception worth noting for the same reason as the rule: the read-only
  card also re-renders from the client-echoed save payload, no second `GET` there either.
- **Two nearly-identical routes can compete.** Where two controllers register structurally
  similar hash patterns, Path.js resolves to whichever controller was constructed first — order in
  the app's own bootstrap file matters and is easy to accidentally invert.
- **A field's default value depends on which site the app is configured for**, not a fixed
  string — a test that hardcodes one facility's status label instead of reading the live
  configuration will pass on one developer's machine and fail in CI (or vice versa).
- **Some "Download" and "Plot" actions aren't equally testable.** A button wired to
  `window.open(...)` opens a separate browser context that Cypress cannot inspect network traffic
  inside — stub `window.open` and assert on the URL passed to it instead. A button wired to a
  same-page hidden iframe *is* interceptable normally.
- **A visible label is not always a stable selector.** Where the same form `name` attribute is
  reused by several unrelated widgets across the app, prefer a `placeholder` (ExtJS renders
  `emptyText` as the DOM `placeholder`) or another attribute unique to the one field being tested.

</details>

---

For the full narrative of what each journey does and every bug found along the way, see
[User Journeys](user-journeys.md).
