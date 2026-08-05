// Tests for proposal-scoped session browsing (journey C3): #/welcome/manager/proposal/:proposal/main
//
// Route + view + REST (js/core/controller/exicontroller.js:83-94):
//   #/welcome/manager/proposal/:proposal/main -> ManagerWelcomeMainView
//   GET /{token}/proposal/{proposal}/session/list  (SessionDataAdapter.prototype.getSessionsByProposal,
//   js/ispyb-client/proposal/sessiondataadapter.js:18-20). Note there is no onError handler on this
//   route — a failed request leaves the loading spinner up forever; not exercised here.
//
// RETARGETED from the original plan sketch, which had this journey triggered by clicking the
// outer Ext tab (labelled with the proposal code+number, e.g. "MX1234") on the DC session view
// (mx/data-collections.cy.js's route). That tab's title/click-handler are set by
// DataCollectionMxMainView.prototype.loadProposal (js/mx/view/datacollection/datacollectionmxmainview.js:135-142)
// — but grepping the whole js/ tree, its ONLY caller is js/em/controller/emdatacollectioncontroller.js:64,
// the EM controller. The MX session route (js/mx/controller/mxdatacollectioncontroller.js:103-130)
// never calls it — the tab is dead code in the MX module and is never clickable in practice.
// Testing this journey directly via the route's own hash instead.
//
// Confirmed dead code — do not assert on a title string: ManagerWelcomeMainView.prototype.displaySessions
// (js/core/view/managerwelcomemainview.js:176-190) builds a "N sessions for proposal X" title and
// passes it to `this.sessionGrid.load(this.filterSessions(sessions), title)`, but
// SessionGrid.prototype.load (js/core/widget/sessiongrid.js:98) only declares ONE parameter —
// `title` is silently dropped, and the grid panel has no `title:` config at all. There is no DOM
// text reading "N sessions for proposal…" anywhere; assertions below are on row content instead.
//
// Every fixture row is beamLineName: "P11" — SessionGrid.prototype.load
// (js/core/widget/sessiongrid.js:103) filters sessions by
// EXI.credentialManager.getBeamlineNames(), and mx/config.js's LOCAL site only declares P11; a
// session on any other beamline would silently be dropped from the grid.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');

  cy.intercept('GET', '**/proposal/*/session/list',
    { fixture: 'proposal/sessions-for-proposal.json' }).as('getProposalSessions');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper ─────────────────────────────────────────────────────────

function visitProposalSessions(proposal = 'MX1234') {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = `#/welcome/manager/proposal/${proposal}/main`;
  });
  cy.wait('@getProposalSessions');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Proposal-scoped session browsing (C3)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('navigating to #/welcome/manager/proposal/MX1234/main fires GET /proposal/MX1234/session/list', () => {
    visitProposalSessions();
    cy.get('@getProposalSessions').its('request.url').should('include', '/proposal/MX1234/session/list');
  });

  it('renders session rows from the fixture (not a "N sessions for proposal" title — confirmed dead)', () => {
    visitProposalSessions();

    // Row content assertions (beamLineOperator is rendered plain-text, same convention as
    // auth/login.cy.js's own welcome-grid test).
    cy.contains('Sabine Meier').should('be.visible');
    cy.contains('Paul Carroll').should('be.visible');

    // The dropped `title` argument would have read "2 sessions for proposal MX1234" — assert it
    // is nowhere in the DOM, documenting the dead parameter rather than a working feature.
    cy.contains('sessions for proposal').should('not.exist');
  });

  it('only sessions on a configured beamline (P11) are shown — an unconfigured beamline is silently dropped', () => {
    cy.intercept('GET', '**/proposal/*/session/list', {
      body: [
        { beamLineName: 'P11', beamLineOperator: 'Sabine Meier', sessionId: 2, BLSession_startDate: 'Mar 11, 2026, 11:53:23 PM' },
        { beamLineName: 'BioMAX', beamLineOperator: 'Someone Else', sessionId: 99, BLSession_startDate: 'Mar 12, 2026, 11:53:23 PM' },
      ],
    }).as('getProposalSessions');

    visitProposalSessions();
    cy.contains('Sabine Meier').should('be.visible');
    cy.contains('Someone Else').should('not.exist');
  });
});
