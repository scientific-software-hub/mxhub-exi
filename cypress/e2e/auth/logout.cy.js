// Tests for logging out (journey X3).
//
// Splitbutton: js/core/menu/mainmenu.js:504-528 (getLoginButton). `cls: 'button_log_out'` is
// applied UNCONDITIONALLY — it's present even before login when the button reads "Sign In" — so
// it cannot be used alone as a "logged in" indicator; every selector below is qualified by the
// button's text too. The handler dispatches purely on whether any credential exists:
// `location.hash = "/login"` or `"/logout"`.
//
// getLoginButton()'s own static text ("log out", lowercase, no credential appended) is a red
// herring — it is only ever what's used if the *menu itself* were constructed while credentials
// already existed (not the normal flow). In the actual login flow the button is built once
// up-front (no credentials yet, text "Sign In"), then `populateCredentialsMenu()`
// (mainmenu.js:408-450, called on every login/logout) OVERWRITES it via `Ext.getCmp(...).setText()`
// (line 441) to `"Log out " + credentialDisplay` — capital L, WITH the last-seen credential's
// username appended (confirmed live: reads "Log out ispyb" here, since `setActiveProposal` was
// never called in this spec so `activeProposals` stays empty and `credentialDisplay` is just the
// bare username). Match on the capitalized, credential-suffixed text.
//
// #/logout is a genuinely distinct route handler from #/welcome/#/login
// (js/core/controller/exicontroller.js:43-101 — #/login and #/welcome are byte-identical: both
// just call `credentialManager.logout(); authenticationForm.show();`), but all three converge on
// the same final visible state because CredentialManager's single `onLogout` subscriber
// (js/core/app/exi.js:47-55) unconditionally forces `location.hash = '/welcome'` once logout()
// fires — which re-dispatches #/welcome's own handler (itself a logout, idempotent) and is what
// actually (re)shows the auth form. So the URL you land on after clicking "log out" is
// `#/welcome`, not `#/logout`.
//
// The one OBSERVABLE difference: only #/logout's own handler calls EXI.hideNavigationPanel() and
// EXI.proposalManager.clear() (removes localStorage.proposals) before the forced redirect — a
// bare #/welcome navigation does not touch localStorage.proposals at all. This is the same
// "#/welcome also logs out" trap documented for testers in confirmed-bugs.md §10, confirmed here
// to apply to the real "Log out" user action too, not just as a testing footgun.
//
// CredentialManager.prototype.logout (js/core/security/credentialmanager.js:214-217) only removes
// localStorage.credentials — it does not touch localStorage.sessions.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { body: [] }).as('getProposals');
}

// ─── Login helper (same convention as auth/login.cy.js) ───────────────────────

function loginWithForm(user, pass) {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type(user);
  cy.get('input[name="password"]', { timeout: 5000  }).type(pass);
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
}

function loginAndWaitForWelcome() {
  loginWithForm('ispyb', 'ispyb');
  cy.wait('@authenticate');
  cy.wait('@getSessions');
  cy.wait('@getProposals');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Log out — splitbutton', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('clicking "Log out" shows the auth form again and lands on a #/welcome-including hash', () => {
    loginAndWaitForWelcome();

    // Qualified by text, not just cls: 'button_log_out' — that class is present even pre-login.
    cy.contains('.button_log_out', 'Log out').click();

    cy.get('input[name="user"]', { timeout: 8000 }).should('be.visible');
    cy.location('hash', { timeout: 8000 }).should('include', 'welcome');
  });

  it('clears the cached proposals list (localStorage.proposals) on logout — a plain #/welcome navigation would not', () => {
    loginAndWaitForWelcome();

    // Seed the cache the way ProposalManager.prototype.get() would (proposalmanager.js:17-29) —
    // any non-null value proves the removal, the exact shape is irrelevant here.
    cy.window().then((win) => {
      win.localStorage.setItem('proposals', JSON.stringify([{ proposal: [{ proposalId: 1 }] }]));
    });

    cy.contains('.button_log_out', 'Log out').click();

    cy.window().its('localStorage').invoke('getItem', 'proposals').should('be.null');
  });

  it('documents that a bare #/welcome navigation does NOT clear localStorage.proposals (only #/logout does)', () => {
    loginAndWaitForWelcome();

    cy.window().then((win) => {
      win.localStorage.setItem('proposals', JSON.stringify([{ proposal: [{ proposalId: 1 }] }]));
      win.location.hash = '#/welcome';
    });

    cy.get('input[name="user"]', { timeout: 8000 }).should('be.visible');
    cy.window().its('localStorage').invoke('getItem', 'proposals').should('not.be.null');
  });
});
