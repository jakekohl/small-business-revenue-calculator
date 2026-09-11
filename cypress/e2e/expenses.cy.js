describe('Managing monthly expenses', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('edits an amount and category and updates expenses and profit', () => {
    cy.expenseRow('Studio rent').within(() => {
      cy.fillNumber('expense-amount', 2000)
      cy.selectCategory('Payroll')
    })

    cy.expectKpi('monthly-expenses', '$2,669')
    cy.expectKpi('monthly-profit', '$2,195')
    cy.expectSheetMonth('Studio rent', 0, '$2,000')
    cy.expectSheetYear('Studio rent', '$24,000')
    cy.expenseRow('Studio rent').findByTest('expense-category').should('contain', 'Payroll')
  })

  it('toggles an expense off and removes it from monthly totals', () => {
    cy.expenseRow('Marketing').within(() => {
      cy.toggleByTest('expense-enabled')
    })
    cy.expenseRow('Marketing').should('have.class', 'expense--off')
    cy.expectKpi('monthly-expenses', '$2,269')
    cy.expectSheetMonth('Marketing', 0, '$0')
    cy.sheetRowByLabel('Marketing').should('have.class', 'sheet-muted')
  })

  it('cancels delete and then removes an expense after confirm', () => {
    cy.expenseRow('Insurance').findByTest('expense-delete').click()
    cy.confirmReject('Remove this expense?')
    cy.expectExpenseCount(5)

    cy.expenseRow('Insurance').findByTest('expense-delete').click()
    cy.getByTest('confirm-message').should('contain', 'Insurance')
    cy.confirmAccept('Remove this expense?')
    cy.expectExpenseCount(4)
    cy.getByTest('expense-row').should('not.contain', 'Insurance')
    cy.expectKpi('monthly-expenses', '$2,329')
    cy.expectNoSheetLine('Insurance')
  })

  it('shows the expense mix empty state after the last expense is removed', () => {
    cy.startBlankPlan()
    cy.clickByTest('expense-add')
    cy.expenseRow('New expense').within(() => {
      cy.fillText('expense-name', 'Wifi')
      cy.fillNumber('expense-amount', 80)
    })
    cy.getByTest('chart-expense-mix-canvas').should('be.visible')
    cy.expectKpi('monthly-expenses', '$80')

    cy.expenseRow('Wifi').findByTest('expense-delete').click()
    cy.confirmAccept('Remove this expense?')
    cy.expectExpenseCount(0)
    cy.getByTest('chart-expense-mix-empty').should('be.visible')
    cy.expectKpi('monthly-expenses', '$0')
  })
})
