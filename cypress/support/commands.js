// Proteins are loaded from the captured fixture (cypress/fixtures/proposal/proteins.json).
// If that file doesn't exist yet, fall back to hard-coded defaults so the
// synthetic CSV tests (valid.csv, bad-sample.csv, unknown-protein.csv) still work.
// Matches cypress/fixtures/proposal/info.json — real DB proteins (VXR/WRN/DCM)
// plus the proteins required by the user-supplied CSV files (decx2, krth, 5HT3).
const DEFAULT_PROTEINS = [
  { proteinId: 1, acronym: 'VXR',   name: 'Miller protein',   safetyLevel: 'GREEN', molecularMass: 373359.74, proteinType: 'Ligand',   sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
  { proteinId: 2, acronym: 'WRN',   name: 'Robinson protein', safetyLevel: 'RED',   molecularMass: 372927.19, proteinType: 'Protein',  sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
  { proteinId: 3, acronym: 'DCM',   name: 'Davis protein',    safetyLevel: 'RED',   molecularMass: 234837.41, proteinType: 'Buffer',   sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
  { proteinId: 4, acronym: '5HT3',  name: '5-HT3 Receptor',  safetyLevel: 'GREEN', molecularMass: 100000.0,  proteinType: 'Protein',  sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
  { proteinId: 5, acronym: 'decx2', name: 'Dectin-2',         safetyLevel: 'GREEN', molecularMass: 150000.0,  proteinType: 'Protein',  sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
  { proteinId: 6, acronym: 'krth',  name: 'Keratin H',        safetyLevel: 'GREEN', molecularMass: 120000.0,  proteinType: 'Protein',  sequence: null, personId: null, isCreatedBySampleSheet: 0, externalId: null, pcStateManager: null },
];

// applyAuthState — plain synchronous function, safe to call inside onBeforeLoad.
// Reads proteins from Cypress.authState which is populated in beforeEach via
// loadAuthState() below.
function applyAuthState(win) {
  win.localStorage.setItem('credentials', JSON.stringify(Cypress.authState.credentials));
  win.localStorage.setItem('proposals',   JSON.stringify(Cypress.authState.proposals));
}

Cypress.applyAuthState = applyAuthState;

// buildAuthState(proteins) — constructs the full auth state given a protein list.
function buildAuthState(proteins) {
  return {
    credentials: [{
      username: 'hakanj',
      roles: ['Manager'],
      token: 'test-token',
      url: '/ispyb/ispyb-ws/rest',
      exiUrl: '/ispyb/ispyb-ws/rest',
      activeProposals: ['MX1234'],
      tokenExpires: '2099-01-01T00:00:00.000Z',
      properties: {
        siteName: 'DESY_LOCAL',
        defaultSampleChanger: 'P11SC',
        beamlines: { MX: [{ name: 'P11', sampleChangerType: 'P11SC' }], SAXS: [], EM: [] },
        allow_add_proteins_roles: ['user', 'manager'],
      },
    }],
    proposals: [{
      proposal: [{ proposalId: 1, proposalCode: 'MX', proposalNumber: '1234', type: 'MX' }],
      proteins,
      crystals: [],
      macromolecules: [],
      ligands: [],
      plateTypes: [],
      buffers: [],
      stockSolutions: [],
      labcontacts: [],
    }],
  };
}

// Initialise with defaults so authState is never undefined.
Cypress.authState = buildAuthState(DEFAULT_PROTEINS);

// loadAuthState — reads the captured proteins fixture (if it exists) and
// refreshes Cypress.authState.  Call this in a beforeEach in suites that
// use real-world CSV files.
Cypress.Commands.add('loadAuthState', () => {
  cy.task('fileExists', 'cypress/fixtures/proposal/proteins.json', { log: false })
    .then((exists) => {
      if (exists) {
        cy.fixture('proposal/proteins.json').then((proteins) => {
          Cypress.authState = buildAuthState(proteins);
        });
      }
      // else: keep DEFAULT_PROTEINS — synthetic tests don't need real proteins
    });
});

// setAuthState — Cypress command wrapper for use outside onBeforeLoad.
Cypress.Commands.add('setAuthState', () => {
  cy.window().then(applyAuthState);
});
