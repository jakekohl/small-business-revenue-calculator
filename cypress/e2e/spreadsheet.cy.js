describe('Editing from the 12-month spreadsheet', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('updates KPIs and the matching editor when a service price changes in the sheet', () => {
    cy.sheetRowByLabel('Signature service').within(() => {
      cy.fillNumber('sheet-price', 100)
    })

    cy.expectKpi('monthly-revenue', '$6,184')
    cy.expectKpiGreaterThan('monthly-profit', '$2,395')
    cy.expectSheetMonth('Signature service', 0, '$4,000')
    cy.revenueCard('Signature service').within(() => {
      cy.expectInputContains('revenue-price', '100')
    })
    cy.expectRevenuePreview('Signature service', '$4,300')
  })

  it('updates attach rate from the sheet qty column', () => {
    cy.sheetRowByLabel('Add-on treatment').within(() => {
      cy.fillNumber('sheet-qty', 50)
    })

    cy.expectSheetMonth('Add-on treatment', 0, '$500')
    cy.expectRevenuePreview('Signature service', '$3,900')
    cy.revenueCard('Signature service').within(() => {
      cy.upsellRow('Add-on treatment').within(() => {
        cy.expectInputContains('upsell-attach', '50')
      })
    })
  })

  it('updates an expense amount from the sheet', () => {
    cy.sheetRowByLabel('Studio rent').within(() => {
      cy.fillNumber('sheet-price', 2200)
    })

    cy.expectKpi('monthly-expenses', '$2,869')
    cy.expectSheetYear('Studio rent', '$26,400')
    cy.expenseRow('Studio rent').within(() => {
      cy.expectInputContains('expense-amount', '2,200')
    })
  })
})
