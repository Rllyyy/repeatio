/// <reference types="cypress" />

/* These e2e tests only cover tests related to the url. All other tests are handled by component tests  */

describe("Question", () => {
  it("should show question component with mode practice and order chronological when navigating from module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");

    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("exist");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should show question with mode practice and order random", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");

    cy.get("article[data-cy='Practice']").contains("button", "Random").click();
    cy.get(".question-id").should("exist");

    // Assert that the url correctly updated
    cy.url().should("include", "?mode=practice&order=random");
  });

  it("should redirect to mode practice and order chronological if both values are undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to mode practice if value is undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?order=random");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=random");
  });

  it("should redirect to order chronological if value is undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to mode practice if the value is not practice or bookmarked", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=incorrectValue&order=chronological");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to order chronological if the value is not practice or bookmarked", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice&order=incorrectValue");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });
});

export {};
