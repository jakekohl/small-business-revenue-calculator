function inputOf(subject) {
  const $el = Cypress.$(subject)
  return $el.is('input') ? $el : $el.find('input')
}

Cypress.Commands.add('fillText', (testId, value) => {
  cy.getByTest(testId).then(($el) => {
    cy.wrap(inputOf($el)).clear().type(String(value), { delay: 0 }).blur()
  })
})

Cypress.Commands.add('fillNumber', (testId, value) => {
  cy.getByTest(testId).then(($el) => {
    cy.wrap(inputOf($el))
      .click()
      .type('{selectall}{del}', { delay: 0 })
      .type(String(value), { delay: 0 })
      .blur()
  })
})

Cypress.Commands.add('toggleByTest', (testId) => {
  cy.getByTest(testId).click()
})

Cypress.Commands.add('selectCategory', (label) => {
  cy.getByTest('expense-category').click()
  cy.getByTestGlobal('expense-category-overlay').should('be.visible').contains(label).click()
})

Cypress.Commands.add('selectFrequency', (label) => {
  cy.getByTest('expense-frequency').click()
  cy.getByTestGlobal('expense-frequency-overlay').should('be.visible').contains(label).click()
})

Cypress.Commands.add('selectDueMonth', (label) => {
  cy.getByTest('expense-due-month').click()
  cy.getByTestGlobal('expense-due-month-overlay').should('be.visible').contains(label).click()
})

Cypress.Commands.add('confirmAccept', (expectedTitle) => {
  cy.getByTestGlobal('confirm-dialog').should('be.visible')
  if (expectedTitle) {
    cy.getByTestGlobal('confirm-title').should('contain', expectedTitle)
  }
  cy.getByTestGlobal('confirm-accept').click()
  cy.getByTestGlobal('confirm-dialog').should('not.exist')
})

Cypress.Commands.add('confirmReject', (expectedTitle) => {
  cy.getByTestGlobal('confirm-dialog').should('be.visible')
  if (expectedTitle) {
    cy.getByTestGlobal('confirm-title').should('contain', expectedTitle)
  }
  cy.getByTestGlobal('confirm-reject').click()
  cy.getByTestGlobal('confirm-dialog').should('not.exist')
})

Cypress.Commands.add('importFile', (fixtureName) => {
  cy.getByTest('hero-import').click()
  cy.getByTest('hero-import-input').selectFile(`cypress/fixtures/${fixtureName}`, { force: true })
})

Cypress.Commands.add('exportProjection', () => {
  cy.getByTest('hero-export').click()
})

Cypress.Commands.add('startBlankPlan', () => {
  cy.getByTest('hero-blank-plan').click()
  cy.confirmAccept('Start with a blank plan?')
})

Cypress.Commands.add('loadSamplePlan', () => {
  cy.getByTest('hero-load-sample').click()
  cy.confirmAccept('Load sample numbers?')
})
