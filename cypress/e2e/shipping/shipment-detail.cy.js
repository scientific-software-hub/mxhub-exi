// Tests for the shipment detail page: #/shipping/:id/main
// Route handler: js/core/controller/shippingexicontroller.js:83
// View:          js/core/view/shipping/shippingmainview.js (ShippingMainView)
//                js/core/view/shipping/shipmentform.js (ShipmentForm — the read-only header)
//                js/core/view/shipping/parcelgrid.js (ParcelGrid — the "Content" tab)
//                js/core/widget/parcelpanel.js (ParcelPanel — one card per dewar)
//                js/core/widget/containerparcelpanel.js (ContainerParcelPanel — one puck icon)
// Adapters:      js/ispyb-client/proposal/shippingdataadapter.js,
//                js/ispyb-client/proposal/dewardataadapter.js
//
// ─── Load chain (ShippingMainView.load, shippingmainview.js:68) ────────────────
//
// GET /shipping/{id}/get → (if any container exists) GET /mx/sample/containerid/{ids}/list →
// ShipmentForm.load() does GET /info/get twice (synchronous, forced) →
// (manager only) GET /shipping/{id}/datacollecitons/list  [typo is in app source]
//
// ─── Rendered labels differ from documentation/user_guide.md's wording ─────────
//
// "Add parcel" renders as "Add new Dewar Manually"; "Send Shipment" renders as "Send
// notification of shipping to facility". Assertions below use the rendered strings.
//
// ─── `Print dewar label` is a page navigation, not an XHR ──────────────────────
//
// parcelpanel.js:107 does `location.href = getDewarLabelURL(...)`. Since mx/config.js's exiUrl
// is relative, an un-intercepted click would navigate the test runner away from the app. The
// print test patches `ShippingDataAdapter.prototype.getDewarLabelURL` to capture the computed
// URL instead of returning a real one.
//
// ─── Known bugs pinned by these tests (asserting current, not intended, behavior) ──
//
// confirmed-bugs.md §7 — `getDewarLabelURL(dewarId, dewarId)` passes the dewar id where the
// shipping id belongs (parcelpanel.js:108); the "Print dewar label" test asserts the resulting
// (wrong) URL, not a corrected one.
// shipmentform.js:200-227 — the "every dewar must be `label printed`" guard is unconditionally
// overwritten by the `hidePrintLabelWarning` branch two lines later, so a dewar stuck in
// `dewarStatus: "processing"` still yields an *enabled* Send button. Documented, not treated as
// a defect to work around.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts(shipmentFixture = 'shipping/shipment.json') {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list', { body: [] }).as('getProposals');
  cy.intercept('GET', '**/info/get', { fixture: 'proposal/info.json' }).as('getProposalInfo');

  cy.intercept('GET', '**/shipping/1/get', { fixture: shipmentFixture }).as('getShipment');
  cy.intercept('GET', '**/shipping/*/datacollecitons/list', { body: [] }).as('getDataCollections');
  cy.intercept('GET', '**/mx/sample/containerid/*/list', {
    fixture: 'mx/samples-container-6.json',
  }).as('getContainerSamples');

  // ShipmentForm.edit() opens ShipmentEditForm, which also calls getSessions() (synchronous
  // GET /session/list) — same as the create-shipment modal.
  cy.intercept('GET', '**/session/list', { body: [] }).as('getSessionList');

  cy.intercept('POST', '**/shipping/1/dewar/save', {
    fixture: 'shipping/add-parcel-success.json',
  }).as('saveDewar');
  cy.intercept('GET', '**/shipping/1/dewar/*/remove', {
    fixture: 'shipping/shipment.json',
  }).as('removeDewar');
  cy.intercept('GET', '**/shipping/1/status/*/update', {
    fixture: 'shipping/update-status-success.json',
  }).as('updateStatus');
  cy.intercept(
    'GET',
    '**/shipping/1/dewar/*/containerType/*/capacity/*/container/add',
    { fixture: 'shipping/add-container-success.json' }
  ).as('addContainer');
  cy.intercept('POST', '**/shipping/1/dewar/*/puck/*/save', {
    fixture: 'shipping/save-container-success.json',
  }).as('saveContainer');
  cy.intercept('POST', '**/send', { body: {} }).as('sendEmail');
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

