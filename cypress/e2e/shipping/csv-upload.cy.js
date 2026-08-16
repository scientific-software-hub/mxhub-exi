// Tests for CSV import: #/shipping/:shippingId/import/csv
// Route handler: js/core/controller/shippingexicontroller.js:109
// Main view:     js/core/view/shipping/csvpuckformview.js
// Spreadsheet:   js/core/view/shipping/csvcontainerspreadsheet.js

const SHIPPING_ID = 1;

// ─── Network mocks ──────────────────────────────────────────────────────────

function setupIntercepts() {
  // Authentication — POST /authenticate returns roles + token
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  // Welcome page requests (manager loads today's sessions + full proposal list)
  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  // CSV import page requests
  cy.intercept('GET', '**/shipping/1/get',             { fixture: 'shipping/shipment.json' }).as('getShipment');
  cy.intercept('GET', '**/shipping/1/shipmentIds',     { body: [] }).as('getShipmentIds');
  cy.intercept('GET', '**/mx/sample/shipmentid/*/list',{ body: [] }).as('getSamples');

  // Proposal info — sync XHR triggered by ProposalManager.get(forceUpdate=true)
  // inside CSVPuckFormView.save()
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');

  // Called by ShipmentForm.hasDataCollections() after redirect to #/shipping/1/main.
  // The URL has a typo ("datacollecitons") that is in the app source itself.
  cy.intercept('GET', '**/shipping/1/datacollecitons/list', { body: [] }).as('getDataCollections');

  // Save endpoint
  cy.intercept('POST', '**/shipping/1/dewars/add',
    { fixture: 'shipping/add-dewars-success.json' }).as('addDewars');
}

// Same as setupIntercepts() but deliberately omits the dewars/add stub — used
// by tests that need to register their own (e.g. delayed) intercept for that
// route as the *only* handler. Registering a second overlapping intercept for
// the same route on top of setupIntercepts()'s immediate stub does not
// reliably override its response timing in this Cypress version: the earlier
// static stub can still win the race, so a delayed override placed after it
// is not a safe way to simulate a slow save.
function setupInterceptsWithoutDewarsAdd() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');
  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');
  cy.intercept('GET', '**/shipping/1/get',             { fixture: 'shipping/shipment.json' }).as('getShipment');
  cy.intercept('GET', '**/shipping/1/shipmentIds',     { body: [] }).as('getShipmentIds');
  cy.intercept('GET', '**/mx/sample/shipmentid/*/list',{ body: [] }).as('getSamples');
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');
  cy.intercept('GET', '**/shipping/1/datacollecitons/list', { body: [] }).as('getDataCollections');
}

// ─── Login helper ───────────────────────────────────────────────────────────

// Simulates a real user login: fills the ExtJS auth form and clicks Login.
// DESY_LOCAL has a single site so there is no site dropdown — just User + Password.
function login() {
  cy.visitMx();

  // Auth form appears automatically (no credentials in localStorage)
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');

  // formBind button is disabled until both fields are valid
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();

  cy.wait('@authenticate');
}

// ─── Navigation helper ───────────────────────────────────────────────────────

// After login the welcome page loads. We then:
//   1. Activate proposal MX1234 programmatically (avoids having to click through
//      the session/proposal grid, which is a separate feature under test).
//   2. Patch CSVPuckFormView.prototype.load to capture the view instance.
//   3. Navigate to the CSV import route via hash change.
function visitCsvImportPage() {
  login();

  // Wait for welcome page to stabilise
  cy.wait('@getSessions');

  cy.window().then((win) => {
    // Activate the proposal so getDataAdapter() resolves {token, proposal, url}
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');

    // Patch load() to capture the view instance before the route fires.
    // CSVPuckFormView is a global function declaration so we patch its prototype
    // here (after scripts have run) rather than via Object.defineProperty in
    // onBeforeLoad (function declarations bypass property setters).
    const origLoad = win.CSVPuckFormView.prototype.load;
    win.CSVPuckFormView.prototype.load = function (...args) {
      win.__testCsvView = this;
      return origLoad.apply(this, args);
    };

    win.location.hash = `#/shipping/${SHIPPING_ID}/import/csv`;
  });

  cy.wait('@getShipment');
}

// ─── CSV upload helper ───────────────────────────────────────────────────────

