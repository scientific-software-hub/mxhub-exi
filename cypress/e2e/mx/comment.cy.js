// Tests for data collection / data collection group comments (journey B6).
//
// Both triggers share one modal: CommentEditForm (js/mx/view/datacollection/grid/commenteditform.js)
// — a Bootstrap `.modal` appended straight to `<body>`, not an ExtJS window.
//
//   Trigger                  Selector                                    Tab-scoped?  Mode                POST
//   Group-level icon         [id$="-edit-comments"].dataCollectionGroup-edit   No      DATACOLLECTIONGROUP  mx/datacollectiongroup/{groupId}/comments/save
//   Per-DC icon (runs tab)   [id$="-edit-comments"].dataCollection-edit        Yes     DATACOLLECTION        mx/datacollection/{dcId}/comments/save
//
// Both icons share the exact `{id}-edit-comments` id suffix (and a third, unrelated
// `.session-comment-edit` icon exists on the welcome session grid) — every selector below is
// qualified by the full `#{id}-edit-comments.<class>` combination, id alone is not enough.
//
// Timing: the group icon's click handler is bound inside a 500ms setTimeout
// (uncollapseddatacollectiongrid.js:407-420, `movieEvents`, no `.unbind()` — re-running `load()`
// would stack duplicate handlers, not exercised here). The per-DC icon's handler binds
// synchronously once the "Data Collections" tab's own AJAX response renders
// (uncollapseddatacollectiongrid.js:119), but that tab's `shown.bs.tab` listener is itself bound
// behind the *same* 500ms timer (`tabsEvents`, line 405) — so a click on the tab before that timer
// fires updates the Bootstrap pane but never triggers the fetch. Reuses the identical
// `cy.wait(600)` convention already established in mx/data-collections.cy.js for this exact race.
//
// Save reflects client-side only — no re-fetch, no re-render of the card
// (commenteditform.js:41-53 -> uncollapseddatacollectiongrid.js:432-434):
//   commentEditForm.onSave.attach(function(sender, comment) { $("#comments_" + id).html(comment); });
// The typed text is written directly, regardless of what the mocked POST body actually contains,
// as long as it resolves 2xx — `save-comment-success.json` is an empty object for that reason.
// Both save adapters (js/ispyb-client/mx/datacollectiongroupdataadapter.js:17-22,
// datacollectiondataadapter.js:104-109) pass a plain object with no `contentType` override, so
// jQuery serialises the POST body as `application/x-www-form-urlencoded` (`comments=...`), not
// JSON — unlike the lab-contact save in shipping/addresses.cy.js.
//
// Fixture note: mx/datacollections-session.json's DC group 26506 has experimentType
// "Characterization" (not "EM", the one case where the group icon is not rendered at all,
// mxdatacollectiongrid.template.js's `{/ne}` guard) and carries no `comments` field at all, so the
// prefilled textarea is expected empty, not pre-populated. Reuses the same session (11024235),
// group (26506) and DC (26919) ids already established by mx/data-collections.cy.js.

// ─── Network mocks ────────────────────────────────────────────────────────────

function setupIntercepts() {
  cy.intercept('POST', '**/authenticate*', {
    body: { roles: ['Manager'], token: 'test-token' },
  }).as('authenticate');

  cy.intercept('GET', '**/session/date/**', { fixture: 'sessions/sessions-date-range.json' }).as('getSessions');
  cy.intercept('GET', '**/proposal/list',   { fixture: 'proposal/proposals.json' }).as('getProposals');
  cy.intercept('GET', '**/info/get',        { fixture: 'proposal/info.json' }).as('getProposalInfo');

  cy.intercept('GET', '**/datacollection/session/*/list',
    { fixture: 'mx/datacollections-session.json' }).as('getDCs');
  cy.intercept('GET', '**/energyscan/session/*/list', { body: [] }).as('getEnergyScans');
  cy.intercept('GET', '**/xrfscan/session/*/list',    { body: [] }).as('getXrfScans');
  cy.intercept('GET', '**/autoprocintegration/datacollection/*/view',
    { fixture: 'mx/autoprocintegration-dc.json' }).as('getAutoprocView');

  cy.intercept('GET', '**/datacollection/datacollectiongroupid/*/list',
    { fixture: 'mx/datacollectiongroup-runs.json' }).as('getGroupRuns');

  cy.intercept('POST', '**/mx/datacollectiongroup/*/comments/save',
    { fixture: 'mx/save-comment-success.json' }).as('saveGroupComment');
  cy.intercept('POST', '**/mx/datacollection/*/comments/save',
    { fixture: 'mx/save-comment-success.json' }).as('saveDCComment');
}

