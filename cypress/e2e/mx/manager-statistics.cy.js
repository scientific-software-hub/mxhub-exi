// Tests for the Manager ▸ Statistics menu (journey C2), plus the Manager-only menu gate (C1).
//
// Menu: js/mx/menu/mxmanagermenu.js:91-161 — top-level "Manager" button reveals a menu with one
// item, "Statistics", whose own submenu (only revealed on a real hover, not a click — same
// ExtJS quirk already documented in shipping/shipment-create.cy.js for the "Shipments" submenu)
// has the 3 leaf items below. All 3 share one handler (js/mx/menu/mxmanagermenu.js:93-124) that
// dispatches on `item.text` STRING EQUALITY — renaming a menu label silently breaks it. Each
// opens a Bootstrap-modal form ({id}-modal where {id} is a fresh BUI.id() per open — never
// hardcode the id, only `[id$="-suffix"]`).
//
// Gating (C1): NOT per-menu-item. js/core/app/exi.js:170-177 swaps the ENTIRE menu object
// (MXManagerMenu vs MXMainMenu) based on `credential.isManager()`
// (js/core/security/credential.js:14-24 — a substring match on
// `JSON.stringify(roles).toLowerCase()`), so MXMainMenu (non-manager) has no "Manager" button
// at all — not merely a hidden/disabled one.
//
// Plot vs Download — different interceptability, the crux of this file:
//   - "Plot" (all 3 forms) -> window.open(...) to a new tab/window. Cypress cannot observe
//     network traffic inside a popup, so window.open itself is stubbed and its URL argument
//     asserted instead of intercepting a request.
//   - "Download" (DatacollectionForm/ExperimentsForm only — ScatteringForm has no Download
//     button at all) -> appends a hidden `<iframe id="downloadIframe">` with `src` set directly
//     to the CSV URL, in the CURRENT tab — same-tab iframe navigations ARE interceptable with
//     cy.intercept().
//
// Both Plot AND Download methods across all 3 forms guard on `startDate/endDate` being valid AND
// `endDate >= startDate` before firing anything — an invalid/empty date silently falls through to
// a `.notify()` warning instead. ScatteringForm.plot() and DatacollectionForm.plot()/download()
// additionally require at least one metric checkbox checked; ExperimentsForm.plot() requires it
// too, but ExperimentsForm.download() does NOT — its checkbox-collecting loop is commented out
// (experimentsform.js:88-90), so `checkedValues` is always `[]` there. Every test below fills
// whatever combination of date/checkbox each method actually needs — no more.
//
// "Proposals to exclude" is a free-text field, not a checkbox — it becomes the `testproposals`
// query param, defaulting to the literal string "0" when left empty in
// DatacollectionForm.plot()/download() AND ExperimentsForm.download()
// (datacollectionform.js:91-93,122-124; experimentsform.js:126-129) but NOT in
// ExperimentsForm.plot(), where the default is commented out (experimentsform.js:96-98) — sends
// `testproposals=` empty instead of `0`. Confirmed inconsistency, pinned below.
//
// ExperimentsForm.download()'s iframe `src` has an extra `&/&title=...&/&y=...&/&x=recordTimeStamp&`
// viewer-style suffix appended directly onto the real CSV URL (experimentsform.js:159) — since
// `checkedValues` is always `[]` there, that suffix always reads `&/&y=&/&x=recordTimeStamp&`.
// DatacollectionForm.download() has no such suffix — its iframe `src` is the bare CSV URL, the
// `urlParams` variable built alongside it is computed but never used (dead code, only the
// commented-out `window.open` line would have read it).
//
// Both ExperimentsForm and DatacollectionForm.download() carry unconditional `debugger;`
// statements (ExperimentsForm.load():42, .plot():103, .download():147;
// DatacollectionForm.download():138) — inert under `cypress run` headless, matches the pattern
// already noted for mainmenu.js's Create-Shipment Save handler in shipment-create.cy.js.
//
// URL templates (js/ispyb-client/mx/statisticsdataadapter.js):
//   GET /{token}/stats/autoprocstatistics/{type}/{startDate}/{endDate}/csv
//   GET /{token}/stats/datacollectionstatistics/{imageslimit}/{startDate}/{endDate}/0/csv?testproposals={proposals}
//   GET /{token}/stats/experimentstatistics/{startDate}/{endDate}/0/csv?testproposals={proposals}

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts(roles = ['Manager']) {
  cy.intercept('POST', '**/authenticate*', { body: { roles, token: 'test-token' } }).as('authenticate');
  cy.intercept('GET',  '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET',  '**/proposal/list',   { body: [] }).as('getProposals');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper ─────────────────────────────────────────────────────────

// Logs in, activates MX1234, opens Manager ▸ Statistics ▸ {itemText}. Same "drive the ExtJS
// component directly" trick as shipping/shipment-create.cy.js's "Shipments" submenu and
// auth/login.cy.js's credential dropdown — "Statistics" only reveals its own submenu on a real
// hover, not a click.
function openStatisticsForm(itemText) {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
  });

  cy.contains('.x-btn', 'Manager').click();
  cy.contains('.x-menu-item', 'Statistics').invoke('attr', 'id').then((id) => {
    cy.window().then((win) => {
      const item = win.Ext.getCmp(id);
      item.activate(true); // doExpandMenu() no-ops unless the item is "activated" first
      item.expandMenu(0);
    });
  });
  cy.contains('.x-menu-item', itemText).click();

  // Newly-found race, same class as mx/comment.cy.js's documented Bootstrap-modal focus-steal:
  // Modal.prototype.show (node_modules/bootstrap/js/modal.js:96-105) steals focus back onto the
  // outer .modal div once the 300ms fade transition ends, dropping any keystrokes typed before
  // that into a child field. Wait it out before typing into any of these forms' date inputs.
  cy.wait(350);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Manager menu — Persona C gating (C1)', () => {
  it('"Manager" top-level menu item is visible for a Manager-role login', () => {
    setupIntercepts(['Manager']);
    login();
    cy.contains('.x-btn', 'Manager').should('be.visible');
  });

  it('"Manager" top-level menu item is absent for a User-role login', () => {
    setupIntercepts(['User']);
    login();
    cy.contains('.x-btn', 'Manager').should('not.exist');
  });
});

