// Tests for the four pre-auth deep-link redirector routes (journey X2), all registered in
// MxDataCollectionController.prototype.init (js/mx/controller/mxdatacollectioncontroller.js).
//
// The 4 routes do NOT share one segment template — two put `proposal` right after `/mx/`, the
// other two put the resource type first:
//
//   #/mx/proposal/:proposal/datacollection/sample/:sampleId/main        -> #/mx/datacollection/sample/:sampleId/main            (line 38)
//   #/mx/datacollection/proposal/:proposal/shipping/:shippingId/main    -> #/mx/datacollection/shipping/:shippingId/main         (line 62)
//   #/mx/proposal/:proposal/datacollection/session/:sessionId/main      -> #/mx/datacollection/session/:sessionId/main (= A7/B3)  (line 88)
//   #/mx/datacollection/proposal/:proposal/dcid/:datacollectionid/main  -> #/mx/datacollection/dcid/:datacollectionid/main        (line 131)
//
// Shared redirect logic (js/core/controller/exigenericcontroller.js:11-31), identical for all 4 —
// this is what's actually worth testing, not each target view's full rendering (the session
// variant's target is already fully covered by mx/data-collections.cy.js; the sample/shipping/
// dcid targets' own REST responses are stubbed empty below just so navigation completes without
// hanging — their rendering is out of scope for this step, which is about the redirect mechanism):
//
//   - Not-yet-authenticated (getConnections().length == 0): shows the standard AuthenticationForm
//     modal. On successful POST /authenticate, calls setActiveProposal(justAuthenticatedUsername,
//     :proposal), then location.hash = redirection, closes the auth window.
//   - Already authenticated: no REST call at all — synchronously does
//     setActiveProposal(getCredentials()[0].username, :proposal) (uses the FIRST stored
//     credential's username, not necessarily whichever one is "active") then
//     location.hash = redirection.
//
// EXI.credentialManager.getActiveProposal() (js/core/security/credentialmanager.js:220-223)
// returns credentials[0].activeProposals — an ARRAY, not a scalar string.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  // Session redirect target — the ordinary A7/B3 route, fully covered elsewhere.
  cy.intercept('GET', '**/mx/datacollection/session/*/list', { body: [] }).as('getDCsBySession');
  cy.intercept('GET', '**/energyscan/session/*/list',        { body: [] }).as('getEnergyScans');
  cy.intercept('GET', '**/xrfscan/session/*/list',            { body: [] }).as('getXrfScans');

  // Sample / shipping / dcid redirect targets — stubbed empty only so navigation completes.
  cy.intercept('GET', '**/mx/datacollection/sample/*/list',   { body: [] }).as('getDCsBySample');
  cy.intercept('GET', '**/shipping/*/datacollecitons/list',   { body: [] }).as('getDCsByShipping');
  cy.intercept('GET', '**/mx/datacollection/*/list',          { body: [] }).as('getDCsByDcid');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Deep link redirectors — already authenticated', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('#/mx/proposal/:proposal/datacollection/session/:id/main sets active proposal and forwards to the non-prefixed session route', () => {
    login();
    cy.wait('@getSessions');

    // Active proposal starts as something else, to prove the redirector actually changes it.
    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'OTHERPROP');
      win.location.hash = '#/mx/proposal/MX1234/datacollection/session/11024235/main';
    });

    cy.wait('@getDCsBySession');
    cy.location('hash', { timeout: 8000 }).should('include', '/mx/datacollection/session/11024235/main');
    cy.window().its('EXI.credentialManager').invoke('getActiveProposal').should('deep.equal', ['MX1234']);
  });

  it('the shipping/sample/dcid variants forward to their respective non-prefixed routes and set the active proposal', () => {
    // Only the redirect mechanism is asserted here, not each target's own rendering (out of
    // scope, see file header).
    const cases = [
      { from: '#/mx/proposal/MX1234/datacollection/sample/500/main',       to: '/mx/datacollection/sample/500/main',       wait: '@getDCsBySample' },
      { from: '#/mx/datacollection/proposal/MX1234/shipping/1/main',       to: '/mx/datacollection/shipping/1/main',       wait: '@getDCsByShipping' },
      { from: '#/mx/datacollection/proposal/MX1234/dcid/26919/main',       to: '/mx/datacollection/dcid/26919/main',       wait: '@getDCsByDcid' },
    ];

    login();
    cy.wait('@getSessions');

    cases.forEach(({ from, to, wait }) => {
      cy.window().then((win) => {
        win.EXI.credentialManager.setActiveProposal('ispyb', 'OTHERPROP');
        win.location.hash = from;
      });
      cy.wait(wait);
      cy.location('hash', { timeout: 8000 }).should('include', to);
      cy.window().its('EXI.credentialManager').invoke('getActiveProposal').should('deep.equal', ['MX1234']);
    });
  });
});

describe('Deep link redirectors — not yet authenticated', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('shows the AuthenticationForm modal; after a successful login it sets the proposal from the deep link and forwards', () => {
    // Do NOT call login() — visit fresh, no credentials, hash pre-set to the deep link. (Setting
    // win.location.hash AFTER a bare cy.visitMx() — every other spec's convention — doesn't work
    // here: the bare visit's own default #/welcome routing already opens one AuthenticationForm,
    // and the deep-link route's authenticateAndRedirect() then opens a SECOND one on top,
    // stacking two identical `input[name="user"]` fields. Passing the hash directly in the visit
    // URL avoids the #/welcome detour entirely — Path.js dispatches once, for this route only.)
    cy.visitMx('#/mx/proposal/MX1234/datacollection/session/11024235/main');

    cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
    cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
    cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
    cy.wait('@authenticate');

    cy.wait('@getDCsBySession');
    cy.location('hash', { timeout: 8000 }).should('include', '/mx/datacollection/session/11024235/main');
    cy.window().its('EXI.credentialManager').invoke('getActiveProposal').should('deep.equal', ['MX1234']);
  });
});
