// Tests for creating a new shipment via the menu-driven "Create New Shipment" modal.
// Route handler: none — this is NOT a routed page (see "Corrections" below).
// Menu:          js/core/menu/mainmenu.js:134-170 (getShipmentsMenu → "Add new")
// View:          js/core/view/shipping/shipmenteditform.js (ShipmentEditForm)
// Adapter:       js/core/app/proposalmanager.js (getLabcontacts/getSessions),
//                js/ispyb-client/proposal/shippingdataadapter.js (saveShipment)
//
// ─── Corrections against test-coverage.md's original Step 3 sketch ─────────────
//
// The doc originally targeted route `#/shipping/main` as "the shipment creation form". That
// premise is wrong: `#/shipping/main` builds `ShippingMainView` with `shippingId === undefined`,
// and `ShipmentForm.load(undefined)` throws at shipmentform.js:135 on `shipment.dewarVOs.length`
// — nothing renders. Real users never reach shipments through that route; they always go through
// the menu (Shipment ▸ Shipments ▸ Add new), which opens an Ext modal titled "Create New Shipment"
// wrapping `ShipmentEditForm` — a plain dust-rendered HTML form, not an ExtJS form. This spec
// tests that real flow instead. (`js/core/view/shipping/shipmentform.js` — despite its name — is
// the read-only shipment-detail *header*, not a create/edit form; the actual edit form used by
// both "Add new" and "Edit" is `ShipmentEditForm`.)
//
// `ShipmentEditForm`'s ids are all `BUI.id()`-random ("ExiSAXS" + 5 random chars), so selectors
// use attribute suffix matching, scoped inside `.x-window`. The template
// (templates/core/shipping.edit.form.template.js) has an inverted-naming quirk: the "From:" label
// sits on `[id$="-to"]`, and "Return address:" sits on `[id$="-from"]`.
//
// Lab contacts come from `EXI.proposalManager.getLabcontacts()`, which forces a *synchronous*
// `GET /info/get` (js/core/app/proposalmanager.js:79) — not from `/shipping/labcontact/list`.
// `ShipmentEditForm.load()` calls it twice. Sessions come from `getSessions()`, a synchronous
// `GET /session/list`, refetched because `setActiveProposal()` clears the cached
// `localStorage.sessions` (credentialmanager.js:232).
//
// Bug (confirmed-bugs.md §5): `$.extend(labcontacts, [pseudo1, pseudo2])` overwrites indices 0
// and 1 of the *same* array by index rather than appending. With exactly 3 lab contacts in the
// `proposal/info.json` fixture, the "Return address" dropdown ends up as
// [pseudo "Same as...", pseudo "No return requested", <3rd real contact>] — the first two real
// contacts silently vanish from Return address (they still appear correctly in "From", which
// reads the *unmodified* labcontacts array). This is exercised, not worked around, below.
//
// ExtJS submenus only expand on a real `mouseover` — `Ext.menu.Item#onClick` does not expand a
// child menu; `Ext.menu.Menu#onMouseOver` → `item.expandMenu()` does
// (min/extjs/build/ext-all-debug.js:150499). A plain `.click()` on "Shipments" will not reveal
// "Add new"; `.trigger('mouseover')` is required first.
//
// Note: js/core/menu/mainmenu.js:156 has a stray `debugger;` statement in the Save button
// handler. Harmless in `cypress run` (no attached devtools), but will trap execution if this spec
// is ever driven interactively with devtools open.

// ─── Network mocks ────────────────────────────────────────────────────────────

