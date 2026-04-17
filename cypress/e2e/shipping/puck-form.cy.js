// Tests for single-puck create/edit: #/shipping/:id/:status/containerId/:id/edit
// Route handler: js/core/controller/shippingexicontroller.js:96
// Main view:     js/core/view/shipping/a_puckformview.js
// Spreadsheet:   js/core/view/shipping/containerspreadsheet.js

const SHIPPING_ID = 1;
const CONTAINER_ID = 6;
const SHIPPING_STATUS = 'delivered';

// ─── Network mocks ───────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  // Proposal info — needed for protein autocomplete in the spreadsheet
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');

  // getContainerById(containerId, containerId, containerId) — all three params are CONTAINER_ID
  cy.intercept(
    'GET',
    `**/shipping/${CONTAINER_ID}/dewar/${CONTAINER_ID}/puck/${CONTAINER_ID}/get`,
    { fixture: 'shipping/container-6.json' },
  ).as('getContainer');

  // getSamplesByContainerId — only used to decide renderCrystalFormColumn and enable Save
  cy.intercept(
    'GET',
    `**/mx/sample/containerid/${CONTAINER_ID}/list`,
    { fixture: 'mx/samples-container-6.json' },
  ).as('getContainerSamples');

  // getSamplesFromProposal() chain
  cy.intercept('GET', `**/shipping/${SHIPPING_ID}/shipmentIds`, { body: [] }).as('getShipmentIds');
  cy.intercept('GET', '**/mx/sample/shipmentid/*/list', { body: [] }).as('getSamples');

  // After redirect back to shipment
  cy.intercept('GET', `**/shipping/${SHIPPING_ID}/datacollecitons/list`, { body: [] }).as('getDataCollections');

  // saveContainer(containerId, containerId, containerId, puck) — all three params are CONTAINER_ID
  cy.intercept(
    'POST',
    `**/shipping/${CONTAINER_ID}/dewar/${CONTAINER_ID}/puck/${CONTAINER_ID}/save`,
    { fixture: 'shipping/save-container-success.json' },
  ).as('saveContainer');
}

// ─── Login helper ────────────────────────────────────────────────────────────

function login() {
  cy.visit('/mx/index.html');
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('hakanj');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper ───────────────────────────────────────────────────────

// After login:
//   1. Activate proposal MX1234 so getDataAdapter() resolves credentials.
//   2. Patch PuckFormView.prototype.load to capture the view as win.__testPuckView.
//   3. Navigate to the puck-edit route.
//   4. Wait for getSamplesByContainerId — the last XHR in the load chain.
//      When it resolves, the spreadsheet is populated and the Save button state
//      has been decided by fillSamplesGrid().
function visitPuckFormPage() {
  login();
  cy.wait('@getSessions');

  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('hakanj', 'MX1234');

    const origLoad = win.PuckFormView.prototype.load;
    win.PuckFormView.prototype.load = function (...args) {
      win.__testPuckView = this;
      return origLoad.apply(this, args);
    };

    win.location.hash =
      `#/shipping/${SHIPPING_ID}/${SHIPPING_STATUS}/containerId/${CONTAINER_ID}/edit`;
  });

  // getContainerSamples is the last XHR in the load chain; waiting for it
  // guarantees the grid is initialised and the Save button state is resolved.
  cy.wait('@getContainerSamples');
}

// ─── Spreadsheet helpers ─────────────────────────────────────────────────────

function waitForGridReady() {
  // The grid is 16 rows tall (Unipuck capacity); position column renders integers.
  return cy.get('.htCore td', { timeout: 8000 }).should('have.length.greaterThan', 0);
}

