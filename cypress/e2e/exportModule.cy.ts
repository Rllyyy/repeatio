/// <reference types="cypress" />
import path from "path";

describe("Test related to exporting a file from the localStorage", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder before each test
  before(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  //Go to home and spy on console
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

  //Test Popover to be visible
  it("should show the Popover component when clicking on the popover button (3 vertical dots)", () => {
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.get(".MuiPaper-root").should("be.visible");
  });

  //Test download of public folder file (cypress saves it to cypress/downloads)
  it("should download 'Question Types' file and show toast", () => {
    //Click export module button
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.contains("Export").click();

    //Expect toast to show up
    cy.get(".Toastify").contains(`Downloaded module as "repeatio-module-types_1.json"`);
    cy.get("@consoleInfo").should("be.calledWithMatch", /\[.*\] Downloaded module as "repeatio-module-types_1.json"/);

    //Read file
    const downloadedFilename = path.join(downloadsFolder, "repeatio-module-types_1.json");
    //There are multiple ways to test a json file for content
    cy.readFile(downloadedFilename).its("id").should("eq", "types_1");

    cy.readFile(downloadedFilename).then((module) => {
      expect(module.name).to.equal("Question Types");
    });

    cy.readFile(downloadedFilename).its("questions").should("have.length", 6);
  });

  //Test download of localStorage Item
  it("should download module from the localStorage and show toast", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Click export button
    cy.get(`article[data-cy='module-cypress_1']`).find("button.popover-button").click();
    cy.contains("Export").click();

    //Expect toast to show up
    cy.get(".Toastify").contains(`Downloaded module as "repeatio-module-cypress_1.json"`);
    cy.get("@consoleInfo").should(
      "be.calledWithMatch",
      /\[.*\] Downloaded module as "repeatio\-module\-cypress_1.json"/
    );

    //Read file and check name and question length
    const downloadedFilename = path.join(downloadsFolder, `repeatio-module-cypress_1.json`);
    cy.readFile(downloadedFilename).then((module) => {
      expect(module.name).to.equal("Cypress Fixture Module");
    });
    cy.readFile(downloadedFilename).its("questions").should("have.length", 6);
  });

  it("should toast error if file can't be found in localStorage ", () => {
    //Add fixture to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Click on dots
    cy.get(`article[data-cy='module-cypress_1']`).find("button.popover-button").click();

    //remove item from localStorage so it can't be found to simulate not existing file
    cy.clearLocalStorage("repeatio-module-cypress_1");

    //Click on export
    cy.get(".MuiList-root").contains("Export").click({ force: true });

    //Expect toast to show up
    cy.get(".Toastify").contains("Couldn't find the file repeatio-module-cypress_1 in the localStorage!");
    cy.get("@consoleError").should(
      "be.calledWithMatch",
      /\[.*\] Couldn't find the file repeatio\-module\-cypress_1 in the localStorage\!/
    );
  });
});