function visitShipmentDetail() {
  login();
  cy.wait('@getSessions');

  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = '#/shipping/1/main';
  });

  cy.wait('@getShipment');
}

// Patches ShippingDataAdapter.getDewarLabelURL to record its computed URL instead of returning
// a real one — clicking "Print dewar label" would otherwise `location.href = url` the test
// runner away from the SPA.
function stubLabelUrl(win) {
  win.__labelUrls = [];
  const proto = win.ShippingDataAdapter.prototype;
  const original = proto.getDewarLabelURL;
  proto.getDewarLabelURL = function (shippingId, dewarId) {
    const url = original.call(this, shippingId, dewarId);
    win.__labelUrls.push(url);
    return '#/shipping/1/main'; // same-hash no-op instead of a real navigation
  };
}

// ─── Tests — Part A: ShipmentForm header ───────────────────────────────────────

describe('Shipment Detail — ShipmentForm header (#/shipping/1/main)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders the shipment name, status, beamline, From and Return address from the fixture', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('Shipment-001').should('be.visible');
    cy.contains('opened').should('be.visible');
    cy.contains('P11').should('be.visible');
    cy.contains('Bender-Roga i Kopyta Ltd').should('be.visible');
    cy.contains('NO RETURN').should('be.visible'); // returnLabContactVO is null in the fixture
  });

  it('Edit button is enabled for an opened shipment and opens the "Edit Shipment" window', () => {
    visitShipmentDetail();
    cy.get('[id$="-edit-button"]').first().should('not.have.class', 'disabled').click();
    cy.get('.x-window').should('contain', 'Edit Shipment');
    cy.get('.x-window [id$="-name"]').should('have.value', 'Shipment-001');
  });

  it('Edit button stays disabled when the shipment is processing', () => {
    setupIntercepts('shipping/shipment-processing.json');
    visitShipmentDetail();
    cy.get('[id$="-edit-button"]').first().should('have.class', 'disabled');
  });

  it('Delete button renders for a Manager and load fires the datacollecitons check', () => {
    visitShipmentDetail();
    cy.wait('@getDataCollections');
    cy.get('[id$="-delete-button"]').should('exist').and('not.have.class', 'hidden');
  });

  it('Send button is disabled with a warning when there are no dewars', () => {
    visitShipmentDetail(); // shipment.json → dewarVOs: []
    cy.get('[id$="-send-button"]').children().should('have.class', 'disabled');
    cy.contains('One of your labels is not printed').should('be.visible');
  });

  it('Send button is disabled with a warning when a dewar has no printed label (null dewarStatus)', () => {
    setupIntercepts('shipping/shipment-with-containers.json');
    visitShipmentDetail();
    cy.get('[id$="-send-button"]').children().should('have.class', 'disabled');
    cy.contains('One of your labels is not printed').should('be.visible');
  });

  it('Send button is enabled once every dewar is "label printed"', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.get('[id$="-send-button"]').children()
      .should('have.class', 'enabled')
      .and('not.have.class', 'disabled');
    cy.contains('One of your labels is not printed').should('not.exist');
  });

  it('documents current behavior: a "processing" dewar still leaves Send enabled (shipmentform.js:200-227)', () => {
    // hidePrintLabelWarning only requires *every* dewar to have a non-null dewarStatus — it does
    // not require exactly "label printed" — and its branch unconditionally overwrites the
    // dewarStatus != "label printed" guard set two lines earlier.
    const fixture = {
      shippingId: 1,
      shippingName: 'Shipment-001',
      shippingStatus: 'opened',
      comments: null,
      sendingLabContactVO: null,
      returnLabContactVO: null,
      dewarVOs: [{ dewarId: 10, code: 'Dewar1', dewarStatus: 'processing', containerVOs: [] }],
      sessions: [],
    };
    cy.intercept('GET', '**/shipping/1/get', { body: fixture }).as('getShipment');
    visitShipmentDetail();
    cy.get('[id$="-send-button"]').children()
      .should('have.class', 'enabled')
      .and('not.have.class', 'disabled');
  });

  it('the send button element is absent once status is "sent to DESY"', () => {
    setupIntercepts('shipping/shipment-sent.json');
    visitShipmentDetail();
    cy.get('[id$="-send-button"]').should('not.exist');
  });

  it('clicking Send updates the status, shows the confirmation dialog, and re-renders from the reload', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();

    cy.get('[id$="-send-button"]').children().click();
    cy.wait('@updateStatus').its('request.url').should('include', 'sent%20to%20DESY');
    cy.contains('You have sent your shipment to the facility.').should('be.visible');
    cy.wait('@sendEmail');

    // ShipmentForm's sentNotification listeners fire the email POST, then refresh.notify()
    // reloads via ShippingMainView.load — a second GET /shipping/1/get.
    cy.get('@getShipment.all').should('have.length', 2);
  });
});