// Loads CSV data into the spreadsheet, working around an app bug in
// CSVContainerSpreadSheet.prototype.loadData.
//
// The bug: loadData(data) passes `data` both as the Handsontable data source
// AND captures it in an afterCreateRow closure that splices from it.
// When Handsontable fires afterCreateRow during initialisation the closure
// empties `data` in place, so getData() returns [] and isDataValid() finds
// nothing to validate — every save "passes".
//
// Workaround:
//   1. Re-initialise the Handsontable with [[]] so the afterCreateRow closure
//      now closes over [[]] (not over csvData).
//   2. Then call ht.loadData(csvData) on the live instance. afterCreateRow
//      fires again but splices [[]] (already empty) — csvData is untouched.
//   3. getData() now returns csvData and validation works correctly.
function uploadCsv(fixturePath) {
  cy.readFile(`cypress/fixtures/csv/${fixturePath}`, 'utf8').then((csvContent) => {
    cy.window().then((win) => {
      const view = win.__testCsvView;
      expect(view, '__testCsvView — CSVPuckFormView.prototype.load patch must have fired').to.exist;

      // Step 1 — ensure the Handsontable exists and its afterCreateRow
      // closure captures [[]] (not our CSV data).
      view.containerSpreadSheet.loadData([[]]);

      // Step 2 — update with real CSV data via the instance method.
      view.containerSpreadSheet.spreadSheet.loadData(view.csvToArray(csvContent));
    });
  });
}

function waitForSpreadsheetRows() {
  return cy.get('.htCore td', { timeout: 6000 }).should('have.length.greaterThan', 0);
}

// ─── Intercept setup variants ────────────────────────────────────────────────

// Like setupIntercepts() but serves a shipment that already has dewarA/containerA,
// used to test INCORRECT_PARCEL_NAME and INCORRECT_CONTAINER_NAME.
function setupInterceptsWithExistingContainers() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');
  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');
  cy.intercept('GET', '**/shipping/1/get',
    { fixture: 'shipping/shipment-with-containers.json' }).as('getShipment');
  cy.intercept('GET', '**/shipping/1/shipmentIds',     { body: [] }).as('getShipmentIds');
  cy.intercept('GET', '**/mx/sample/shipmentid/*/list',{ body: [] }).as('getSamples');
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');
  cy.intercept('GET', '**/shipping/1/datacollecitons/list', { body: [] }).as('getDataCollections');
  cy.intercept('POST', '**/shipping/1/dewars/add',
    { fixture: 'shipping/add-dewars-success.json' }).as('addDewars');
}

