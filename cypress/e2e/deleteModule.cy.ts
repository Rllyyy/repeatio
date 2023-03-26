/// <reference types="cypress" />

describe("Test deletion of module", () => {
  //Go to home and spy on console before each hook
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "warn").as("consoleWarn");
        cy.stub(win.console, "info").as("consoleInfo");
      },
    });
  });

  //TODO delete this
  it("should delete module that is located in localStorage", () => {
    //Add item to localStorage and check existence
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.contains("Cypress Fixture Module (cypress_1)").should("exist");

    //Click delete module button
    cy.get("article[data-cy='module-cypress_1']").find("button.popover-button").click();
    cy.get("ul.MuiList-root")
      .contains("Delete")
      .click()
      .should(() => {
        //Delete from localStorage
        expect(localStorage.getItem("repeatio-module-cypress_1")).to.be.null;
      });

    //Toast and console.log
    cy.get(".Toastify").contains("Deleted module cypress_1!");
    cy.get("@consoleLog").should("be.calledWithMatch", /\[.*\] Deleted module cypress_1\!/);

    //Module should no longer exist/be visible in list of modules
    cy.contains("Cypress Fixture Module (cypress_1)").should("not.exist");
  });

  it("should toast error if to be deleted file can't be found in localStorage ", () => {
    //Add fixture to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Click on dots
    cy.get(`article[data-cy='module-cypress_1']`).find("button.popover-button").click();

    //remove item from localStorage so it can't be found to simulate not existing file
    cy.clearLocalStorage("repeatio-module-cypress_1");

    //Click on export
    cy.get(".MuiList-root").contains("Delete").click({ force: true });

    //Expect toast to show up
    cy.get(".Toastify").contains("Couldn't find the file repeatio-module-cypress_1 in the localStorage!");
    cy.get("@consoleError").should(
      "be.calledWithMatch",
      /\[.*\] Couldn't find the file repeatio\-module\-cypress_1 in the localStorage\!/
    );
  });
});

export {};