// ─── Login helper (byte-identical convention used by every other spec) ────────

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helper (copied from mx/data-collections.cy.js's visitSessionDCPage) ───

function visitSessionDCPage(sessionId = '11024235') {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = `#/mx/datacollection/session/${sessionId}/main`;
  });
  cy.wait('@getDCs');
  cy.wait(600);
}

// Decodes a form-urlencoded `comments=...` body back to plain text for assertions.
function decodeCommentsBody(body) {
  const match = /(?:^|&)comments=([^&]*)/.exec(body);
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

// Newly-found race, same class as shipment-detail.cy.js's documented RequiredTextField blur
// race: Bootstrap 3's Modal.prototype.show (node_modules/bootstrap/js/modal.js:96-105) adds the
// `.in` class SYNCHRONOUSLY, but only fires `.trigger('focus')` (stealing focus back onto the
// outer `.modal` div, wherever it currently is) once the fade CSS transition ends —
// `Modal.TRANSITION_DURATION = 300`ms later. Cypress's `.should('be.visible')` on the textarea
// passes as soon as the element has non-zero dimensions, well before that 300ms transition
// completes, so typing immediately after the modal "becomes visible" races the focus steal: any
// keystroke typed after ~300ms lands on the modal div instead of the textarea and is dropped —
// confirmed live, comments were silently truncated exactly at the 300ms mark. Waiting out the
// transition before typing avoids it; there is no `shown.bs.modal`-based Cypress hook available.
function typeIntoCommentModal(text) {
  cy.wait(350);
  cy.get('.modal-body textarea').clear().type(text);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Data Collection comments — group-level icon (no tab click needed)', () => {
  beforeEach(() => {
    setupIntercepts();
    visitSessionDCPage();
  });

  it('clicking the group comment icon opens the modal prefilled with the current (empty) comment', () => {
    cy.get('#26506-edit-comments.dataCollectionGroup-edit').click();
    cy.get('.modal-body textarea').should('be.visible').and('have.value', '');
  });

  it('typing a new comment and clicking Save updates #comments_26506 and POSTs to datacollectiongroup/26506/comments/save', () => {
    cy.get('#26506-edit-comments.dataCollectionGroup-edit').click();
    typeIntoCommentModal('New group comment');
    cy.contains('.modal-footer button', 'Save').click();

    cy.wait('@saveGroupComment').then(({ request }) => {
      expect(request.url).to.include('/datacollectiongroup/26506/comments/save');
      expect(decodeCommentsBody(request.body)).to.eq('New group comment');
    });
    cy.get('#comments_26506').should('contain.text', 'New group comment');
    // The modal's Save button also carries data-dismiss="modal" (fires before the mocked POST
    // resolves in the real app; here the intercept still resolves fast enough for this to settle).
    cy.get('.modal-body textarea').should('not.exist');
  });

  it('Close dismisses without saving — no POST fires', () => {
    cy.get('#26506-edit-comments.dataCollectionGroup-edit').click();
    typeIntoCommentModal('Not saved');
    cy.contains('.modal-footer button', 'Close').click();

    cy.get('.modal-body textarea').should('not.exist');
    cy.get('@saveGroupComment.all').should('have.length', 0);
  });
});

describe('Data Collection comments — per-run icon (inside the "Data Collections" tab)', () => {
  beforeEach(() => {
    setupIntercepts();
    visitSessionDCPage();
  });

  it('clicking the "Data Collections" tab then a run\'s comment icon opens the modal', () => {
    cy.get('.nav-tabs').first().contains('Data Collections').click();
    cy.wait('@getGroupRuns');

    cy.get('#26919-edit-comments.dataCollection-edit').click();
    cy.get('.modal-body textarea').should('be.visible').and('have.value', '');
  });

  it('Save updates #comments_26919 and POSTs to datacollection/26919/comments/save', () => {
    cy.get('.nav-tabs').first().contains('Data Collections').click();
    cy.wait('@getGroupRuns');

    cy.get('#26919-edit-comments.dataCollection-edit').click();
    typeIntoCommentModal('New run comment');
    cy.contains('.modal-footer button', 'Save').click();

    cy.wait('@saveDCComment').then(({ request }) => {
      expect(request.url).to.include('/datacollection/26919/comments/save');
      expect(decodeCommentsBody(request.body)).to.eq('New run comment');
    });
    cy.get('#comments_26919').should('contain.text', 'New run comment');
  });
});
