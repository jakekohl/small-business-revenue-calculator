describe('Exporting and importing a backup', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('downloads a JSON backup of the current plan', () => {
    cy.exportProjection()
    cy.readFile('cypress/downloads/business-projection.json').then((data) => {
      expect(data.settings.isSampleData).to.equal(true)
      expect(data.revenues).to.have.length(2)
      expect(data.revenues.map((item) => item.name)).to.include.members([
        'Signature service',
        'Premium package',
      ])
      expect(data.expenses).to.have.length(5)
      expect(data.expenses[0].name).to.equal('Studio rent')
      expect(data.settings.growthRatePct).to.equal(0)
    })
  })

  it('imports a backup after confirm and replaces the current numbers', () => {
    cy.importFile('projection.json')
    cy.getByTest('confirm-message').should('contain', 'current numbers will be replaced')
    cy.confirmAccept('Import this file?')
    cy.expectToast('Projection imported')
    cy.expectSampleBanner(false)
    cy.expectRevenueCount(1)
    cy.expectExpenseCount(1)
    cy.revenueCard('Imported lawn care').should('be.visible')
    cy.expenseRow('Imported van lease').should('be.visible')
    cy.expectKpi('monthly-revenue', '$2,000')
    cy.expectKpi('monthly-expenses', '$500')
    cy.expectKpi('monthly-profit', '$1,100')
    cy.expectSheetYear('Imported lawn care', '$24,000')
  })

  it('keeps the current plan when import is cancelled', () => {
    cy.importFile('projection.json')
    cy.confirmReject('Import this file?')
    cy.expectSampleBanner(true)
    cy.expectRevenueCount(2)
    cy.expectKpi('monthly-revenue', '$5,584')
    cy.getByTest('revenue-card').should('not.contain', 'Imported lawn care')
  })

  it('shows an error toast for a file that is not JSON', () => {
    cy.importFile('invalid.json')
    cy.getByTestGlobal('confirm-dialog').should('not.exist')
    cy.expectToast('Could not read that file', 'JSON backup')
    cy.expectSampleKpis()
  })
})
