/// <reference types="cypress" />

describe("Test Home Component", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder
  before(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  //Navigate to home url and subscribe to console logs (use regex to catch them)
  beforeEach(() => {
    cy.visit("/");
  });

  /* ---------------------------- COMPONENT DISPLAYS ------------------------------ */
  //Test if it mounts correctly (could be integration test)
  it("should show heading when navigating to home", () => {
    cy.contains("h1", "Module Overview").should("be.visible");
  });

  //Test if the module 'Question Types' is always shown
  it("should always show the module 'Question Types'", () => {
    cy.contains("Question Types (types_1)").should("be.visible");
  });

  //Test module that is saved in the localStorage to be shown
  it("should show modules that are saved in the localStorage", () => {
    cy.addModuleFixtureToLocalStorage();

    cy.contains("Cypress Fixture Module").should("be.visible");
    cy.get("article[data-cy='module-cypress_1']").contains("a", "View").click();
    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("be.visible");
  });
});
