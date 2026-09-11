import { defineConfig } from 'cypress'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID || 'xxxxxxxx',
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1400,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    downloadsFolder: 'cypress/downloads',
  },
})
