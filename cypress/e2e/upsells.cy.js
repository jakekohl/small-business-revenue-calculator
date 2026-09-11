describe('Managing upsells', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('changes attach rate and price and reflects them in preview and sheet', () => {
    cy.revenueCard('Signature service').within(() => {
      cy.upsellRow('Add-on treatment').should('be.visible')
      cy.upsellRow('Add-on treatment').within(() => {
        cy.fillNumber('upsell-price', 40)
        cy.fillNumber('upsell-attach', 50)
      })
    })

    cy.expectRevenuePreview('Signature service', '$4,200')
    cy.expectKpi('monthly-revenue', '$6,084')
    cy.expectSheetMonth('Add-on treatment', 0, '$800')
    cy.expectSheetYear('Add-on treatment', '$9,600')
  })

  it('adds a new upsell to a service', () => {
    cy.revenueCard('Premium package').within(() => {
      cy.getByTest('upsell-row').should('have.length', 1)
      cy.clickByTest('upsell-add')
      cy.getByTest('upsell-row').should('have.length', 2)
    })

    cy.revenueCard('Premium package').within(() => {
      cy.getByTest('upsell-row').eq(1).within(() => {
        cy.fillText('upsell-name', 'Gift wrap')
        cy.fillNumber('upsell-price', 10)
        cy.fillNumber('upsell-attach', 100)
      })
    })

    cy.expectRevenuePreview('Premium package', '$2,004')
    cy.sheetRowByLabel('Gift wrap').findByTest('sheet-upsell-tag').should('be.visible')
    cy.expectSheetMonth('Gift wrap', 0, '$120')
  })

  it('removes an upsell without a confirm step', () => {
    cy.revenueCard('Signature service').within(() => {
      cy.upsellRow('Add-on treatment').findByTest('upsell-remove').click()
      cy.getByTest('upsell-row').should('not.exist')
    })

    cy.expectRevenuePreview('Signature service', '$3,400')
    cy.expectKpi('monthly-revenue', '$5,284')
    cy.expectNoSheetLine('Add-on treatment')
  })
})
