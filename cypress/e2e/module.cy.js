/// <reference types="cypress" />

describe("module Page", () => {
  it("should show default module if navigating from home", () => {
    cy.visit("/");
    cy.get("article[data-cy='module-types_1']").contains("View").click();
    cy.contains("h1", "Question Types (types_1)").should("exist");
  });

  it("should show module from localStorage if navigating from home", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/");
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();
    cy.contains("h1", "Cypress Fixture Module (cypress_1)").should("exist");
  });

  it("should show module if navigating via url to module", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/cypress_1");
    cy.contains("h1", "Cypress Fixture Module (cypress_1)").should("exist");
  });

  it("should show module if refreshing module page", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/cypress_1");
    cy.reload();
    cy.contains("h1", "Cypress Fixture Module (cypress_1)").should("exist");
  });
});

describe("404 Page if module isn't found", () => {
  it("should render 404 page if module isn't found", () => {
    cy.visit("/module/invalid");
    cy.contains("h1", "404").should("exist");
  });

  it("should go back home when clicking 'Home' if module isn't found", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/invalid");
    cy.contains("a", "Home").click();
    cy.contains("Module Overview").should("exist");
  });

  it("should not show ", { browser: "!firefox" }, () => {
    cy.visit("/module/invalid");
    cy.get(".user-modules").should("not.be.visible");
  });

  it("should go back in history when clicking on 'Previous url' if module isn't found", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/cypress_1");
    cy.visit("/module/invalid");
    cy.contains("button", "Previous URL").click();
    cy.url().should("include", "cypress_1");
    cy.contains("Cypress Fixture Module (cypress_1)").should("exist");
  });

  it("should render list of existing modules from localStorage", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/invalid");
    cy.contains("cypress_1").should("exist");
  });

  it("should visit existing module", () => {
    cy.addModuleFixtureToLocalStorage();
    cy.visit("/module/invalid");
    cy.contains("a", "cypress_1").click();
    cy.url().should("include", "cypress_1");
    cy.contains("Cypress Fixture Module (cypress_1)").should("exist");
  });
});
