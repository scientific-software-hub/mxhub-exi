// Tests for the "Add Protein" dialog (journey A3), reached from the main menu's Proteins/Crystals
// button (present on both MXMainMenu and MXManagerMenu — not manager-gated as a menu item; see
// the "Add new Protein" role test below for what actually IS gated). The two menu variants use
// DIFFERENT button text: MXMainMenu (non-manager) says "Proteins and Crystals"
// (js/mx/menu/mxmainmenu.js:38), MXManagerMenu says "Proteins & Crystals" — ampersand
// (js/mx/menu/mxmanagermenu.js:41). Selectors below match on the shared substring "Proteins"
// only, so they work under either role.
//
// Menu wiring (js/core/menu/mainmenu.js:232-310, MainMenu.prototype.getProteinCrystalsMenu,
// shared by both menu variants): the "Add new Protein" item's exact text has a capital P — not
// "Add new protein" as test-coverage.md's original sketch guessed. It starts `disabled: true` and
// is only enabled/disabled inside the menu's own `beforeshow` listener:
//   - `EXI.credentialManager.hasActiveProposal()` must be true (else the whole submenu, "List"
//     and "Ligands" included, stays disabled) — setActiveProposal() must run before opening it.
//   - `EXI.credentialManager.isUserAllowedAddProtein()` (js/core/security/credentialmanager.js:
//     157-170) then gates just "Add new Protein": for each `getConnections()` entry, checks
//     `cred.hasRole(role)` for every role in `allow_add_proteins_roles`.
//
// CORRECTION — where allow_add_proteins_roles actually comes from: it is NOT part of the mocked
// `/authenticate` response body. `js/core/widget/authenticationform.js:109-126` pulls
// `properties = ExtISPyB.sites[i]` straight from the app's own STATIC `mx/config.js` (matched by
// the selected site), independent of whatever the server returns. mx/config.js's LOCAL site
// declares `allow_add_proteins_roles: ['user','manager']` — so ANY login whose `roles` response
// contains "user" (case-insensitively, `Credential.prototype._checkRole`,
// js/core/security/credential.js:22-24) already gets "Add new Protein" enabled, regardless of
// what this spec's authenticate mock returns. That's the real, easy-to-get-wrong gate worth
// pinning (test-coverage-journeys.md's Step 5 addendum) — not a manager-only gate.
//
// ProteinEditForm (js/core/widget/proteineditform.js) — CORRECTION vs. test-coverage.md's
// original sketch: there is NO "Save is disabled while empty" behavior. The window's Save button
// is a plain always-enabled Ext.window.Window footer button; validation happens INSIDE
// `saveProtein()` via sequential `BUI.showError(...)` calls with an early return on the first
// failing field (same pattern as shipping/addresses.cy.js's AddressEditForm) — "Protein name is
// mandatory", then "Protein acronym is mandatory". Field ids: `{id}-name`, `{id}-acronym`
// (templates/core/protein.edit.form.template.js). Save POSTs a plain object with no
// `contentType` override (js/ispyb-client/mx/proteindataadapter.js:32) — form-urlencoded, same as
// the comment saves in mx/comment.cy.js, unlike the JSON lab-contact save in
// shipping/addresses.cy.js.
//
// On success, `onSaved.notify(protein)` passes the SERVER RESPONSE this time (proteineditform.js:
// 78-80's callback parameter shadows the outer locally-built variable) — the caller
// (mainmenu.js:237-241) does `window.close(); location.hash = "/protein/list";` unconditionally.
//
// Confirmed staleness bug (test-coverage-journeys.md's Step 5 addendum, matches the user guide's
// own "Refresh the page" instruction) — its real mechanism, worked out from source:
// `#/protein/list` (js/mx/controller/proteincontroller.js:44-56) DOES fire a fresh
// `GET .../mx/protein/stats` every time the route is actually DISPATCHED. The staleness only
// happens because `location.hash = "/protein/list"` is a NO-OP when you're already on that exact
// hash (setting location.hash to its current value fires no 'hashchange' event, so Path.js never
// re-dispatches) — i.e., only when "Add Protein" is opened from the #/protein/list page itself,
// not when opened fresh from elsewhere (e.g. the welcome page, where the hash genuinely changes
// and the list ends up fresh). Both cases are pinned below.
//
// Also newly found, unrelated to A3's own scope but touching the same "Proteins and Crystals"
// menu family: `#/mx/crystal/:crystalId/main` (js/mx/controller/crystalcontroller.js:39-51)
// constructs `new CrystalMainView()`, whose constructor (js/mx/view/crystalmainview.js:1-8) does
// `this.crystalForm = new CrystalForm(); this.samplesGrid = new SamplesGrid();` — neither
// `CrystalForm` nor a non-SAXS `SamplesGrid` class is defined ANYWHERE in the js/ tree. The route
// throws a ReferenceError before any request fires, the same "confirmed broken, unconstructible"
// pattern as confirmed-bugs.md §3/§4/§5 (PhasingNetworkWidget/AutoProcessingFileManager/
// PuckMainView). Per this project's own "file a bug, then write the test" rule, no test is
// written for it here — `#/crystal/nav`'s own list rendering is unaffected (CrystalListView
// doesn't reference either missing class) but is out of scope for A3 (protein), not attempted.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts(roles = ['Manager']) {
  cy.intercept('POST', '**/authenticate*', { body: { roles, token: 'test-token' } }).as('authenticate');
  cy.intercept('GET',  '**/session/date/**', { body: [] }).as('getSessions');
  cy.intercept('GET',  '**/proposal/list',   { body: [] }).as('getProposals');

  cy.intercept('GET',  '**/mx/protein/stats',
    { fixture: 'mx/protein-stats-before.json' }).as('getProteinStats');
  cy.intercept('POST', '**/mx/protein/save',
    { fixture: 'mx/save-protein-success.json' }).as('saveProtein');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// Decodes a form-urlencoded body back to a plain object for assertions.
