// Tests for shipping/lab-contact addresses (journey A9).
//
// Routes (js/core/controller/labcontactexicontroller.js:33-54):
//   #/proposal/addresses/nav          -> AddressListView (navigation panel)  -> GET .../shipping/labcontact/list
//   #/proposal/address/:labcontactId/main -> AddressMainView (main panel)    -> GET .../shipping/labcontact/{id}/get
//
// Note: js/core/controller/proposalexicontroller.js:51-55 registers a byte-structurally-identical
// route with a differently-spelled param (`:lacontactId`) — Path.js's first-registered-wins means
// one of the two controllers actually handles every navigation to this URL depending on
// construction order in js/mx/eximx.js, but both build the exact same AddressMainView and call
// the exact same load(labContactId), so it's invisible to a black-box test either way.
//
// Confirmed edit-only: the "Add new" menu item is commented out
// (js/core/menu/mainmenu.js:117-130, text 'Add new --'); the AddressEditForm create-mode code
// path it would have called still exists but is unreachable from anywhere else in the app. No
// create-mode test is written here.
//
// AddressListView (js/core/navigation/addresslistview.js) extends the same base ListView
// (js/core/navigation/a_listview.js) as ShippingListView (shipping/shipment-list.cy.js) — same
// Ext.grid.Panel / `.x-grid-row` rendering, same selectionchange -> onSelect.notify mechanism.
// Row markup (templates/core/address.listview.js), quoted verbatim including its own typos:
//   cardName: {cardName}      (lowercase label, teal bold value)
//   Familiy Name: {personVO.familyName}   (sic)
//   Name: {personVO.givenName}
//   Email: {personVO.emailAddress}
//
// AddressMainView wraps a read-only AddressForm card (templates/core/address.form.template.js)
// with a single "Edit" toolbar button (js/core/widget/addressform.js — rendered as an Ext panel
// button, i.e. `a.x-btn`, not a plain HTML <button>) that's never hidden
// (`isSaveButtonHidden` is always undefined). Edit opens an `Ext.window.Window` titled
// "Shipping Address Card" (same title as the read-only panel itself — once the window is open,
// two nodes match that text) containing AddressEditForm, with the window's own footer Save/Cancel.
//
// Validation (js/core/widget/addresseditform.js:51-95) is sequential with an early return on the
// FIRST failing field — order: givenName, familyName, cardName, labName, labAddress,
// dewarAvgCustomsValue, dewarAvgTransportValue. Exact messages (all "<Field> information is
// mandatory"). Only these 7 fields are required; email/phone/fax/courierAccount/
// defaultCourrierCompany/billingReference are not.
//
// On save, the server response is discarded entirely — addresseditform.js:55-57 notifies
// `onSaved` with the locally-built form object, not the POST response body — and
// addressform.js's `edit()` handler does `window.close(); _this.load(address);` re-rendering the
// read-only card from that client-side object with **no second GET**. save-labcontact-success.json
// is a near-empty fixture for that reason; its content is never read.
//
// Save adapter (js/ispyb-client/proposal/labcontactdataadapter.js:43-48) POSTs
// `JSON.stringify(labcontact)` with `contentType: "application/json"` — unlike the comment saves
// in mx/comment.cy.js, this one really is JSON.
//
// getScientists() (labcontactdataadapter.js:29-31, GET .../shipping/labcontact/smis/list) is not
// stubbed here — grepping the whole address flow (list view, main view, edit form) turns up no
// caller; it exists only for an unrelated unit test fixture elsewhere in the repo.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  cy.intercept('GET', '**/shipping/labcontact/list',
    { fixture: 'proposal/labcontacts-list.json' }).as('getLabContacts');
  cy.intercept('GET', '**/shipping/labcontact/*/get',
    { fixture: 'proposal/labcontact-detail.json' }).as('getLabContact');
  cy.intercept('POST', '**/shipping/labcontact/save',
    { fixture: 'proposal/save-labcontact-success.json' }).as('saveLabContact');
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

function visitAddressesNav() {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = '#/proposal/addresses/nav';
  });
  cy.wait('@getLabContacts');
}

function visitAddressDetail(labContactId = '157') {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = `#/proposal/address/${labContactId}/main`;
  });
  cy.wait('@getLabContact');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Shipping addresses — #/proposal/addresses/nav', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders list rows with cardName, family name and email from the fixture', () => {
    visitAddressesNav();
    cy.contains('Bender-Roga i Kopyta Ltd').should('be.visible');
    cy.contains('Bender').should('be.visible');
    cy.contains('ostap.bender@rogaikopyta.example').should('be.visible');
  });

  it('clicking a row navigates to #/proposal/address/{id}/main and shows the read-only card', () => {
    visitAddressesNav();
    cy.contains('.x-grid-row', 'Bender-Roga i Kopyta Ltd').click();

    cy.wait('@getLabContact');
    cy.location('hash', { timeout: 8000 }).should('include', '/proposal/address/157/main');
    // Read-only card (address.form.template.js) — Lab Name / Surname fields.
    cy.contains('Roga i Kopyta Ltd').should('be.visible');
    cy.contains('Bender').should('be.visible');
  });
});

describe('Shipping addresses — #/proposal/address/{id}/main', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('Edit opens a modal titled with the address card, prefilled with cardName/email/etc.', () => {
    visitAddressDetail();
    cy.contains('a.x-btn', 'Edit').click();

    cy.get('.x-window').should('be.visible').and('contain.text', 'Shipping Address Card');
    cy.get('[id$="-cardName"]').should('have.value', 'Bender-Roga i Kopyta Ltd');
    cy.get('[id$="-givenName"]').should('have.value', 'Ostap');
    cy.get('[id$="-emailAddress"]').should('have.value', 'ostap.bender@rogaikopyta.example');
    cy.get('[id$="-labName"]').should('have.value', 'Roga i Kopyta Ltd');
  });

  it('Save with a required field empty shows an error message and does not POST', () => {
    visitAddressDetail();
    cy.contains('a.x-btn', 'Edit').click();

    // givenName/familyName stay prefilled (non-empty), so validation reaches cardName next —
    // sequential early-return means only the FIRST empty required field's message shows.
    cy.get('[id$="-cardName"]').clear();
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.contains('Card Name information is mandatory', { timeout: 6000 }).should('be.visible');
    cy.get('@saveLabContact.all').should('have.length', 0);
  });

  it('successful save POSTs a JSON body to /shipping/labcontact/save, closes the modal, and updates the read-only card from the echoed response (no second GET)', () => {
    visitAddressDetail();
    cy.contains('a.x-btn', 'Edit').click();

    cy.get('[id$="-cardName"]').clear().type('Updated Card Name');
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.wait('@saveLabContact').then(({ request }) => {
      // Cypress auto-parses the JSON body (Content-Type: application/json) into an object.
      expect(request.body.cardName).to.eq('Updated Card Name');
    });

    cy.get('.x-window').should('not.exist');
    cy.contains('Updated Card Name').should('be.visible');
    // Only the initial page-load GET — save() never re-fetches.
    cy.get('@getLabContact.all').should('have.length', 1);
  });
});
