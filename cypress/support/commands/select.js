function testSelector(id) {
  return `[data-test="${id}"]`
}

Cypress.Commands.add('getByTest', (id, options) => cy.get(testSelector(id), options))

Cypress.Commands.add('getByTestGlobal', (id, options) =>
  cy.get(testSelector(id), { withinSubject: null, ...options }),
)

Cypress.Commands.add('findByTest', { prevSubject: true }, (subject, id) =>
  cy.wrap(subject).find(testSelector(id)),
)

Cypress.Commands.add('clickByTest', (id) => {
  cy.getByTest(id).click()
})

Cypress.Commands.add('revenueCard', (name) =>
  cy
    .getByTest('revenue-card')
    .filter((_, el) => el.querySelector('[data-test="revenue-name"]')?.value === name)
    .should('have.length.at.least', 1)
    .first(),
)

Cypress.Commands.add('expenseRow', (name) =>
  cy
    .getByTest('expense-row')
    .filter((_, el) => el.querySelector('[data-test="expense-name"]')?.value === name)
    .should('have.length.at.least', 1)
    .first(),
)

Cypress.Commands.add('upsellRow', (name) =>
  cy
    .getByTest('upsell-row')
    .filter((_, el) => el.querySelector('[data-test="upsell-name"]')?.value === name)
    .should('have.length.at.least', 1)
    .first(),
)

Cypress.Commands.add('sheetRowByLabel', (label) =>
  cy.contains('[data-test="sheet-line-label"]', label).closest('tr').should('exist'),
)