function decodeFormBody(body) {
  const result = {};
  new URLSearchParams(body).forEach((value, key) => { result[key] = value; });
  return result;
}

// ─── Navigation helpers ────────────────────────────────────────────────────────

// Logs in, activates MX1234 (required for the menu's own hasActiveProposal() gate), and opens
// the "Add Protein" dialog from the persistent main menu bar on the post-login welcome page.
function visitAndOpenAddProteinDialog() {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
  });

  cy.contains('.x-btn', 'Proteins').click();
  cy.contains('.x-menu-item', 'Add new Protein').should('not.have.class', 'x-menu-item-disabled').click();

  cy.get('.x-window').should('be.visible').and('contain.text', 'Protein');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Proteins and Crystals — Add Protein dialog (A3)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('opens the Add Protein dialog from the menu with Name and Acronym inputs', () => {
    visitAndOpenAddProteinDialog();
    cy.get('[id$="-name"]').should('be.visible');
    cy.get('[id$="-acronym"]').should('be.visible');
  });

  it('"Add new Protein" is enabled for a User-role login too — LOCAL\'s allow_add_proteins_roles includes "user"', () => {
    // A non-manager login lands on #/welcome/user/:user/main (UserWelcomeMainView), not the
    // manager welcome page — it fetches GET /session/list (unfiltered), not
    // GET /session/date/**, so @getSessions never fires here; the menu bar itself renders
    // independently of that request resolving.
    setupIntercepts(['User']);
    cy.intercept('GET', '**/session/list', { body: [] }).as('getSessionList');
    login();
    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    });

    cy.contains('.x-btn', 'Proteins').click();
    cy.contains('.x-menu-item', 'Add new Protein').should('not.have.class', 'x-menu-item-disabled');
  });

  it('clicking Save with both fields empty shows "Protein name is mandatory" and does not POST', () => {
    visitAndOpenAddProteinDialog();
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.contains('Protein name is mandatory', { timeout: 6000 }).should('be.visible');
    cy.get('@saveProtein.all').should('have.length', 0);
  });

  it('clicking Save with only Name filled shows "Protein acronym is mandatory" and does not POST', () => {
    visitAndOpenAddProteinDialog();
    cy.get('[id$="-name"]').type('New Protein');
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.contains('Protein acronym is mandatory', { timeout: 6000 }).should('be.visible');
    cy.get('@saveProtein.all').should('have.length', 0);
  });

  it('successful save from the welcome page POSTs name+acronym, closes the dialog, and navigates to #/protein/list with a fresh fetch', () => {
    visitAndOpenAddProteinDialog();
    cy.get('[id$="-name"]').type('New Protein');
    cy.get('[id$="-acronym"]').type('NEWP');
    cy.contains('.x-window a.x-btn', 'Save').click();

    cy.wait('@saveProtein').then(({ request }) => {
      const body = decodeFormBody(request.body);
      expect(body.name).to.eq('New Protein');
      expect(body.acronym).to.eq('NEWP');
    });

    cy.get('.x-window').should('not.exist');
    cy.location('hash', { timeout: 8000 }).should('include', '/protein/list');
    // The hash genuinely changed (welcome -> protein/list), so Path.js re-dispatches the route
    // and it fires its own fresh GET — this is the SECOND @getProteinStats call (the first
    // happened implicitly on... actually there isn't one before this navigation, so this is #1).
    cy.wait('@getProteinStats');
    cy.contains('My Proteins').should('be.visible');
  });

  it('documents the staleness bug: opening Add Protein FROM #/protein/list itself does not refetch after save (matches the user guide\'s "Refresh the page" instruction)', () => {
    login();
    cy.wait('@getSessions');
    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
      win.location.hash = '#/protein/list';
    });
    cy.wait('@getProteinStats');
    cy.contains('My Proteins ( 2)').should('be.visible');

    cy.contains('.x-btn', 'Proteins').click();
    cy.contains('.x-menu-item', 'Add new Protein').should('not.have.class', 'x-menu-item-disabled').click();
    cy.get('.x-window').should('be.visible');

    cy.get('[id$="-name"]').type('New Protein');
    cy.get('[id$="-acronym"]').type('NEWP');
    cy.contains('.x-window a.x-btn', 'Save').click();
    cy.wait('@saveProtein');

    cy.get('.x-window').should('not.exist');
    // location.hash is set to "/protein/list" again — but we're already there, so this is a
    // no-op write: no 'hashchange' fires, Path.js never re-dispatches the route, and the second
    // GET never happens.
    cy.location('hash').should('include', '/protein/list');
    cy.get('@getProteinStats.all').should('have.length', 1);
    // The panel still shows the pre-save count/content — genuinely stale, not just "not yet
    // asserted" — matching the user guide's own instruction to refresh the page manually.
    cy.contains('My Proteins ( 2)').should('be.visible');
  });
});
