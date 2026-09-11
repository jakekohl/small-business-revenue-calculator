const STORAGE_KEY = 'inc-exp-calc-projection'

Cypress.Commands.add('visitApp', (projection) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.removeItem(STORAGE_KEY)
      if (projection) {
        win.localStorage.setItem(STORAGE_KEY, JSON.stringify(projection))
      }
    },
  })
  cy.getByTest('app').should('be.visible')
  cy.getByTest('hero-title').should('contain', 'Business Projector')
})

Cypress.Commands.add('reloadApp', () => {
  cy.reload()
  cy.getByTest('app').should('be.visible')
})