describe('Manager ▸ Statistics — Autoproc Scaling Statistics (ScatteringForm)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('opens with Date, Type, Beamline fields and per-metric checkboxes, no Download button', () => {
    openStatisticsForm('Autoproc Scaling Statistics');

    cy.get('[id$="-date"]').should('be.visible');
    cy.get('[id$="-type"]').should('exist');
    cy.get('[id$="-beamline"]').should('exist');
    cy.get('.scattering-checkbox').should('have.length.greaterThan', 0);
    cy.get('[id$="-download"]').should('not.exist');
    cy.contains('.modal-footer button', 'Plot (last 7 days)').should('be.visible');
  });

  it('clicking "Plot (last 7 days)" calls window.open with a viewer URL containing the autoprocstatistics csv url', () => {
    openStatisticsForm('Autoproc Scaling Statistics');
    cy.window().then((win) => cy.stub(win, 'open').as('windowOpen'));

    cy.get('[id$="-date"]').type('01-08-2026');
    cy.get('.scattering-checkbox').first().check({ force: true });
    cy.contains('.modal-footer button', 'Plot (last 7 days)').click();

    cy.get('@windowOpen').should('have.been.calledOnce');
    cy.get('@windowOpen').its('firstCall.args.0')
      .should('include', 'viewer/scatter/index.html')
      .and('include', '/stats/autoprocstatistics/');
  });
});

describe('Manager ▸ Statistics — Datacollection Statistics (DatacollectionForm)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('opens with start/end date, Number of Images select, "Proposals to exclude" text field, Download and Plot buttons', () => {
    openStatisticsForm('Datacollection Statistics');

    cy.get('[id$="-start-date"]').should('be.visible');
    cy.get('[id$="-end-date"]').should('be.visible');
    cy.get('[id$="-type"]').should('exist');
    cy.get('[id$="-proposals"]').should('exist');
    cy.contains('.modal-footer button', 'Download').should('be.visible');
    cy.contains('.modal-footer button', 'Plot').should('be.visible');
  });

  it('Download with "Proposals to exclude" left empty fires a request with testproposals=0 (default)', () => {
    cy.intercept('GET', '**/stats/datacollectionstatistics/**', { fixture: 'mx/stats-download.csv' }).as('getStatsCsv');
    openStatisticsForm('Datacollection Statistics');

    cy.get('[id$="-start-date"]').type('25-07-2026');
    cy.get('[id$="-end-date"]').type('01-08-2026');
    cy.get('.datacollection-checkbox').first().check({ force: true });
    cy.contains('.modal-footer button', 'Download').click();

    cy.wait('@getStatsCsv').its('request.url').should('include', 'testproposals=0');
  });

  it('Download with a value in "Proposals to exclude" includes it verbatim in testproposals', () => {
    cy.intercept('GET', '**/stats/datacollectionstatistics/**', { fixture: 'mx/stats-download.csv' }).as('getStatsCsv');
    openStatisticsForm('Datacollection Statistics');

    cy.get('[id$="-start-date"]').type('25-07-2026');
    cy.get('[id$="-end-date"]').type('01-08-2026');
    cy.get('[id$="-proposals"]').type('999,1000');
    cy.get('.datacollection-checkbox').first().check({ force: true });
    cy.contains('.modal-footer button', 'Download').click();

    // No encodeURIComponent anywhere in the adapter — the comma is sent through verbatim.
    cy.wait('@getStatsCsv').its('request.url').should('include', 'testproposals=999,1000');
  });
});

describe('Manager ▸ Statistics — Experiments Statistics (ExperimentsForm)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('Download\'s request URL carries the extra "&/&title=…" viewer-style suffix appended to the real csv url (documents current behavior)', () => {
    cy.intercept('GET', '**/stats/experimentstatistics/**', { fixture: 'mx/stats-download.csv' }).as('getStatsCsv');
    openStatisticsForm('Experiments Statistics');

    // Download needs no checkbox (the collecting loop is commented out) — just valid dates.
    cy.get('[id$="-start-date"]').type('25-07-2026');
    cy.get('[id$="-end-date"]').type('01-08-2026');
    cy.contains('.modal-footer button', 'Download').click();

    cy.wait('@getStatsCsv').its('request.url')
      .should('include', '/stats/experimentstatistics/')
      .and('include', '&/&title=')
      .and('include', '&/&y=&/&x=recordTimeStamp&');
  });

  it('Plot with "Proposals to exclude" empty sends testproposals= (empty, NOT defaulted to 0 — documents the plot/download default inconsistency)', () => {
    openStatisticsForm('Experiments Statistics');
    cy.window().then((win) => cy.stub(win, 'open').as('windowOpen'));

    // Unlike download(), plot() DOES require a checked checkbox (its own collecting loop is not
    // commented out) — check one so the guard passes.
    cy.get('[id$="-start-date"]').type('25-07-2026');
    cy.get('[id$="-end-date"]').type('01-08-2026');
    cy.get('.experiments-checkbox').first().check({ force: true });
    cy.contains('.modal-footer button', 'Plot').click();

    cy.get('@windowOpen').should('have.been.calledOnce');
    cy.get('@windowOpen').its('firstCall.args.0').should('include', 'testproposals=&/&title=');
  });
});