function futureSessions() {
  const fmt = (d) => d.toISOString();
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const past = new Date();
  past.setDate(past.getDate() - 30);

  return [
    {
      sessionId: 5,
      beamLineName: 'P11',
      BLSession_startDate: fmt(future),
      BLSession_endDate: fmt(future),
      proposalVO: { proposalCode: 'MX', proposalNumber: '1234' },
    },
    {
      sessionId: 6,
      beamLineName: 'P11',
      BLSession_startDate: fmt(past),
      BLSession_endDate: fmt(past),
      proposalVO: { proposalCode: 'MX', proposalNumber: '1234' },
    },
  ];
}

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list', { body: [] }).as('getProposals');

  // ShipmentEditForm.load() → EXI.proposalManager.getLabcontacts() → synchronous GET /info/get
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');

  // ShipmentEditForm.load() → EXI.proposalManager.getSessions() → synchronous GET /session/list
  // (fires because setActiveProposal() clears localStorage.sessions)
  cy.intercept('GET', '**/session/list', { body: futureSessions() }).as('getSessionList');

  cy.intercept('POST', '**/shipping/save', {
    fixture: 'shipping/save-shipment-success.json',
  }).as('saveShipment');

  // After a successful save, onSaved redirects to #/shipping/99/main.
  cy.intercept('GET', '**/shipping/99/get', { fixture: 'shipping/shipment.json' }).as('getShipment');
  cy.intercept('GET', '**/shipping/*/datacollecitons/list', { body: [] }).as('getDataCollections');
}

// ─── Login helper ─────────────────────────────────────────────────────────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]', { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000 }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper ────────────────────────────────────────────────────────

