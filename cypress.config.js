const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

// Start a static file server before running tests: npm run serve
// Then set baseUrl below to match (default: http://localhost:3000).

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 900,

    // Default env — override via cypress.env.json (gitignored) or CYPRESS_* vars.
    env: {
      ISPYB_URL:      'http://localhost:8080/ispyb/ispyb-ws/rest',
      ISPYB_USER:     'ispyb',
      ISPYB_PASS:     'ispyb',
      ISPYB_PROPOSAL: 'MX1234',
      ISPYB_SHIPPING_ID: '1',
    },

    setupNodeEvents(on) {
      on('task', {
        // Writes data to cypress/fixtures/<name> (creates dirs as needed).
        writeFixture({ name, data }) {
          const dest = path.join('cypress', 'fixtures', name);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, JSON.stringify(data, null, 2));
          console.log(`  fixture saved → ${dest}`);
          return null;
        },
        // Returns true if the file exists, false otherwise.
        fileExists(filePath) {
          return fs.existsSync(filePath);
        },
      });
    },
  },
});
