import './commands';

// CSVPuckFormView.load() schedules setFileUploadListeners via setTimeout(1000).
// When a test navigates away before the timer fires, getElementById returns null
// and addEventListener throws. The view is already unmounted so the error is
// harmless — suppress it rather than failing the next test.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("'addEventListener'")) return false;
});