// Logs in, activates proposal MX1234, opens the main menu's Shipment ▸ Shipments ▸ Add new
// flyout chain, and waits for both synchronous XHRs the modal triggers.
function openCreateShipmentDialog() {
  login();
  cy.wait('@getSessions');

  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
  });

  cy.contains('.x-btn', 'Shipment').click();
  // A plain DOM mouseover/`.trigger()` is unreliable against ExtJS's own mouse-monitor wiring
  // here (Cypress's synthetic event gets lost before `Ext.menu.Menu#onMouseOver` reacts to it).
  // Call the framework method directly instead — deterministic, and it's exactly what a real
  // mouseover ends up invoking (`Ext.menu.Item#expandMenu`, ext-all-debug.js:149453).
  cy.contains('.x-menu-item', 'Shipments').invoke('attr', 'id').then((id) => {
    cy.window().then((win) => {
      var item = win.Ext.getCmp(id);
      item.activate(true); // doExpandMenu() no-ops unless the item is "activated" first
      item.expandMenu(0);
    });
  });
  cy.contains('.x-menu-item', 'Add new').click();

  cy.wait('@getSessionList');
  cy.get('.x-window').should('be.visible').and('contain', 'Create New Shipment');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Create Shipment — "Create New Shipment" modal (Shipment ▸ Shipments ▸ Add new)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('opens the "Create New Shipment" modal with Name, Session, From and Return fields', () => {
    openCreateShipmentDialog();
    cy.get('.x-window [id$="-name"]').should('be.visible');
    cy.get('.x-window [id$="-date"]').should('be.visible');
    cy.get('.x-window [id$="-to"]').should('be.visible'); // "From:" label
    cy.get('.x-window [id$="-from"]').should('be.visible'); // "Return address:" label
    cy.contains('.x-window a.x-btn', 'Save').should('be.visible');
  });

  it('From dropdown is populated from the proposal\'s lab contacts', () => {
    openCreateShipmentDialog();
    cy.get('.x-window [id$="-to"] option').should('have.length', 3);
    cy.get('.x-window [id$="-to"]').should('contain', 'von Moeller-Molox GmbH');
    cy.get('.x-window [id$="-to"]').should('contain', 'Chatziefthymiou-Deutsches Elektronen-Synchrot');
    cy.get('.x-window [id$="-to"]').should('contain', 'Taberman-Helmholtz Lab');
  });

  it('Session dropdown lists only future sessions', () => {
    openCreateShipmentDialog();
    // sessionId 5 (future) renders as an option; sessionId 6 (30 days in the past) is filtered out
    // (shipmenteditform.js:55, `currentDay <= sessionStartDate`).
    cy.get('.x-window [id$="-date"] option').should('have.length', 2); // blank + 1 future session
    cy.get('.x-window [id$="-date"]').should('contain', 'P11');
  });

  it('Return address only shows the two pseudo-options plus the surviving 3rd contact (bug §5)', () => {
    openCreateShipmentDialog();
    // $.extend(labcontacts, [pseudo1, pseudo2]) overwrites indices 0 and 1 of the 3-item array —
    // the first two real contacts vanish from Return address; only the 3rd contact survives.
    cy.get('.x-window [id$="-from"] option').should('have.length', 3);
    cy.get('.x-window [id$="-from"]').should('contain', 'Same as for shipping to beamline');
    cy.get('.x-window [id$="-from"]').should('contain', 'No return requested');
    cy.get('.x-window [id$="-from"]').should('contain', 'Taberman-Helmholtz Lab');
    cy.get('.x-window [id$="-from"]').should('not.contain', 'von Moeller-Molox GmbH');
    // No option carries `selected` (shipment is undefined on create), so the browser defaults to
    // the first <option> in DOM order, which is the "Same as..." pseudo-option (value -1).
    cy.get('.x-window [id$="-from"]').should('have.value', '-1');
  });

  it('Save with an empty Name shows "Name field is mandatory" and does not POST', () => {
    openCreateShipmentDialog();
    cy.get('.x-window [id$="-date"]').select('5');
    cy.contains('.x-window a.x-btn', 'Save').click();
    cy.get('.x-message-box').should('contain', 'Name field is mandatory');
    cy.get('@saveShipment.all').should('have.length', 0);
  });

  it('Save with a Name but no session shows the session-mandatory message and does not POST', () => {
    openCreateShipmentDialog();
    cy.get('.x-window [id$="-name"]').type('My-Shipment-2026');
    cy.contains('.x-window a.x-btn', 'Save').click();
    cy.get('.x-message-box').should('contain', 'Session field is mandatory. Please, choose the date.');
    cy.get('@saveShipment.all').should('have.length', 0);
  });

  it('successful save POSTs /shipping/save with the entered fields and redirects to the new shipment', () => {
    openCreateShipmentDialog();
    cy.get('.x-window [id$="-name"]').type('My-Shipment-2026');
    cy.get('.x-window [id$="-date"]').select('5');
    cy.get('.x-window [id$="-to"]').select('von Moeller-Molox GmbH');
    cy.contains('.x-window a.x-btn', 'Save').click();

    // saveShipment() POSTs jQuery-serialised form data (not JSON).
    cy.wait('@saveShipment').its('request.body').then((body) => {
      expect(body).to.include('name=My-Shipment-2026');
      expect(body).to.include('sessionId=5');
      expect(body).to.include('sendingLabContactId=157');
      expect(body).to.include('returnLabContactId=-1');
      // Copied from the selected "From" contact (courierAccount/billingReference/dewarAvg*Value).
      expect(body).to.include('courierAccount=ACC-2026-01');
      expect(body).to.include('billingReference=REF-2026-01');
    });

    cy.location('hash', { timeout: 8000 }).should('include', 'shipping/99/main');
    cy.wait('@getShipment');
    cy.get('.x-window').should('not.exist');
  });

  it('a save error shows the response text and leaves the modal open', () => {
    cy.intercept('POST', '**/shipping/save', {
      statusCode: 500,
      body: 'Name already used for this proposal',
    }).as('saveShipment');

    openCreateShipmentDialog();
    cy.get('.x-window [id$="-name"]').type('My-Shipment-2026');
    cy.get('.x-window [id$="-date"]').select('5');
    cy.get('.x-window [id$="-to"]').select('von Moeller-Molox GmbH');
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.wait('@saveShipment');
    cy.get('.x-message-box').should('contain', 'Name already used for this proposal');
    cy.get('.x-window').should('contain', 'Create New Shipment');
  });
});
