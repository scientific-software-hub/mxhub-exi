// Tests for the Prepare Experiment wizard: #/mx/prepare/main (journeys B1 + B2).
//
// RETARGETED vs. test-coverage.md's original Step 7 sketch, per test-coverage-journeys.md's Step
// 10 corrections:
// - Step 1's data comes from GET /{proposal}/dewar/list (DewarDataAdapter.getDewarsByProposal,
//   js/ispyb-client/proposal/dewardataadapter.js), NOT GET /{proposal}/shipping/list as originally
//   sketched — PrepareMainView.load() (js/mx/view/prepareexperiment/preparemainview.js:246) calls
//   proposal.dewar.getDewarsByProposal() directly.
// - The fixture is a FLAT array of container rows (one per container, not nested
//   dewarVOs[].containerVOs[]) — confirmed by live-capturing a real response against a running
//   instance (http://localhost:8080/exi/mx, read-only, no status ever changed) during planning.
//   47 real keys observed; mx/prepare-dewars.json below keeps the ~20 the app actually reads.
//
// B1 — status-transition icons (js/mx/view/prepareexperiment/dewarlistselector.js:220-251):
// two actioncolumns per row, "+" (add.png) and "×" (ic_highlight_remove_black_48dp.png). BOTH
// handlers are byte-identical — `grid.getSelectionModel().select(rowIndex);
// _this.onSelect.notify(_this.store.getAt(rowIndex).data);` — only their mutually-exclusive
// `isDisabled` distinguishes them (shippingStatus == "processing" vs. != "processing"). The
// actual status dispatch lives in PrepareMainView's constructor
// (preparemainview.js:31-46, dewarListSelector.onSelect handler): shippingStatus == "processing"
// -> "at DESY"/"at FACILITY" (site-dependent); otherwise -> "processing". Both funnel through
// PrepareMainView.prototype.updateStatus (preparemainview.js:66-79) -> same adapter as A6 ->
// GET /{token}/proposal/{proposal}/shipping/{shippingId}/status/{status}/update, reloading the
// dewar list on success (this.load(), no shipment-form email side-effect, unlike A6).
//
// Site-dependent: mx/config.js's default_site is "LOCAL" (not "DESY"), so
// getSiteName().startsWith("DESY") is false and the "×" icon transitions to "at FACILITY".
// Icons are `img.x-action-col-icon`, disambiguated by `[src$="add.png"]` /
// `[src$="ic_highlight_remove_black_48dp.png"]` — both confirmed live; disabled state is the
// `x-item-disabled` class.
//
// "sent to User"/"Sent_to_User" is a confirmed dead end (grepped the whole js/ tree, no call site
// anywhere passes that string to updateStatus) — no test for it, matching the "don't fake-pass a
// test" rule already applied to B4/B5.
//
// Confirmed cosmetic bug, reproduced live: dewarlistselector.js:60 builds the panel title from
// EXI.proposalManager.getProposals()[0].proposalCode/.proposalNumber — UNPREFIXED keys — but the
// real GET /proposal/list response (and hence the real localStorage.proposals cache) uses
// Proposal_-prefixed keys (confirmed via live capture), so it genuinely renders
// "…undefinedundefined" in production. Our other fixtures (proposal/info.json,
// cypress/support/commands.js's buildAuthState) all use the unprefixed shape, so this does NOT
// reproduce with them — the one test below that pins it deliberately seeds a Proposal_-prefixed
// localStorage.proposals cache to force the real bug to reproduce.
//
// B2 — Step 1 -> Step 2 (js/mx/view/prepareexperiment/loadsamplechangerview.js,
// containerspreparepreadsheet.js, js/mx/widget/pucks/*): no Snap.svg anywhere in this repo
// (test-coverage.md's original sketch was wrong about this) — rendering is dust-templated raw SVG
// (templates/core/puck.template.js). Layout is 1 central + 8 inner + 14 outer = 23
// `circle.puck` elements (a_samplechangerwidget.js:183-215), not "8 inner/10 middle/5 outer".
// Only shippingStatus == "processing" rows ever reach Step 2's spreadsheet
// (ContainerPrepareSpreadSheet.prototype.loadProcessingDewars filters on it).
//
// The "loaded vs empty" puck-coloring mechanism (LoadSampleChangerView.prototype.load:326-366)
// branches on sampleCount: a container with sampleCount > 0 requires a FOLLOW-UP
// GET .../mx/sample/containerid/{ids}/list before any puck is visually marked loaded; a container
// with sampleCount == 0 marks its assigned puck loaded immediately (puck.isEmpty = false) with no
// extra request. This fixture deliberately uses sampleCount: 0 on both "processing" rows to
// exercise the simpler, request-free path — the SVG's exact visual difference for a loaded puck
// wasn't confirmed live, so instead of guessing at colours/classes on the SVG, the "loaded vs.
// unloaded position" test below asserts the difference through the Position column of the
// loaded-containers TABLE (containerspreparepreadsheet.js, dataIndex: 'sampleChangerLocation'),
// which is directly source-confirmed and doesn't depend on unverified SVG rendering details.
//
// Drag-to-position assignment (test-coverage.md's original "step 4") is intentionally not
// attempted — never live-validated even in user-journeys.md, and there's no Snap.svg drag library
// in this app at all; treat as a follow-up requiring its own investigation.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts(dewarsFixture = 'mx/prepare-dewars.json') {
  cy.intercept('POST', '**/authenticate*', { body: { roles: ['Manager'], token: 'test-token' } }).as('authenticate');
  cy.intercept('GET',  '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET',  '**/proposal/list',   { body: [] }).as('getProposals');
  cy.intercept('GET',  '**/info/get',        { fixture: 'proposal/info.json' }).as('getProposalInfo');

  cy.intercept('GET', '**/proposal/*/dewar/list', { fixture: dewarsFixture }).as('getDewars');

  cy.intercept('GET', '**/shipping/*/status/processing/update',
    { fixture: 'shipping/update-status-processing.json' }).as('markProcessing');
  cy.intercept('GET', '**/shipping/*/status/at%20*/update',
    { fixture: 'shipping/update-status-at-facility.json' }).as('markAtFacility');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helpers ────────────────────────────────────────────────────────

