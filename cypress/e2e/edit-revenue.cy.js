describe('Editing revenue opportunities', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('updates preview, KPIs, and the sheet when price and units change', () => {
    cy.revenueCard('Signature service').within(() => {
      cy.getByTest('revenue-name').should('have.value', 'Signature service')
      cy.fillText('revenue-name', 'Signature glow-up')
      cy.fillNumber('revenue-price', 100)
      cy.fillNumber('revenue-units', 50)
      cy.fillNumber('revenue-cost', 10)
    })

    cy.expectRevenuePreview('Signature glow-up', '$5,375')
    cy.expectKpi('monthly-revenue', '$7,259')
    cy.expectKpiGreaterThan('monthly-profit', '$2,395')
    cy.expectSheetYear('Signature glow-up', '$60,000')
    cy.expectNoSheetLine('Signature service')
  })

  it('keeps the service when delete is cancelled', () => {
    cy.revenueCard('Premium package').findByTest('revenue-delete').click()
    cy.confirmReject('Remove this service?')
    cy.expectRevenueCount(2)
    cy.revenueCard('Premium package').should('be.visible')
    cy.expectKpi('monthly-revenue', '$5,584')
  })

  it('removes a service after confirm and recalculates KPIs', () => {
    cy.revenueCard('Premium package').findByTest('revenue-delete').click()
    cy.getByTest('confirm-message').should('contain', 'Premium package')
    cy.confirmAccept('Remove this service?')
    cy.expectRevenueCount(1)
    cy.getByTest('revenue-card').should('not.contain', 'Premium package')
    cy.expectKpi('monthly-revenue', '$3,700')
    cy.expectSheetYear('Signature service', '$40,800')
    cy.expectNoSheetLine('Premium package')
    cy.expectNoSheetLine('Express add-on')
  })

  it('mutes a disabled service and drops it from the totals', () => {
    cy.revenueCard('Signature service').within(() => {
      cy.toggleByTest('revenue-enabled')
    })
    cy.revenueCard('Signature service').should('have.class', 'opportunity--off')
    cy.expectKpi('monthly-revenue', '$1,884')
    cy.expectSheetMonth('Signature service', 0, '$0')
    cy.sheetRowByLabel('Signature service').should('have.class', 'sheet-muted')
  })
})
