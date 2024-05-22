/// <reference types="cypress" />

describe("NewsPage", () => {
  beforeEach(() => {
    cy.visit("/news");
  });

  it("should render the page basic ui", () => {
    cy.get("h1").contains("News").should("exist");
    cy.contains("The latests updates and improvements to repeatio").should("exist");
  });

  it("should fetch and render news", () => {
    cy.get("article").should("exist");
    cy.contains("h2", "repeatio - v0.5").should("exist");
  });

  it("should render the news in the correct order", () => {
    cy.get("article").first().contains("h2", "repeatio - v0.6").should("exist");
    cy.get("article").last().contains("h2", "repeatio - v0.1").should("exist");
  });
});
