// cypress/e2e/marketplace-workflow.cy.ts

describe('Marketplace Workflow', () => {
  it('should allow a company to create a listing, a doctor to apply, and the company to accept the application', () => {
    // Company creates a listing
    cy.visit('/listings/new');
    cy.get('input[name="title"]').type('Test Listing');
    cy.get('textarea[name="description"]').type('This is a test listing.');
    cy.get('input[name="specialtyRequired"]').type('Cardiology');
    cy.get('input[name="hoursPerWeek"]').type('20');
    cy.get('input[name="location"]').type('New York, NY');
    cy.get('input[name="remuneration"]').type('100');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/listings');

    // Doctor applies for the listing
    cy.visit('/marketplace/listings');
    cy.contains('Test Listing').click();
    cy.get('button').contains('Apply Now').click();
    cy.get('textarea[name="coverLetter"]').type('I am a great doctor.');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/marketplace/applications');

    // Company accepts the application
    cy.visit('/listings');
    cy.contains('Test Listing').parent().contains('View Applicants').click();
    cy.contains('Dr. John Doe').parent().contains('Accept').click();
    cy.contains('Application accepted').should('be.visible');
  });
});
