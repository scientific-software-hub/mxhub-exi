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
});
