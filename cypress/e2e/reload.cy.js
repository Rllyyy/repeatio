/// <reference types="cypress" />

describe("Refresh", () => {
  //Navigate to home url
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the same content at home after reload", () => {
    cy.contains("h1", "Module Overview").should("be.visible");
    cy.contains("Question Types").should("be.visible");
    cy.contains("Add Module").should("be.visible");
    cy.reload();
    cy.contains("h1", "Module Overview").should("be.visible");
    cy.contains("Question Types").should("be.visible");
    cy.contains("Add Module").should("be.visible");
  });

  it("should display the same content after reload in example Module", () => {
    cy.get("article[data-cy='module-types_1']").contains("a", "View").click();
    cy.contains("h1", "Question Types").should("be.visible");
    cy.reload();
    cy.contains("h1", "Question Types").should("be.visible");

    //Also test the same for a question
    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("qID-1");
    cy.reload();
    cy.contains("qID-1");
  });

  it("should display same content after reload in a module from localStorage", () => {
    //Add the module from the fixtures folder
    cy.contains("Add Module").click();
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: "repeatio-module-cypress_1.json",
      });
    });
    cy.get("form.import-module").contains("button", "Add").click();

    //Navigate to practice in added component and reload
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();

    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("qID-1").should("be.visible");
    cy.reload();
    cy.contains("qID-1").should("be.visible");
  });
});
