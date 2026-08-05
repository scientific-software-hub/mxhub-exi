// Tests for the Data Collections view: #/mx/datacollection/session/:sessionId/main
// and the dedicated autoprocessing plots page: #/autoprocintegration/datacollection/:dcId/main
//
// Route handlers: js/mx/controller/mxdatacollectioncontroller.js,
//                 js/mx/controller/autoprocintegrationcontroller.js
// Views:          js/mx/view/datacollection/datacollectionmxmainview.js,
//                 js/mx/view/datacollection/grid/{mxdatacollectiongrid,uncollapseddatacollectiongrid}.js,
//                 js/mx/view/autoprocintegrationmainview.js, js/mx/view/autoprocintegration/autoprocintegrationplots.js
//
// Per-card tab bar has 6 tabs: Summary, Beamline Parameters, Data Collections (runs), Sample,
// Last Collect Results, Workflow. They are Bootstrap `.nav-tabs a` anchors rendered by
// templates/mx/datacollectionsummary/mxdatacollectiongrid.template.js, not ExtJS tabs — each
// tab-pane has a predictable id (datacollection_{dcId}, experimentparameters_{dcId}, dc_{groupId},
// sa_{dcId}, re_{dcId}, wf_{dcId}) which these tests use to scope assertions instead of relying on
// visibility-order of `cy.contains()` across multiple DC cards.
//
// "Last Collect Results" and "Workflow" only render as clickable tabs when the DC row carries a
// non-empty `autoProcIntegrationId` / `WorkflowStep_workflowStepType` respectively (see
// DataCollectionGrid.prototype.getColumns in js/mx/view/datacollection/datacollectiongrid.js) —
// otherwise the template renders `<li class="disabled">` with no href. Our fixture's first DC row
// carries `autoProcIntegrationId` (so Last Collect Results is enabled) but no workflow fields (so
// Workflow stays disabled), matching confirmed-bugs.md §2 (the only reachable Workflow route
// crashes) — we only assert the tab is present+disabled, never click into it.

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

  // Fired eagerly, in parallel with the DC list itself, by the session route handler —
  // not deferred to a tab click (confirmed live, user-journeys.md A7/B3).
  cy.intercept('GET', '**/energyscan/session/*/list', { body: [] }).as('getEnergyScans');
  cy.intercept('GET', '**/xrfscan/session/*/list',    { body: [] }).as('getXrfScans');

  // "Last Collect Results" tab content (inline, per-card).
  cy.intercept('GET', '**/autoprocintegration/datacollection/*/view',
    { fixture: 'mx/autoprocintegration-dc.json' }).as('getAutoprocView');

  // "Data Collections" (runs) tab content — fetched fresh on tab click via
  // UncollapsedDataCollectionGrid.prototype.displayDataCollectionTab, a separate endpoint from
  // the initial session DC list.
  cy.intercept('GET', '**/datacollection/datacollectiongroupid/*/list',
    { fixture: 'mx/datacollectiongroup-runs.json' }).as('getGroupRuns');

  // AutoProcIntegrationMainView.load() fires this whenever exactly one DC's results are shown —
  // not exercised by these tests (Files/attachment download is out of scope, confirmed-bugs.md §4),
  // stubbed empty so the request doesn't hang.
  cy.intercept('GET', '**/autoprocintegration/attachment/autoprocprogramid/*/list',
    { body: [] }).as('getAttachments');
}

function setupAutoprocPlotIntercepts(autoProcIntegrationId = '9430') {
  const base = `**/autoprocintegration/${autoProcIntegrationId}/xscale`;
  cy.intercept('GET', `${base}/completeness`, { fixture: 'mx/autoproc/xscale-completeness.txt' }).as('getCompleteness');
  cy.intercept('GET', `${base}/rfactor`,      { fixture: 'mx/autoproc/xscale-rfactor.txt' }).as('getRfactor');
  cy.intercept('GET', `${base}/isigma`,       { fixture: 'mx/autoproc/xscale-isigma.txt' }).as('getISigma');
  cy.intercept('GET', `${base}/cc2`,          { fixture: 'mx/autoproc/xscale-cc2.txt' }).as('getCC2');
  cy.intercept('GET', `${base}/sigmaano`,     { fixture: 'mx/autoproc/xscale-sigmaano.txt' }).as('getSigmaAno');
  cy.intercept('GET', `${base}/anomcorr`,     { fixture: 'mx/autoproc/xscale-anomcorr.txt' }).as('getAnomCorr');
}

// ─── Login helper (copied structural pattern from cypress/e2e/shipping/shipment-list.cy.js) ──