// Like setupIntercepts() but seeds an existing sample (sample-001 / proteinId 4)
// in a second shipment, used to test the proposal-conflict branch of INCORRECT_SAMPLE_NAME.
function setupInterceptsWithProposalSample() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');
  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');
  cy.intercept('GET', '**/shipping/1/get',  { fixture: 'shipping/shipment.json' }).as('getShipment');
  // Return a second shipment id so getSamplesFromProposal() fetches its samples
  cy.intercept('GET', '**/shipping/1/shipmentIds', { body: [2] }).as('getShipmentIds');
  cy.intercept('GET', '**/mx/sample/shipmentid/2/list',
    { fixture: 'mx/samples-shipment2.json' }).as('getSamplesShipment2');
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');
  cy.intercept('GET', '**/shipping/1/datacollecitons/list', { body: [] }).as('getDataCollections');
  cy.intercept('POST', '**/shipping/1/dewars/add',
    { fixture: 'shipping/add-dewars-success.json' }).as('addDewars');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CSV Import — #/shipping/1/import/csv', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders the import page with a file browse button and empty spreadsheet', () => {
    visitCsvImportPage();
    cy.contains('Import CSV', { timeout: 8000 }).should('be.visible');
    cy.contains('Browse').should('be.visible');
    cy.contains('Save').should('be.visible');
    cy.contains('Return to shipment').should('be.visible');
  });

  it('populates the spreadsheet when a valid CSV file is selected', () => {
    visitCsvImportPage();
    uploadCsv('valid.csv');
    waitForSpreadsheetRows();
    cy.get('.htCore td').first().should('contain', 'dewarA');
  });

  it('calls dewars/add and redirects to shipment on save with valid data', () => {
    visitCsvImportPage();
    uploadCsv('valid.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.wait('@addDewars').its('request.body').should('include', 'dewars');
    cy.location('hash', { timeout: 8000 }).should('include', `shipping/${SHIPPING_ID}/main`);
  });

  it('shows an error notification when Save is clicked with no file uploaded', () => {
    visitCsvImportPage();
    cy.contains('Save').click();
    cy.contains('no Dewars', { timeout: 6000 }).should('be.visible');
  });

  it('shows a validation error for sample names containing special characters', () => {
    visitCsvImportPage();
    uploadCsv('bad-sample.csv');
    waitForSpreadsheetRows();
    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
  });

  it('shows a validation error when the protein acronym is not in the database', () => {
    visitCsvImportPage();
    uploadCsv('unknown-protein.csv');
    waitForSpreadsheetRows();
    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
  });

  // ── Real-world CSV files ────────────────────────────────────────────────────

  it.skip('accepts the correct real-world CSV and saves successfully', () => {
    // 13 samples, proteins decx2 (rows 1-7) and krth (rows 8-13), all valid names
    visitCsvImportPage();
    uploadCsv('2_Test_ISPyB_import_exptype-list_CELLS_EXP_TYPE_Correct.csv');
    waitForSpreadsheetRows();
    cy.get('.htCore tr', { timeout: 6000 }).should('have.length.at.least', 13);

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.wait('@addDewars').its('request.body').should('include', 'dewars');
    cy.location('hash', { timeout: 8000 }).should('include', `shipping/${SHIPPING_ID}/main`);
  });

  it.skip('rejects the real-world CSV with special characters in sample names', () => {
    // Rows 4-6 have Wtg435%01, Wtg435 02, Wtg435?03 — invalid chars
    visitCsvImportPage();
    uploadCsv('2_Test_ISPyB_import_exptype-list_CELLS_EXP_TYPE_inCorrect_specialSymbols.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_PARCEL_NAME — dewar name already exists in shipment ────────────

  it('shows a validation error when the dewar name already exists in the shipment', () => {
    // Shipment fixture already contains dewarA, so the CSV row with dewarA is rejected.
    // CSVContainerSpreadSheet.isParcelNameValid() checks dewarNameControlledList.
    setupInterceptsWithExistingContainers();
    visitCsvImportPage();
    uploadCsv('valid.csv'); // valid.csv uses dewarA — already in the shipment fixture
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_CONTAINER_NAME — container name already exists in shipment ─────

  it('shows a validation error when the container name already exists in the shipment', () => {
    // Shipment fixture contains containerA inside dewarA.
    // The CSV uses a fresh dewar name (dewarB) but reuses containerA.
    setupInterceptsWithExistingContainers();
    visitCsvImportPage();

    const csvContent = 'dewarB,containerA,Unipuck,1,5HT3,sample-001\n';
    cy.window().then((win) => {
      const view = win.__testCsvView;
      view.containerSpreadSheet.loadData([[]]);
      view.containerSpreadSheet.spreadSheet.loadData(view.csvToArray(csvContent));
    });
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_CONTAINER_TYPE — type not in allowed list ──────────────────────

  it('shows a validation error for an unrecognised container type', () => {
    visitCsvImportPage();
    uploadCsv('invalid-container-type.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_SAMPLE_POSITION — position exceeds container capacity ──────────

  it('shows a validation error when the sample position exceeds the container capacity', () => {
    // Unipuck holds 16 samples; position 17 is invalid.
    visitCsvImportPage();
    uploadCsv('over-capacity.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_PROTEIN_NAME — protein acronym contains special characters ─────

  it('shows a validation error for a protein acronym containing special characters', () => {
    // "5HT3%" fails isProteinNameValid() regex; NO_PROTEIN_IN_DB also fires but
    // is displayed earlier in the priority chain — either way save is blocked.
    visitCsvImportPage();
    uploadCsv('bad-protein.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── INCORRECT_SAMPLE_NAME (duplicate within CSV) ─────────────────────────────

  it('shows a validation error when the same protein+sample name pair appears twice in the CSV', () => {
    // PuckValidator.checkSampleNames() detects the duplicate {proteinId, name} pair.
    visitCsvImportPage();
    uploadCsv('duplicate-sample.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });

  // ── DUPLICATE_SAMPLE_NAME (conflict with existing proposal sample) ───────────

  it('shows the uniqueness warning when a protein+sample combination already exists in the proposal', () => {
    // Fixture mx/samples-shipment2.json seeds sample-001/proteinId-4 (5HT3) as an
    // existing sample. The CSV adds the same combination; PuckValidator pushes it to
    // DUPLICATE_SAMPLE_NAME which is routed to uniquenessSampleNamePanelId, not
    // the special-chars panel (that was the bug this test guards against).
    setupInterceptsWithProposalSample();
    visitCsvImportPage();
    uploadCsv('valid.csv'); // valid.csv: dewarA/containerA/5HT3/sample-001

    // Wait for the async getSamplesFromProposal() chain to complete before saving
    cy.wait('@getSamplesShipment2');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@getProposalInfo');
    cy.contains('data contain errors', { timeout: 6000 }).should('be.visible');
    cy.get('@addDewars.all').should('have.length', 0);
  });
});

// ─── Overlay / double-submit guard ─────────────────────────────────────────
//
// A separate describe block (own beforeEach) so its dewars/add intercept is
// registered exactly once per test — see setupInterceptsWithoutDewarsAdd().
//
// CSVPuckFormView.save() has two layers of protection against duplicate
// saves (see js/core/view/shipping/csvpuckformview.js):
//   1. this._saving — a re-entrancy guard set for the whole in-flight
//      window and checked at the top of save(). This is the actual
//      guarantee: it blocks a second invocation regardless of how it was
//      triggered (mouse, keyboard, or a Cypress-forced synthetic click).
//   2. Ext.getBody().mask(...) — a full-screen ExtJS mask, for user-facing
//      feedback ("page looks frozen" -> now shows Saving CSV). It also
//      physically covers the Save button so a REAL mouse click can't reach
//      it, but that alone wouldn't stop a non-pointer re-invocation, which
//      is why (1) exists.
//
// These tests verify the mechanism directly via spies on
// Ext.dom.Element.prototype.mask/unmask (deterministic — no dependency on
// transient DOM/CSS state or response timing, both of which proved flaky:
// the app also uses panel.setLoading() elsewhere, which creates an
// Ext.LoadMask component reusing the exact same x-mask/x-mask-msg CSS
// classes, and a `delay:` option on a stubbed response was observed to
// resolve near-instantly regardless of the configured delay in this
// environment) and on the actual request count for the double-click case.
describe('CSV Import — Save overlay / double-submit guard', () => {
  beforeEach(() => {
    setupInterceptsWithoutDewarsAdd();
  });

  function spyOnMask() {
    return cy.window().then((win) => {
      cy.spy(win.Ext.dom.Element.prototype, 'mask').as('maskSpy');
      cy.spy(win.Ext.dom.Element.prototype, 'unmask').as('unmaskSpy');
    });
  }

  it('masks the page while saving and unmasks it once the save succeeds', () => {
    cy.intercept('POST', '**/shipping/1/dewars/add',
      { fixture: 'shipping/add-dewars-success.json' }).as('addDewars');

    visitCsvImportPage();
    spyOnMask();
    uploadCsv('valid.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();

    cy.get('@maskSpy').should('have.been.calledWith', 'Saving CSV. Please wait…');
    cy.wait('@addDewars');
    cy.get('@unmaskSpy').should('have.been.called');
  });

  it('unmasks the page when the save request fails so the user can retry', () => {
    cy.intercept('POST', '**/shipping/1/dewars/add', {
      statusCode: 500,
      body: 'Internal Server Error',
    }).as('addDewarsFail');

    visitCsvImportPage();
    spyOnMask();
    uploadCsv('valid.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    cy.wait('@addDewarsFail');

    cy.get('@maskSpy').should('have.been.calledWith', 'Saving CSV. Please wait…');
    cy.get('@unmaskSpy').should('have.been.called');
    cy.contains('Save').should('be.visible');
  });

  it('sends only one save request when Save is clicked multiple times', () => {
    // Held open deterministically so the forced second click reliably lands
    // while the first save() call is still in flight (this._saving = true),
    // regardless of how fast a stubbed response would otherwise resolve.
    let release;
    const held = new Promise((resolve) => { release = resolve; });
    cy.intercept('POST', '**/shipping/1/dewars/add', (req) => {
      return held.then(() => req.reply({ fixture: 'shipping/add-dewars-success.json' }));
    }).as('addDewarsSlow');

    visitCsvImportPage();
    uploadCsv('valid.csv');
    waitForSpreadsheetRows();

    cy.contains('Save').click();
    // Bypass actionability (the mask visually covers the button for a real
    // click) to prove the _saving guard — not just the overlay — is what
    // blocks re-entrancy.
    cy.contains('Save').click({ force: true });
    cy.contains('Save').click({ force: true });

    cy.then(() => release());
    cy.wait('@addDewarsSlow');

    // Exactly one POST — no duplicate, despite three clicks.
    cy.get('@addDewarsSlow.all').should('have.length', 1);
  });
});
