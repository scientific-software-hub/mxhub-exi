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

// ─── Login helper ───────────────────────────────────────────────────────────

// Simulates a real user login: fills the ExtJS auth form and clicks Login.
// DESY_LOCAL has a single site so there is no site dropdown — just User + Password.
function login() {
  cy.visit('/mx/index.html');

  // Auth form appears automatically (no credentials in localStorage)
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('hakanj');
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
    win.EXI.credentialManager.setActiveProposal('hakanj', 'MX1234');

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

  // ── INCORRECT_SAMPLE_NAME (conflict with existing proposal sample) ────────────

  it('shows a validation error when a protein+sample name combination already exists in the proposal', () => {
    // Fixture mx/samples-shipment2.json seeds sample-001/proteinId-4 (5HT3) as an
    // existing sample. The CSV adds the same combination, which PuckValidator rejects.
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
