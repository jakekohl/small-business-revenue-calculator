describe('What’s new changelog', () => {
  beforeEach(() => {
    cy.visitApp()
  })

  it('opens a right-side drawer of shipped updates with GitHub links', () => {
    cy.getByTest('changelog-open').should('be.visible')
    cy.getByTestGlobal('changelog-drawer').should('not.exist')

    cy.openChangelog()
    cy.getByTest('changelog-open').should('not.be.visible')
    cy.getByTestGlobal('changelog-title').should('contain', 'What’s new')
    cy.getByTestGlobal('changelog-entry').should('have.length.at.least', 3)

    cy.changelogEntry('What’s new').within(() => {
      cy.getByTest('changelog-entry-type').should('contain', 'New')
      cy.getByTest('changelog-entry-title').should('contain', 'What’s new')
      cy.getByTest('changelog-entry-summary').should('contain', 'star on the right')
      cy.getByTest('changelog-entry-date').should('contain', '2026')
    })

    cy.changelogEntry('Expenses on their due month').within(() => {
      cy.getByTest('changelog-entry-type').should('contain', 'New')
      cy.getByTest('changelog-entry-link')
        .should('contain', 'GitHub')
        .and('have.attr', 'href', 'https://github.com/jakekohl/small-business-revenue-calculator/pull/4')
        .and('have.attr', 'target', '_blank')
    })

    cy.changelogEntry('Spreadsheet numbers stay in their columns').within(() => {
      cy.getByTest('changelog-entry-type').should('contain', 'Fix')
      cy.getByTest('changelog-entry-link').should(
        'have.attr',
        'href',
        'https://github.com/jakekohl/small-business-revenue-calculator/pull/3',
      )
    })

    cy.getByTestGlobal('changelog-github')
      .should('be.visible')
      .and('contain', 'GitHub')
      .and('have.attr', 'href')
      .and('include', 'github.com/jakekohl/small-business-revenue-calculator/pulls')

    cy.closeChangelog()
    cy.getByTest('changelog-open').should('be.visible')
  })
})
