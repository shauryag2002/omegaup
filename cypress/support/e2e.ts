// https://on.cypress.io/configuration

import './commands';
import '@cypress/code-coverage/support';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.error.includes('idpiframe_initialization_failed')) {
    // Google API sign in error
    return false;
  }
});
