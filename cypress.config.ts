import { defineConfig } from 'cypress'

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      require('./cypress/plugins/index.js')(on, config)
      return config;
    },
    baseUrl: 'http://127.0.0.1:8001',
  },
})