function visitPrepareStep1() {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = '#/mx/prepare/main';
  });
  cy.wait('@getDewars');
}

function visitPrepareStep2() {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = '#/mx/prepare/main/loadSampleChanger';
  });
  // Step 2 issues at least one (often two, redundantly — see file header) GET dewar/list calls.
  cy.wait('@getDewars');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Prepare Experiment — Step 1 grid, status-transition icons (B1)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('"+" icon is disabled for a shipment already in "processing"', () => {
    visitPrepareStep1();
    cy.contains('.x-grid-row', 'Test_SG')
      .find('img.x-action-col-icon[src$="add.png"]')
      .should('have.class', 'x-item-disabled');
  });

  it('"+" icon is enabled otherwise; clicking it fires the "processing" status update and reloads', () => {
    visitPrepareStep1();
    cy.contains('.x-grid-row', 'EXI Shipment module test')
      .find('img.x-action-col-icon[src$="add.png"]')
      .should('not.have.class', 'x-item-disabled')
      .click();

    cy.wait('@markProcessing').its('request.url').should('include', '/shipping/138/status/processing/update');
    // PrepareMainView.updateStatus's onSuccess calls this.load() again on the same step.
    cy.wait('@getDewars');
  });

  it('"×" icon is enabled only once shippingStatus is "processing"', () => {
    visitPrepareStep1();
    cy.contains('.x-grid-row', 'EXI Shipment module test')
      .find('img.x-action-col-icon[src$="ic_highlight_remove_black_48dp.png"]')
      .should('have.class', 'x-item-disabled');
    cy.contains('.x-grid-row', 'Test_SG')
      .find('img.x-action-col-icon[src$="ic_highlight_remove_black_48dp.png"]')
      .should('not.have.class', 'x-item-disabled');
  });

  it('clicking "×" fires the status update to "at FACILITY" (site config is LOCAL, not DESY) and reloads', () => {
    visitPrepareStep1();
    cy.contains('.x-grid-row', 'Test_SG')
      .find('img.x-action-col-icon[src$="ic_highlight_remove_black_48dp.png"]')
      .click();

    cy.wait('@markAtFacility').its('request.url').should('include', '/shipping/288/status/at%20FACILITY/update');
    cy.wait('@getDewars');
  });

  it('documents current behavior: the shipment-count label renders "…undefinedundefined" (cosmetic bug)', () => {
    login();
    cy.wait('@getSessions');
    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
      // Seed the REAL Proposal_-prefixed shape (confirmed live) directly — bypasses
      // proposal/info.json's unprefixed (bug-free) shape, which ProposalManager.get() would
      // otherwise lazily fetch and cache instead.
      win.localStorage.setItem('proposals', JSON.stringify([
        { proposal: [{ Proposal_proposalId: 1, Proposal_proposalCode: 'MX', Proposal_proposalNumber: '1234' }] },
      ]));
      win.location.hash = '#/mx/prepare/main';
    });
    cy.wait('@getDewars');

    cy.contains('shipments candidates for undefinedundefined').should('be.visible');
  });

  // Explicitly NOT written: any test attempting a "sent to User"/"Sent_to_User" transition — no
  // call site anywhere in js/ passes that string to updateStatus, confirmed dead.
});