// ─── Tests — Part B: ParcelGrid / ParcelPanel ──────────────────────────────────

describe('Shipment Detail — ParcelGrid parcel management', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders an empty parcel area with only "Add new Dewar Manually" enabled when there are no dewars', () => {
    visitShipmentDetail();
    cy.contains('Content (0 Dewars').should('be.visible');
    cy.contains('button', 'Add new Dewar Manually').should('not.have.class', 'disabled');
    cy.get('[id^="ExiSAXS"][id$="-print-button"]').should('not.exist');
  });

  it('parcel cards render one per dewarVO, numbered and showing code/status/location', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('Content (2 Dewars').should('be.visible');
    cy.contains('#1').should('be.visible');
    cy.contains('#2').should('be.visible');
    cy.contains('Dewar1').should('be.visible');
    cy.contains('Dewar2').should('be.visible');
    cy.get('td.column_parameter_value')
      .filter((i, el) => el.textContent.trim() === 'label printed')
      .should('have.length', 2);
  });

  it('"Import Dewar(s) from CSV" is enabled for an opened shipment, disabled while processing', () => {
    visitShipmentDetail();
    cy.contains('button', 'Import Dewar(s) from CSV').should('not.have.class', 'disabled');
  });

  it('"Import Dewar(s) from CSV" is disabled while the shipment is processing', () => {
    setupIntercepts('shipping/shipment-processing.json');
    visitShipmentDetail();
    cy.contains('button', 'Import Dewar(s) from CSV').should('have.class', 'disabled');
  });

  it('"Export PDF View" stays disabled when the shipment has no samples', () => {
    visitShipmentDetail();
    cy.contains('button', 'Export PDF View').should('have.class', 'disabled');
  });

  it('"Add new Dewar Manually" opens the "New Dewar" window with a Name field', () => {
    visitShipmentDetail();
    cy.contains('button', 'Add new Dewar Manually').click();
    cy.get('.x-window').should('contain', 'New Dewar');
    cy.get('.x-window [id$="dewar_code"]').should('be.visible');
  });

  it('saving a new dewar with an empty Name shows the mandatory-field message and does not POST', () => {
    visitShipmentDetail();
    cy.contains('button', 'Add new Dewar Manually').click();
    cy.contains('.x-window a.x-btn', 'Save').click();
    cy.get('.x-message-box').should('contain', 'Name field is mandatory. Please, put the Name.');
    cy.get('@saveDewar.all').should('have.length', 0);
  });

  it('saving a new dewar POSTs /shipping/1/dewar/save with the entered code and re-renders from the response', () => {
    visitShipmentDetail();
    cy.contains('button', 'Add new Dewar Manually').click();
    cy.get('.x-window [id$="dewar_code"]').type('Dewar1');
    cy.focused().blur();
    // Newly-found race: blurring a changed text field fires a native `change` event, which
    // Ext's RequiredTextField#checkChange (min/extjs/extended/RequiredTextField.js:8) handles
    // via a 50ms-buffered DelayedTask (ext-all-debug.js:99447). Clicking Save right away (a) is
    // itself a blur, re-arming that timer, and (b) — with the save intercepted and resolving
    // near-instantly — destroys the field via window.close() before the 50ms timer fires,
    // crashing on a null `this.el`. Blur explicitly first and let the buffer settle so Save's
    // own blur is a no-op change.
    cy.wait(60);
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.wait('@saveDewar').its('request.body').should('include', 'Dewar1');
    // ParcelGrid.edit()'s onSuccess calls `_this.load(shipment)` directly with the POST
    // response — it does not re-fetch GET /shipping/1/get.
    cy.get('.x-window').should('not.exist');
    cy.contains('Content (1 Dewars').should('be.visible');
    cy.contains('Dewar1').should('be.visible');
  });

  it('"Edit dewar info" opens the "Edit Dewar" window prefilled, with Save/Cancel/Remove', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('a', 'Edit dewar info').first().click();
    cy.get('.x-window').should('contain', 'Edit Dewar');
    cy.get('.x-window [id$="dewar_code"] input').should('have.value', 'Dewar1');
    cy.contains('.x-window a.x-btn', 'Save').should('be.visible');
    cy.contains('.x-window a.x-btn', 'Cancel').should('be.visible');
    cy.contains('.x-window a.x-btn', 'Remove').should('be.visible');
  });

  it('Remove (after confirm) fires GET /shipping/1/dewar/10/remove and re-renders from the response', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('a', 'Edit dewar info').first().click();
    cy.contains('.x-window a.x-btn', 'Remove').click();
    cy.get('.x-message-box').should('contain', 'Removing the parcel from this shipment');
    cy.get('.x-message-box').contains('a.x-btn', 'Yes').click();

    cy.wait('@removeDewar').its('request.url').should('include', '/shipping/1/dewar/10/remove');
    // dewardataadapter's removeDewar onSuccess also calls ParcelGrid.load(shipment) directly.
    cy.contains('Content (0 Dewars').should('be.visible');
  });

  it('"Add container" opens the "Container" window with a Name field and a type combo', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('a', 'Add container').first().click();
    cy.get('.x-window').should('contain', 'Container');
    cy.get('.x-window [id$="container_code"]').should('be.visible');
  });

  it('saving a new container fires the container/add GET then the puck/save POST with correct ids', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.contains('a', 'Add container').first().click();
    cy.get('.x-window [id$="container_code"]').type('containerC');
    cy.focused().blur();
    cy.wait(60); // see the note on the checkChange/blur race in the "saving a new dewar" test above
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.wait('@addContainer').its('request.url')
      .should('include', '/shipping/1/dewar/10/containerType/Unipuck/capacity/16/container/add');
    cy.wait('@saveContainer').its('request.url')
      .should('include', '/shipping/1/dewar/10/puck/30/save');
  });

  it('"Print dewar label" navigates using shippingId/dewarId in the wrong order (confirmed-bugs.md §7)', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    cy.window().then(stubLabelUrl);

    cy.contains('a', 'Print dewar label').first().click();
    cy.contains('You have printed dewar label.').should('be.visible');
    cy.window().its('__labelUrls').should('deep.equal', [
      '/ispyb/ispyb-ws/rest/test-token/proposal/MX1234/shipping/10/dewar/10/labels',
    ]);
  });

  it('clicking a puck opens the "Container" window; Edit navigates to the puck edit route', () => {
    setupIntercepts('shipping/shipment-with-dewars.json');
    visitShipmentDetail();
    // The puck is a Snap.svg circle (js/mx/widget/pucks/puckwidgetcontainer.js), not the
    // "containerA" <span> label beneath it (a separate sibling element — clicking the label
    // does not trigger the widget's onClick). `enableMainClick` binds the click to the outer
    // circle carrying class="puck".
    cy.get('svg circle.puck').first().click({ force: true });
    cy.get('.x-window').should('contain', 'Container').and('contain', 'Unipuck');
    cy.contains('.x-window a.x-btn', 'Edit').click();
    cy.location('hash', { timeout: 8000 }).should('include', 'shipping/1/opened/containerId/20/edit');
  });
});
