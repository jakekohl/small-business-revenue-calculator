describe('Saving and restoring a plan', () => {
  it('keeps edits after a reload', () => {
    cy.visitApp()
    cy.revenueCard('Signature service').within(() => {
      cy.fillText('revenue-name', 'Color and cut')
      cy.fillNumber('revenue-price', 95)
    })
    cy.expectStoredProjection((data) => {
      expect(data.revenues[0].name).to.equal('Color and cut')
      expect(data.revenues[0].unitPrice).to.equal(95)
    })

    cy.reloadApp()
    cy.revenueCard('Color and cut').should('be.visible')
    cy.expectRevenuePreview('Color and cut', '$4,100')
    cy.expectKpi('monthly-revenue', '$5,984')
    cy.expectSampleBanner(true)
  })

  it('restores sample numbers from a blank plan', () => {
    cy.visitApp()
    cy.startBlankPlan()
    cy.expectBlankKpis()
    cy.expectSampleBanner(false)

    cy.loadSamplePlan()
    cy.expectToast('Sample plan loaded')
    cy.expectSampleBanner(true)
    cy.expectSampleKpis()
    cy.expectRevenueCount(2)
    cy.expectExpenseCount(6)
    cy.revenueCard('Signature service').should('be.visible')
    cy.getByTest('hero-blank-plan').should('be.visible')
  })
})
