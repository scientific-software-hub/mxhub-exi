// Tests for protein-acronym search: #/mx/datacollection/protein_acronym/:acronmys/main
// (journey A8 — search data collections by protein acronym)
//
// Route handler: js/mx/controller/mxdatacollectioncontroller.js:28-36 — note the route's own
// param name is misspelled `acronmys` in source; irrelevant here since the hash is always set
// directly, never read back. The handler builds a fresh DataCollectionMxMainView with NO args
// (no sessionId, no proposal) and calls the identical loadCollections(data) used by the session
// route (A7/B3, see mx/data-collections.cy.js) — same 6-tab card rendering, reused wholesale.
//
// Adapter: DataCollectionDataAdapter.prototype.getByAcronymList
// (js/ispyb-client/mx/datacollectiondataadapter.js:30-32) ->
// GET /{token}/proposal/{proposal}/mx/datacollection/protein_acronym/{acronym}/list
//
// Trigger: js/mx/menu/mxmainmenu.js:64-77 — a plain `textfield` with `name: 'field1'` and
// `emptyText: 'search by protein acronym'`. IMPORTANT: `name: 'field1'` is reused by ~10 other
// components across the app (proposalgrid.js, managermenu.js, mxmanagermenu.js, etc.) — it is not
// a usable selector. ExtJS renders `emptyText` as the DOM `placeholder` attribute, which *is*
// unique, so tests select on that instead. A `specialkey` listener on Enter sets
// `location.hash = "/mx/datacollection/protein_acronym/" + field.getValue() + "/main"`.
//
// Empty-result rendering (confirmed against source, not the live app): loadCollections([])
// still takes the "has data" branch in DataCollectionMxMainView.prototype.loadCollections
// (js/mx/view/datacollection/datacollectionmxmainview.js:156-197) because an empty array is
// truthy — the tab title becomes literally "0 Data Collections" (line 190). The grid itself
// (UncollapsedDataCollectionGrid) has no `emptyText` configured anywhere in the file, so it
// renders zero `.x-grid-row`s with no placeholder text at all — assert on absence, not on any
// "no results" string, there isn't one.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');
  cy.intercept('GET', '**/info/get',        { fixture: 'proposal/info.json' }).as('getProposalInfo');

  cy.intercept('GET', '**/mx/datacollection/protein_acronym/*/list',
    { fixture: 'mx/datacollections-session.json' }).as('getByAcronym');

  // Same defensive stubs as mx/data-collections.cy.js's setupIntercepts — the acronym route
  // constructs the identical DataCollectionMxMainView, whose card tabs (Last Collect Results)
  // fire these lazily on click. None of these tests click into them, but stub anyway so nothing
  // hangs if a future test does.
  cy.intercept('GET', '**/autoprocintegration/datacollection/*/view',
    { fixture: 'mx/autoprocintegration-dc.json' }).as('getAutoprocView');
  cy.intercept('GET', '**/datacollection/datacollectiongroupid/*/list',
    { fixture: 'mx/datacollectiongroup-runs.json' }).as('getGroupRuns');
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

function visitMenuSearch() {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Protein acronym search — main-menu textfield (A8)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('typing an acronym and pressing Enter navigates and renders matching DC cards', () => {
    visitMenuSearch();

    cy.get('input[placeholder="search by protein acronym"]').type('ACC{enter}');

    cy.wait('@getByAcronym').its('request.url').should('include', '/protein_acronym/ACC/list');
    cy.location('hash', { timeout: 8000 }).should('include', '/mx/datacollection/protein_acronym/ACC/main');

    // Same card-content assertion style as mx/data-collections.cy.js — the fixture's single
    // DC group carries Protein_acronym: 'ACC' and experiment type 'Characterization'.
    cy.contains('Characterization').should('be.visible');
    cy.contains('ACC').should('be.visible');
  });

  it('shows "0 Data Collections" and no grid rows for an acronym with no matches', () => {
    cy.intercept('GET', '**/mx/datacollection/protein_acronym/*/list', { body: [] }).as('getByAcronym');
    visitMenuSearch();

    cy.get('input[placeholder="search by protein acronym"]').type('NOPE{enter}');
    cy.wait('@getByAcronym');

    cy.contains('a.x-tab', '0 Data Collections').should('be.visible');
    cy.get('.x-grid-row').should('not.exist');
  });

  it('renders the DC card list even though the view is built with no sessionId/proposal', () => {
    // DataCollectionMxMainView() is constructed with zero args on this route (unlike the
    // session route's {sessionId, proposal} — see mxdatacollectioncontroller.js:29 vs :106).
    // Card rendering must not depend on either being set.
    visitMenuSearch();
    cy.get('input[placeholder="search by protein acronym"]').type('ACC{enter}');
    cy.wait('@getByAcronym');

    cy.contains('a.x-tab', 'Data Collections').should('be.visible');
  });
});
