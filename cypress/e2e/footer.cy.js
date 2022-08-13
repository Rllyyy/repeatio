describe("Footer component", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  /* NAVIGATION */
  it("should navigate to home page when clicking on Home in the footer", () => {
    cy.visit("/settings");

    cy.get("footer").contains("Home").click();
    cy.contains("h1", "Module Overview");
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("should navigate to tutorials page when clicking on tutorials in the footer", () => {
    cy.get("footer").contains("Tutorials").click();
    cy.contains("h1", "Tutorials");
    cy.url().should("eq", "http://localhost:3000/tutorials");
  });

  it("should navigate to contribute page when clicking on contribute in the footer", () => {
    cy.get("footer").contains("Contribute").click();
    cy.contains("h1", "Contribute");
    cy.url().should("eq", "http://localhost:3000/contribute");
  });

  it("should navigate to special thanks page when clicking on special thanks in the footer", () => {
    cy.get("footer").contains("Special Thanks").click();
    cy.contains("h1", "Thanks");
    cy.url().should("eq", "http://localhost:3000/thanks");
  });

  it("should navigate to news page when clicking on news in the footer", () => {
    cy.get("footer").contains("News").click();
    cy.contains("h1", "News");
    cy.url().should("eq", "http://localhost:3000/news");
  });

  it("should navigate to settings page when clicking on settings in the footer", () => {
    cy.get("footer").contains("Settings").click();
    cy.contains("h1", "Settings");
    cy.url().should("eq", "http://localhost:3000/settings");
  });

  /* LEGAL */
  it("should navigate to legal-notice (Impressum) page when clicking on Impressum in the footer", () => {
    cy.get("footer").contains("Impressum").click();
    cy.contains("h1", "Impressum");
    cy.url().should("eq", "http://localhost:3000/legal-notice");
  });

  it("should navigate to privacy (Datenschutz) page when clicking on Datenschutz in the footer", () => {
    cy.get("footer").contains("Datenschutz").click();
    cy.contains("h1", "Datenschutz");
    cy.url().should("eq", "http://localhost:3000/privacy");
  });
});