// Sets a cell value in the ContainerSpreadSheet via the Handsontable instance.
// row/col are 0-based Handsontable indices.
function setCell(row, colName, value) {
  cy.window().then((win) => {
    const ss = win.__testPuckView.containerSpreadSheet;
    ss.spreadSheet.setDataAtCell(row, ss.getColumnIndex(colName), value);
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe(`Puck Form — #/shipping/${SHIPPING_ID}/${SHIPPING_STATUS}/containerId/${CONTAINER_ID}/edit`, () => {
  beforeEach(() => {
    setupIntercepts();
  });

  // ── Page structure ──────────────────────────────────────────────────────────

  it('renders the puck form with toolbar buttons and a pre-loaded sample grid', () => {
    visitPuckFormPage();
    cy.contains('Shipment',          { timeout: 8000 }).should('be.visible');
    cy.contains('Save').should('be.visible');
    cy.contains('Return to shipment').should('be.visible');
    // Spreadsheet position column should start at 1
    cy.get('.htCore td').first().should('contain', '1');
  });

  // ── Save button enable / disable ────────────────────────────────────────────

  it('disables the Save button when the container has data-collected samples', () => {
    // Override the default no-collection fixture with the collected variant.
    // Cypress uses LIFO for intercepts, so this registration wins over beforeEach.
    cy.intercept(
      'GET',
      `**/mx/sample/containerid/${CONTAINER_ID}/list`,
      { fixture: 'mx/samples-container-6-collected.json' },
    ).as('getContainerSamples');

    visitPuckFormPage();
    // fillSamplesGrid() enables Save only when withoutCollection.length == samples.length.
    // With all samples collected that condition is false — button stays disabled.
    cy.contains('a.x-btn', 'Save').should('have.class', 'x-disabled');
  });

  it('enables the Save button when all samples have no data collections', () => {
    visitPuckFormPage();
    cy.contains('a.x-btn', 'Save').should('not.have.class', 'x-disabled');
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('saves and redirects to the shipment page on valid data', () => {
    visitPuckFormPage();
    waitForGridReady();
    cy.contains('a.x-btn', 'Save').should('not.have.class', 'x-disabled');

    cy.contains('Save').click();
    cy.wait('@saveContainer').its('request.body').should('include', 'puck');
    cy.location('hash', { timeout: 8000 }).should('include', `shipping/${SHIPPING_ID}/main`);
  });

  // ── Validation: empty sample name ───────────────────────────────────────────

  it('blocks save and warns when a sample name is empty', () => {
    // PuckFormView.save() check 1: iterates sampleVOs, returns if any name is '' or undefined.
    // Only rows with a protein acronym appear in getPuck().sampleVOs (parseTableData filter).
    visitPuckFormPage();
    waitForGridReady();

    setCell(0, 'Sample Name', '');

    cy.contains('Save').click();
    cy.contains('samples without a Sample Name', { timeout: 6000 }).should('be.visible');
    cy.get('@saveContainer.all').should('have.length', 0);
  });

  // ── Validation: special characters in sample name ───────────────────────────

  it('blocks save and warns when a sample name contains special characters', () => {
    // PuckFormView.save() check 3: regex /[ ~`!@#$%^&*()+…]/ tested against each name.
    visitPuckFormPage();
    waitForGridReady();

    setCell(0, 'Sample Name', 'sample@001');

    cy.contains('Save').click();
    cy.contains('contains special characters', { timeout: 6000 }).should('be.visible');
    cy.get('@saveContainer.all').should('have.length', 0);
  });

  // ── Validation: duplicate protein+sample within the container ───────────────

  it('blocks save and warns when two samples share the same protein and name', () => {
    // PuckFormView.save() check 2: PuckValidator.checkSampleNames() first loop —
    // detects {name, proteinId} pairs that appear more than once within the container.
    // Both rows already have protein 5HT3 (proteinId 4); we duplicate the name.
    visitPuckFormPage();
    waitForGridReady();

    setCell(1, 'Sample Name', 'sample-001'); // row 0 is already 'sample-001'

    cy.contains('Save').click();
    cy.contains('not unique', { timeout: 6000 }).should('be.visible');
    cy.get('@saveContainer.all').should('have.length', 0);
  });

  // ── Validation: protein+sample conflicts with existing proposal sample ───────

  it('blocks save and warns when the protein+sample combination already exists in the proposal', () => {
    // PuckValidator.checkSampleNames() second loop — compares against proposalSamples
    // loaded asynchronously by getSamplesFromProposal().
    // Fixture mx/samples-shipment2.json seeds sample-001/proteinId-4 (5HT3) as an
    // existing sample. container-6 also carries sample-001/5HT3 → conflict.
    cy.intercept('GET', `**/shipping/${SHIPPING_ID}/shipmentIds`, { body: [2] }).as('getShipmentIds');
    cy.intercept('GET', '**/mx/sample/shipmentid/2/list',
      { fixture: 'mx/samples-shipment2.json' }).as('getSamplesShipment2');

    visitPuckFormPage();

    // Ensure the async getSamplesFromProposal() Promise.all chain has resolved
    // before we click Save, so proposalSamples is populated on the view.
    cy.wait('@getSamplesShipment2');
    waitForGridReady();

    cy.contains('Save').click();
    cy.contains('not unique', { timeout: 6000 }).should('be.visible');
    cy.get('@saveContainer.all').should('have.length', 0);
  });
});
