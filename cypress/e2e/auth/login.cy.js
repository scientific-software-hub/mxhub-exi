// Tests for the login flow: auth form, button state, navigation after login.
// Route: #/welcome → EXI.authenticationForm.show()
// Auth form: js/core/widget/authenticationform.js
// Post-login welcome page: js/core/view/managerwelcomemainview.js
//
// Unlike the other shipping specs, these tests do NOT pre-load auth state.
// The login window appears automatically when no credentials are in localStorage.
//
// After a manager login the app navigates to #/welcome/manager/:user/main which
// calls loadSessionsByDate(today, today) → GET /session/date/:start/:end/list
// and loadProposals() → GET /proposal/list. Both are intercepted.

// ─── Network mocks ─────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  // Manager welcome page: loadSessionsByDate(today, today)
  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');

  // Manager welcome page: loadProposals()
  cy.intercept('GET', '**/proposal/list', { body: [] }).as('getProposals');
}

// ─── Login helper ──────────────────────────────────────────────────────────

// Fills the ExtJS auth form and clicks Login.
// LOCAL has a single site so there is no site dropdown.
function loginWithForm(user, pass) {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type(user);
  cy.get('input[name="password"]', { timeout: 5000  }).type(pass);
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
}

// Login and wait for the welcome page to fully settle (both XHRs resolve).
function loginAndWaitForWelcome() {
  loginWithForm('ispyb', 'ispyb');
  cy.wait('@authenticate');
  cy.wait('@getSessions');
  cy.wait('@getProposals');
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Login — auth form', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  // ── Form renders ────────────────────────────────────────────────────────

  it('shows the auth window with User, Password fields and Login button on initial load', () => {
    cy.visitMx();
    // ExtJS window appears because localStorage has no credentials
    cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible');
    cy.get('input[name="password"]', { timeout: 5000  }).should('be.visible');
    cy.contains('a.x-btn', 'Login').should('be.visible');
  });

  it('displays the site login message in the auth window', () => {
    cy.visitMx();
    // loginMessage in mx/config.js: "Please use your DOOR login"
    cy.contains('Please use your DOOR login', { timeout: 10000 }).should('be.visible');
  });

  // ── Button enable / disable ─────────────────────────────────────────────

  it('Login button is disabled before any input is entered', () => {
    cy.visitMx();
    cy.contains('a.x-btn', 'Login', { timeout: 10000 }).should('have.class', 'x-disabled');
  });

  it('Login button stays disabled when only the user field is filled', () => {
    cy.visitMx();
    cy.get('input[name="user"]', { timeout: 10000 }).type('ispyb');
    cy.contains('a.x-btn', 'Login').should('have.class', 'x-disabled');
  });

  it('Login button enables once both fields are filled', () => {
    cy.visitMx();
    cy.get('input[name="user"]',     { timeout: 10000 }).type('ispyb');
    cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
    cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled');
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it('pressing Enter in the password field submits the form', () => {
    cy.visitMx();
    cy.get('input[name="user"]',     { timeout: 10000 }).type('ispyb');
    cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb{enter}');
    cy.wait('@authenticate');
  });

  it('successful login calls POST /authenticate and redirects to the manager welcome page', () => {
    loginWithForm('ispyb', 'ispyb');
    cy.wait('@authenticate').its('request.body').should('include', 'ispyb');
    cy.wait('@getSessions');
    cy.location('hash', { timeout: 8000 }).should('include', 'welcome/manager/ispyb');
  });

  it('auth window closes after successful login', () => {
    loginAndWaitForWelcome();
    // The ExtJS window is destroyed on close — it should no longer be in the DOM
    cy.get('.x-window', { timeout: 8000 }).should('not.exist');
  });

  // ── Error handling ──────────────────────────────────────────────────────

  it('failed login (401) shows "Your credentials are invalid" dialog', () => {
    cy.intercept('POST', '**/authenticate*', { statusCode: 401, body: '' }).as('authenticate');
    loginWithForm('ispyb', 'wrong-password');
    cy.wait('@authenticate');
    // BUI.showError() calls Ext.Msg.show() — renders as .x-message-box
    cy.contains('Your credentials are invalid', { timeout: 6000 }).should('be.visible');
  });

  it('failed login does not navigate away from the welcome/login route', () => {
    cy.intercept('POST', '**/authenticate*', { statusCode: 401, body: '' }).as('authenticate');
    loginWithForm('ispyb', 'wrong-password');
    cy.wait('@authenticate');
    cy.contains('Your credentials are invalid', { timeout: 6000 }).should('be.visible');
    // Hash must remain on the login/welcome route — not on manager welcome
    cy.location('hash').should('not.include', 'manager');
  });
});

describe('Login — manager welcome page', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  // ── Welcome page toolbar ────────────────────────────────────────────────

  it('"Choose a period of time" button is visible on the manager welcome page', () => {
    loginAndWaitForWelcome();
    cy.contains('Choose a period of time', { timeout: 8000 }).should('be.visible');
  });

  it('"Choose a Date" button is visible on the manager welcome page', () => {
    loginAndWaitForWelcome();
    cy.contains('Choose a Date', { timeout: 8000 }).should('be.visible');
  });

  it('clicking "Choose a period of time" opens a date-range picker dialog', () => {
    loginAndWaitForWelcome();
    cy.contains('Choose a period of time').click();
    // DateRangePicker renders as a Bootstrap modal (not ExtJS window).
    // The modal footer contains a "Select" button that is specific to this dialog.
    cy.contains('button', 'Select', { timeout: 6000 }).should('be.visible');
  });

  // ── Session grid ────────────────────────────────────────────────────────

  it('session grid shows sessions when the date-range endpoint returns data', () => {
    // Re-register @getSessions with real fixture data (LIFO — fires for all session/date calls).
    // loginAndWaitForWelcome() still works because @getSessions now points to this intercept.
    cy.intercept('GET', '**/session/date/**', {
      fixture: 'sessions/sessions-date-range.json',
    }).as('getSessions');

    loginAndWaitForWelcome();
    cy.window().then((win) => {
      win.location.hash = '#/welcome/manager/ispyb/date/20260201/20260228/main';
    });
    cy.wait('@getSessions');
    // Assert on content that the session.grid.mx.datacollection.template actually renders:
    // beamLineOperator is rendered as plain text in the Local Contact column.
    cy.contains('Paul Carroll', { timeout: 8000 }).should('be.visible');
  });

  it('selecting a date range triggers GET /session/date/:start/:end/list', () => {
    // Do NOT re-register the intercept — let @getSessions from setupIntercepts() handle all
    // session/date requests. loginAndWaitForWelcome() consumes the first match (today's
    // welcome load). The second cy.wait('@getSessions') here captures the date-range request.
    loginAndWaitForWelcome();
    cy.window().then((win) => {
      win.location.hash = '#/welcome/manager/ispyb/date/20260201/20260228/main';
    });
    // loadByDate increments end by 1 day: 20260228 → 20260301
    cy.wait('@getSessions')
      .its('request.url')
      .should('include', '20260201');
  });

  // ── Journey A1 (proposal-pick-by-click) / X1 (credential dropdown is informational only) ──
  //
  // Every other spec in this repo activates the proposal directly via
  // win.EXI.credentialManager.setActiveProposal(...) — no test ever does it the way A1 actually
  // describes: clicking a session-grid row. That row's href
  // (SessionGrid.prototype.getDataCollectionURL, js/core/widget/sessiongrid.js:45-53) is one of
  // the X2 deep-link redirector routes (js/mx/controller/mxdatacollectioncontroller.js:88-99):
  // "#/mx/proposal/" + Proposal_proposalCode + Proposal_ProposalNumber (note the capital P — a
  // naming inconsistency vs. the rest of the app, harmless only because our fixture happens to
  // use the same capitalization) + "/datacollection/session/" + sessionId + "/main". Since we're
  // already authenticated at that point, it takes ExiGenericController.prototype.redirect's
  // "already authenticated" branch (js/core/controller/exigenericcontroller.js:26-30): a
  // synchronous setActiveProposal(credentials[0].username, proposal) with no REST call, then
  // location.hash = the non-prefixed session route.
  //
  // X1 turned out not to be a distinct UI flow: user-journeys.md assumed the credential
  // splitbutton's {proposal}@{username} dropdown items were how you switch proposals mid-session.
  // Source-checked: those menu items are built with disabled: true unconditionally
  // (js/core/menu/mainmenu.js:424-434) — purely informational. Clicking a session row (X2's
  // mechanism) is the only way to change the active proposal once inside the app.

  it('clicking a session row activates its proposal and navigates via the X2 redirector route', () => {
    // sessions-date-range.json's one row carries Proposal_proposalCode: 'MX',
    // Proposal_ProposalNumber: '1234', sessionId: 1 — a well-formed redirector target.
    cy.intercept('GET', '**/session/date/**', { fixture: 'sessions/sessions-date-range.json' }).as('getSessions');
    // Stub the redirect target's own requests (the ordinary DC session route, A7/B3) so
    // navigation completes without hanging — their content isn't what this test is about.
    cy.intercept('GET', '**/datacollection/session/*/list', { body: [] }).as('getDCs');
    cy.intercept('GET', '**/energyscan/session/*/list',    { body: [] }).as('getEnergyScans');
    cy.intercept('GET', '**/xrfscan/session/*/list',       { body: [] }).as('getXrfScans');

    loginAndWaitForWelcome();
    cy.window().then((win) => {
      win.location.hash = '#/welcome/manager/ispyb/date/20260201/20260228/main';
    });
    cy.wait('@getSessions');

    // beamLineOperator 'Paul Carroll' uniquely identifies the fixture's one row (same convention
    // as mx/data-collections.cy.js's own welcome-grid drill-down test).
    cy.contains('Paul Carroll', { timeout: 8000 }).should('be.visible');
    cy.contains('td', 'Paul Carroll').parents('tr').find('a').first().click();

    cy.wait('@getDCs');
    cy.location('hash', { timeout: 8000 }).should('include', '/mx/datacollection/session/1/main');
    cy.window().its('EXI.credentialManager').invoke('getActiveProposal').should('deep.equal', ['MX1234']);
  });

  it('the credential splitbutton dropdown lists {proposal}@{username} but its items are not clickable', () => {
    loginAndWaitForWelcome();
    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');

      // Ext.Button (split:true) decides handler-vs-menu purely by click X-coordinate against a
      // narrow "trigger region" at the button's right edge (min/extjs/build/ext-all-debug.js
      // isWithinTrigger/getTriggerRegion, ~line 87116-87134) — there is no separate arrow DOM
      // element a Cypress selector could target. Rather than fight pixel-perfect click
      // coordinates, invoke the same component API a real arrow-click ends up calling — the same
      // "drive the ExtJS component directly" convention already established in
      // shipping/shipment-create.cy.js for the Shipments submenu that "only reveals via a real
      // hover, not a click".
      const button = win.Ext.ComponentQuery.query('splitbutton')
        .find((b) => b.cls && b.cls.indexOf('button_log_out') !== -1);
      button.showMenu();
    });

    // Exact class confirmed live (Playwright against a running instance) — ExtJS 5 renders
    // disabled menu items with `x-menu-item-disabled`, not `x-item-disabled`.
    cy.get('.x-menu-item').should('be.visible').and('contain.text', '@');
    cy.contains('.x-menu-item', '@').should('have.class', 'x-menu-item-disabled');
  });
});