describe('Prepare Experiment — Step 1 → Step 2 wizard flow (B2)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('shows parcel and sample counts in the shipment row', () => {
    visitPrepareStep1();
    cy.contains('.x-grid-row', 'EXI Shipment module test').should('contain', '1 parcels / 1 containers (16 samples)');
  });

  it('Next button advances to Step 2 and renders the P11 sample changer SVG with 23 puck positions', () => {
    visitPrepareStep1();
    cy.contains('a.x-btn', 'Next').click();

    cy.location('hash', { timeout: 8000 }).should('include', '/mx/prepare/main/loadSampleChanger');
    cy.wait('@getDewars');
    cy.get('circle.puck').should('have.length', 23);
  });

  it('renders the loaded-containers table with the expected columns', () => {
    visitPrepareStep2();
    cy.contains('.x-grid-panel, .x-panel-header', 'Loaded or to be Loaded on MxCube').should('be.visible');
    // Several columns share a header-text SUBSTRING with a same-named *hidden* duplicate that
    // sits earlier in DOM order (e.g. the hidden "ContainerId" column vs. the visible
    // "Container" one, and a hidden "Beamline"/beamlineName column vs. the visible
    // "Beamline"/beamlineCombo one — containerspreparepreadsheet.js:83-181) — a bare
    // cy.contains('.x-column-header', 'Container') matches the hidden one first and fails on
    // visibility. Pre-filter to visible headers before matching text.
    ['Shipment', 'Parcel', 'Container', 'Container type', 'Beamline'].forEach((header) => {
      cy.get('.x-column-header:visible').contains(header).should('be.visible');
    });
    cy.contains('.x-grid-row', 'Puck1').should('be.visible');
    cy.contains('.x-grid-row', 'Puck2').should('be.visible');
  });

  it('a container with an assigned sample changer location shows it in the Position column; an unassigned one shows blank', () => {
    visitPrepareStep2();
    // Puck1 (shippingId 288) was seeded with sampleChangerLocation "1"; Puck2 (shippingId 300)
    // has none — this is the safe, source-confirmed way to assert "loaded vs. unloaded position"
    // without depending on the SVG's own (unverified) visual styling for the same state.
    // Position is the last VISIBLE column (Absolute position, after it, is hidden) — scoping to
    // it specifically avoids false matches from the Beamline column's "P11" text, which itself
    // contains the digit "1".
    cy.contains('.x-grid-row', 'Puck1').find('.x-grid-cell').last().invoke('text').should('eq', '1');
    // ExtJS pads an empty cell with a non-breaking space rather than leaving it truly empty.
    cy.contains('.x-grid-row', 'Puck2').find('.x-grid-cell').last().invoke('text').then((t) => t.trim()).should('eq', '');
  });

  it('Previous button returns to Step 1 with the dewar list preserved', () => {
    visitPrepareStep2();
    cy.contains('a.x-btn', 'Previous').click();

    cy.location('hash', { timeout: 8000 }).should('eq', '#/mx/prepare/main');
    cy.wait('@getDewars');
    cy.contains('.x-grid-row', 'EXI Shipment module test').should('be.visible');
  });

  it('"Unload all" button is visible in Step 2', () => {
    visitPrepareStep2();
    cy.contains('a.x-btn', 'Unload all').should('be.visible');
  });

  // Drag-to-position assignment (doc's step 4) intentionally not attempted — see file header.
});
