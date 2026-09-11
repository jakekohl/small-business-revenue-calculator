describe('Scheduling infrequent expenses', () => {
  it('keeps sample year-end taxes in month 12 without averaging into this month', () => {
    cy.visitApp()

    cy.expenseRow('Year-end taxes').within(() => {
      cy.getByTest('expense-frequency').should('contain', 'Once a year')
      cy.getByTest('expense-due-month').should('contain', 'Month 12')
    })
    cy.expenseRow('Studio rent').within(() => {
      cy.getByTest('expense-frequency').should('contain', 'Monthly')
      cy.getByTest('expense-due-month').should('not.exist')
    })

    cy.expectKpi('monthly-expenses', '$2,469')
    cy.expectKpi('year-profit', '$27,540')
    cy.expectSheetMonth('Year-end taxes', 0, '$0')
    cy.expectSheetMonth('Year-end taxes', 11, '$1,200')
    cy.expectSheetYear('Year-end taxes', '$1,200')
    cy.expectSheetYear('Total expenses', '$30,828')
  })

  it('charges a quarterly expense only on its due months', () => {
    cy.visitApp()
    cy.startBlankPlan()
    cy.clickByTest('expense-add')
    cy.expenseRow('New expense').within(() => {
      cy.fillText('expense-name', 'Quarterly estimated tax')
      cy.fillNumber('expense-amount', 300)
      cy.selectFrequency('Every 3 months')
      cy.selectDueMonth('Month 2')
    })

    cy.expectKpi('monthly-expenses', '$0')
    cy.expectSheetMonth('Quarterly estimated tax', 0, '$0')
    cy.expectSheetMonth('Quarterly estimated tax', 1, '$300')
    cy.expectSheetMonth('Quarterly estimated tax', 2, '$0')
    cy.expectSheetMonth('Quarterly estimated tax', 4, '$300')
    cy.expectSheetMonth('Quarterly estimated tax', 7, '$300')
    cy.expectSheetMonth('Quarterly estimated tax', 10, '$300')
    cy.expectSheetYear('Quarterly estimated tax', '$1,200')
  })

  it('charges a one-time fee in a single month and exports that cadence', () => {
    cy.visitApp()
    cy.startBlankPlan()
    cy.clickByTest('expense-add')
    cy.expenseRow('New expense').within(() => {
      cy.fillText('expense-name', 'Filing fee')
      cy.fillNumber('expense-amount', 500)
      cy.selectFrequency('One-time')
      cy.selectDueMonth('Month 4')
    })

    cy.expectSheetMonth('Filing fee', 0, '$0')
    cy.expectSheetMonth('Filing fee', 3, '$500')
    cy.expectSheetMonth('Filing fee', 11, '$0')
    cy.expectSheetYear('Filing fee', '$500')
    cy.expectStoredProjection((data) => {
      expect(data.expenses[0].frequency).to.equal('once')
      expect(data.expenses[0].startMonth).to.equal(3)
    })

    cy.exportProjection()
    cy.readFile('cypress/downloads/business-projection.json').then((data) => {
      expect(data.expenses[0].name).to.equal('Filing fee')
      expect(data.expenses[0].frequency).to.equal('once')
      expect(data.expenses[0].startMonth).to.equal(3)
    })
  })
})
