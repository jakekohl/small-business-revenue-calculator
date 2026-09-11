Cypress.Commands.add('expectKpi', (name, value) => {
  cy.getByTest(`kpi-${name}`).within(() => {
    cy.getByTest('kpi-value').should('have.text', value)
  })
})

Cypress.Commands.add('expectKpiLabel', (name, label) => {
  cy.getByTest(`kpi-${name}`).findByTest('kpi-label').should('contain', label)
})

Cypress.Commands.add('expectSampleKpis', () => {
  cy.expectKpi('monthly-revenue', '$5,584')
  cy.expectKpi('monthly-expenses', '$2,469')
  cy.expectKpi('monthly-profit', '$2,395')
  cy.expectKpi('year-profit', '$28,740')
  cy.expectKpi('break-even', '26 units')
})

Cypress.Commands.add('expectBlankKpis', () => {
  cy.expectKpi('monthly-revenue', '$0')
  cy.expectKpi('monthly-expenses', '$0')
  cy.expectKpi('monthly-profit', '$0')
  cy.expectKpi('year-profit', '$0')
  cy.expectKpi('break-even', '—')
})

Cypress.Commands.add('expectSampleBanner', (visible = true) => {
  if (visible) {
    cy.getByTest('sample-banner')
      .should('be.visible')
      .and('contain', 'sample numbers')
  } else {
    cy.getByTest('sample-banner').should('not.exist')
  }
})

Cypress.Commands.add('expectToast', (summary, detail) => {
  cy.getByTestGlobal('toast-message').should('be.visible')
  cy.getByTestGlobal('toast-summary').should('contain', summary)
  if (detail) {
    cy.getByTestGlobal('toast-detail').should('contain', detail)
  }
})

Cypress.Commands.add('expectInputValue', (testId, value) => {
  cy.getByTest(testId).then(($el) => {
    const $input = $el.is('input') ? $el : $el.find('input')
    cy.wrap($input).should('have.value', value)
  })
})

Cypress.Commands.add('expectInputContains', (testId, value) => {
  cy.getByTest(testId).then(($el) => {
    const $input = $el.is('input') ? $el : $el.find('input')
    cy.wrap($input).should('contain.value', value)
  })
})

Cypress.Commands.add('expectSheetMonthGreaterThan', (label, monthIndex, amount) => {
  cy.sheetRowByLabel(label)
    .find(`[data-test="sheet-month-${monthIndex}"]`)
    .invoke('text')
    .should((text) => {
      expect(parseMoney(text), `${label} month ${monthIndex}`).to.be.greaterThan(amount)
    })
})

Cypress.Commands.add('expectSheetYear', (label, money) => {
  cy.sheetRowByLabel(label).find('[data-test="sheet-year"]').should('have.text', money)
})

Cypress.Commands.add('expectNoSheetLine', (label) => {
  cy.contains('[data-test="sheet-line-label"]', label).should('not.exist')
})

Cypress.Commands.add('expectSheetMonth', (label, monthIndex, money) => {
  cy.sheetRowByLabel(label)
    .find(`[data-test="sheet-month-${monthIndex}"]`)
    .should('have.text', money)
})

Cypress.Commands.add('expectRevenuePreview', (name, money) => {
  cy.revenueCard(name).findByTest('revenue-preview').should('have.text', `${money}/mo`)
})

Cypress.Commands.add('expectRevenueCount', (count) => {
  if (count === 0) {
    cy.getByTest('revenue-empty').should('be.visible')
    cy.getByTest('revenue-card').should('not.exist')
  } else {
    cy.getByTest('revenue-card').should('have.length', count)
  }
})

Cypress.Commands.add('expectExpenseCount', (count) => {
  if (count === 0) {
    cy.getByTest('expense-empty').should('be.visible')
    cy.getByTest('expense-row').should('not.exist')
  } else {
    cy.getByTest('expense-row').should('have.length', count)
  }
})

function parseMoney(text) {
  return Number(String(text).replace(/[^0-9.-]/g, ''))
}

Cypress.Commands.add('expectKpiGreaterThan', (name, otherValue) => {
  cy.getByTest(`kpi-${name}`)
    .findByTest('kpi-value')
    .invoke('text')
    .should((text) => {
      expect(parseMoney(text), `${name} KPI`).to.be.greaterThan(parseMoney(otherValue))
    })
})

Cypress.Commands.add('expectStoredProjection', (assertFn) => {
  cy.window().should((win) => {
    const raw = win.localStorage.getItem('inc-exp-calc-projection')
    expect(raw, 'saved projection').to.be.a('string')
    assertFn(JSON.parse(raw), expect)
  })
})