function login() {
  cy.visitMx();
  cy.get('input[name="user"]',     { timeout: 10000 }).should('be.visible').type('ispyb');
  cy.get('input[name="password"]', { timeout: 5000  }).type('ispyb');
  cy.contains('a.x-btn', 'Login').should('not.have.class', 'x-disabled').click();
  cy.wait('@authenticate');
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

// Logs in, activates proposal MX1234, jumps straight to a session's DC view and waits for the
// DC list XHR. test-coverage.md's Step 6 sketch of this helper omitted the login() call and used
// username 'hakanj' for setActiveProposal — corrected here to match this repo's actual convention
// (every other spec logs in as 'ispyb'/'ispyb' and activates the proposal under that same username).
function visitSessionDCPage(sessionId = '11024235') {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = `#/mx/datacollection/session/${sessionId}/main`;
  });
  cy.wait('@getDCs');
  // UncollapsedDataCollectionGrid.attachCallBackAfterRender binds the shown.bs.tab listeners
  // (the ones that fire the on-demand AJAX for the "Data Collections" / "Last Collect Results"
  // tabs) inside its own setTimeout(fn, 500) — a card-tab click before that fires updates the
  // Bootstrap pane but never triggers the fetch. This mirrors that same delay.
  cy.wait(600);
}

function visitAutoprocPage(dataCollectionId = '26919') {
  login();
  cy.wait('@getSessions');
  cy.window().then((win) => {
    win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
    win.location.hash = `#/autoprocintegration/datacollection/${dataCollectionId}/main`;
  });
  cy.wait('@getAutoprocView');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Data Collections — session drill-down (home → DC view)', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('clicking a session row in the welcome grid navigates to the DC view', () => {
    login();
    cy.wait('@getSessions');

    cy.window().then((win) => {
      win.EXI.credentialManager.setActiveProposal('ispyb', 'MX1234');
      win.location.hash = '#/welcome/manager/ispyb/date/20260201/20260228/main';
    });
    cy.wait('@getSessions');

    cy.contains('Paul Carroll', { timeout: 8000 }).should('be.visible');
    cy.contains('td', 'Paul Carroll').parents('tr').find('a').first().click();

    cy.location('hash', { timeout: 8000 }).should('include', '/mx/datacollection/session/');
    cy.wait('@getDCs');
  });
});

describe('Data Collections — card list rendering', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('renders DC cards with type badge and datetime', () => {
    visitSessionDCPage();
    cy.contains('Characterization').should('be.visible');
    cy.contains('04:21').should('be.visible');
  });

  it('shows the correct DC count in the main tab header', () => {
    visitSessionDCPage();
    cy.contains('a.x-tab', '2 Data Collections').should('be.visible').and('have.class', 'x-active');
  });

  it('Energy Scans and Fluorescence Spectra tabs are disabled when session has none', () => {
    visitSessionDCPage();
    cy.contains('a.x-tab', 'Energy Scans').should('have.class', 'x-tab-disabled');
    cy.contains('a.x-tab', 'Fluorescence Spectra').should('have.class', 'x-tab-disabled');
  });
});

describe('Data Collections — card tab switching', () => {
  beforeEach(() => {
    setupIntercepts();
  });

  it('Summary tab is active by default and shows Protein and Sample fields', () => {
    visitSessionDCPage();
    cy.get('#datacollection_26919').should('be.visible').within(() => {
      cy.contains('ACC').should('be.visible');
      cy.contains('BS79ex16').should('be.visible');
    });
  });

  it('clicking Beamline Parameters tab shows instrument metadata', () => {
    visitSessionDCPage();
    cy.get('.nav-tabs').contains('Beamline Parameters').click();
    cy.get('#experimentparameters_26919').should('be.visible').within(() => {
      cy.contains('P11').should('be.visible');
      cy.contains('Eiger').should('be.visible');
      cy.contains('U32').should('be.visible');
    });
  });

  it('clicking Data Collections tab shows runs grid with image count and status', () => {
    visitSessionDCPage();
    cy.get('.nav-tabs').first().contains('Data Collections').click();
    cy.wait('@getGroupRuns');
    cy.get('#dc_26506').should('be.visible').within(() => {
      cy.contains('4').should('be.visible');
      cy.contains('DataCollection Successful').should('be.visible');
    });
  });

  it('clicking Sample tab shows sample name and protein acronym in table', () => {
    visitSessionDCPage();
    cy.get('.nav-tabs').contains('Sample').click();
    cy.get('#sa_26919').should('be.visible').within(() => {
      cy.contains('BS79ex16').should('be.visible');
      cy.contains('ACC').should('be.visible');
    });
  });

  it('clicking Last Collect Results tab shows autoprocessing status', () => {
    visitSessionDCPage();
    cy.get('.nav-tabs').contains('Last Collect Results').click();
    cy.wait('@getAutoprocView');
    cy.get('#re_26919').should('be.visible').within(() => {
      cy.contains('P 1').should('be.visible');
    });
  });

  it('clicking Last Collect Results tab with no autoprocessing results shows empty state', () => {
    // The real endpoint scopes results per requested dataCollectionId with a nested array
    // (one inner array per id) — an empty result set for a single dcId is `[[]]`, not `[]`.
    // AutoProcIntegrationGrid.parseData reads `data[0]`, so a bare `[]` would make that
    // `undefined` and throw before rendering; `[[]]` is the real "no results" shape.
    cy.intercept('GET', '**/autoprocintegration/datacollection/*/view', { body: [[]] }).as('getAutoprocView');
    visitSessionDCPage();
    cy.get('.nav-tabs').contains('Last Collect Results').click();
    cy.wait('@getAutoprocView');
    cy.get('#re_26919').should('be.visible').find('.autoprocintegrationrow').should('not.exist');
  });

  it('Workflow tab is present and disabled when the DC has no associated Workflow record', () => {
    visitSessionDCPage();
    // Do NOT click into it — the only reachable Workflow route is confirmed broken
    // (confirmed-bugs.md §2); this only asserts the tab's disabled presence, not its content.
    cy.get('.nav-tabs').contains('Workflow').closest('li').should('have.class', 'disabled');
  });
});

