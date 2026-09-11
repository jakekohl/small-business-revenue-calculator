describe('Monthly growth rate', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('keeps month one the same and grows later months and year profit', () => {
    cy.expectKpi('monthly-revenue', '$5,584')
    cy.expectKpi('year-profit', '$27,540')
    cy.expectSheetMonth('Total revenue', 0, '$5,584')
    cy.expectSheetMonth('Total revenue', 11, '$5,584')
    cy.expectSheetYear('Net profit', '$27,540')

    cy.fillNumber('hero-growth', 10)

    cy.expectKpi('monthly-revenue', '$5,584')
    cy.expectKpiGreaterThan('year-profit', '$27,540')
    cy.expectSheetMonth('Total revenue', 0, '$5,584')
    cy.expectSheetMonth('Signature service', 0, '$3,400')
    cy.expectSheetMonthGreaterThan('Total revenue', 1, 5584)
    cy.expectStoredProjection((data) => {
      expect(data.settings.growthRatePct).to.equal(10)
    })
  })
})
