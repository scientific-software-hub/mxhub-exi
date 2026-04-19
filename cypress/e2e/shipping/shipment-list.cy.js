// Tests for shipment navigation list: #/proposal/shipping/nav
// Route handler: js/core/controller/shippingexicontroller.js:79
// View:          js/core/navigation/shippinglistview.js
// Base:          js/core/navigation/a_listview.js

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  cy.intercept('GET', '**/shipping/list',
    { fixture: 'shipping/shipments-list.json' }).as('getShippings');

  // getDewarsByProposal() — called after getShippings resolves
  cy.intercept('GET', '**/proposal/*/dewar/list',
    { fixture: 'proposal/dewars-list.json' }).as('getDewars');

  // ShipmentForm.load() calls EXI.proposalManager.getLabcontacts() which does a
  // synchronous GET /info/get. Intercepted here so navigating to a detail page
  // after a click does not hit the network.
  cy.intercept('GET', '**/info/get',
    { fixture: 'proposal/info.json' }).as('getProposalInfo');
}

// ─── Login helper ─────────────────────────────────────────────────────────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('hakanj');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper ────────────────────────────────────────────────────────

// Logs in, activates proposal MX1234, navigates to the shipment list, and waits
// for both XHRs in the load chain (getShippings → getDewars).
function visitShipmentList() {
  login();
  cy.wait('@getSessions');

  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('hakanj', 'MX1234');
    win.location.hash = '#/proposal/shipping/nav';
  });

  cy.wait('@getShippings');
  cy.wait('@getDewars');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Shipment List — #/proposal/shipping/nav', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders shipment cards with name and status', () => {
    visitShipmentList();
    cy.contains('Shipment-002').should('be.visible');
    cy.contains('Shipment-001').should('be.visible');
  });

  it('shows shipments in descending id order (newest first)', () => {
    visitShipmentList();
    cy.get('.x-grid-row').eq(0).should('contain', 'Shipment-002');
    cy.get('.x-grid-row').eq(1).should('contain', 'Shipment-001');
  });

  it('renders no shipment cards when no shipments exist', () => {
    // LIFO: this intercept overrides the beforeEach fixture for this test only
    cy.intercept('GET', '**/shipping/list', { body: [] }).as('getShippings');
    visitShipmentList();
    cy.get('.x-grid-row').should('not.exist');
  });

  it('shows the shipment status for each card', () => {
    visitShipmentList();
    cy.contains('opened').should('be.visible');
    cy.contains('delivered').should('be.visible');
  });

  it('clicking a shipment card navigates to the shipment detail page', () => {
    // The first row (Shipment-002, id=2) triggers location.hash = "#/shipping/2/main".
    // ShippingMainView.load(2) then fires getShipment(2) and hasDataCollections.
    cy.intercept('GET', '**/shipping/2/get', { fixture: 'shipping/shipment.json' }).as('getShipment');
    cy.intercept('GET', '**/shipping/*/datacollecitons/list', { body: [] }).as('getDataCollections');

    visitShipmentList();
    cy.get('.x-grid-row').first().click();
    cy.location('hash', { timeout: 8000 }).should('include', 'shipping/2/main');
  });
});