describe('Autoprocessing plots — #/autoprocintegration/datacollection/{dcId}/main', () => {
  // AutoprocIntegrationController's route handler (js/mx/controller/autoprocintegrationcontroller.js)
  // calls listPanel.panel.getSelectionModel().selectAll() on the nav sidebar grid immediately after
  // loading it, in the same synchronous callback as the /view response — before ExtJS's own view
  // refresh for the freshly-loaded store has run, throwing inside Ext's selectAll() ("Cannot read
  // properties of undefined (reading 'getRange')"). This is a real, reproducible app bug (not
  // triggered by anything these tests do), but it fires *after* mainView.load(data[0]) has already
  // fired all 6 xscale requests earlier in the same handler, so it doesn't affect what these tests
  // check — plot rendering. Swallow it here rather than let it fail tests that never touch the nav
  // sidebar's row selection.
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes("reading 'getRange'")) return false;
  });

  beforeEach(() => {
    setupIntercepts();
  });

  it('renders all 6 plots with real curve data on pipeline row select', () => {
    setupAutoprocPlotIntercepts();
    visitAutoprocPage();

    cy.get('#navigation').find('.x-grid-row').first().click();
    cy.wait(['@getCompleteness', '@getRfactor', '@getISigma', '@getCC2', '@getSigmaAno', '@getAnomCorr']);

    ['completeness', 'rfactor', 'sigmaI', 'cc2', 'sigmaAnno', 'anno'].forEach((id) => {
      cy.get(`#${id}`).should('be.visible').find('canvas').should('exist');
    });
  });

  it('xscale/wilson is not requested automatically by the plots panel', () => {
    setupAutoprocPlotIntercepts();
    cy.intercept('GET', '**/xscale/wilson').as('getWilson');
    visitAutoprocPage();

    cy.get('#navigation').find('.x-grid-row').first().click();
    cy.wait(['@getCompleteness', '@getRfactor', '@getISigma', '@getCC2', '@getSigmaAno', '@getAnomCorr']);

    cy.get('@getWilson.all').should('have.length', 0);
  });

  it('shows an empty/no-data state for a FastDP pipeline with no matching log attachment', () => {
    cy.intercept('GET', '**/autoprocintegration/datacollection/*/view',
      { fixture: 'mx/autoprocintegration-dc-fastdp.json' }).as('getAutoprocView');
    const base = '**/autoprocintegration/9430/fastdp';
    cy.intercept('GET', `${base}/completeness`, { fixture: 'mx/autoproc/fastdp-empty.txt' }).as('getFastDPCompleteness');
    cy.intercept('GET', `${base}/rfactor`,      { fixture: 'mx/autoproc/fastdp-empty.txt' }).as('getFastDPRfactor');
    cy.intercept('GET', `${base}/isigma`,       { fixture: 'mx/autoproc/fastdp-empty.txt' }).as('getFastDPISigma');
    cy.intercept('GET', `${base}/cc2`,          { fixture: 'mx/autoproc/fastdp-empty.txt' }).as('getFastDPCC2');

    visitAutoprocPage();
    cy.get('#navigation').find('.x-grid-row').first().click();
    cy.wait(['@getFastDPCompleteness', '@getFastDPRfactor', '@getFastDPISigma', '@getFastDPCC2']);

    cy.get('#completeness').find('canvas').should('not.exist');
  });
});
