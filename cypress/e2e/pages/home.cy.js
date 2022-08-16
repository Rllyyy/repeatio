/// <reference types="cypress" />
import path from "path";
import { version } from "../../../package.json";

describe("Test Home Component", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder
  before(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  //Navigate to home url
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

  //Test module that is saved in the localStorage
  it("should show modules that are saved in the localStorage", () => {
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent));
    });

    cy.contains("Cypress Fixture Module").should("be.visible");
    cy.get("article[data-cy='module-cypress_1']").contains("a", "View").click();
    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("be.visible");
  });

  /* ------------------------------------- ADD MODULE --------------------------------- */
  //Test if display Import or Create a Module modal on Add Module click
  it("should display 'Import or create Module' Modal when clicking on 'Add Module'", () => {
    cy.contains("Add Module").click();
    cy.contains("h1", "Import or Create a Module").should("be.visible");
  });

  //Test creating a new module
  it("should add module when creating a module", () => {
    cy.contains("Add Module").click();
    //Fill in form and click create button
    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.get("input#create-module-compatibility-input").should("be.disabled").and("have.value", version);
    cy.get("form.create-module").contains("button", "Create").click();
    //Navigate to newly created module
    cy.get("article[data-cy='module-test_cy_1']").contains("View").click();
    cy.contains("h1", "Module created with cypress");
  });

  //Test if importing a new module works
  it("should add module when importing a module", () => {
    cy.contains("Add Module").click();

    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: "repeatio-module-cypress_1.json",
      });
    });

    cy.get("form.import-module").contains("button", "Add").click();
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();
    cy.contains("h1", "Cypress Fixture Module");
    cy.get("article[data-cy='Question Overview'").contains("a", "View").click();

    cy.get(".question-table").find(".question").should("have.length", 6);
  });

  /* -------------------------------------- EXPORT MODULE -----------------------------------*/
  //Test Popover to be visible
  it("should show the Popover component when clicking on the popover button (3 vertical dots)", () => {
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.get(".MuiPaper-root").should("be.visible");
  });

  //Test download of public folder file (cypress saves it to cypress/downloads)
  it("should download 'Question Types' file", { browser: "!firefox" }, () => {
    //Click export module button
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.contains("Export").click();

    const downloadedFilename = path.join(downloadsFolder, "repeatio-module-types_1.json");
    //There are multiple ways to test a json file for content
    cy.readFile(downloadedFilename).its("id").should("eq", "types_1");

    cy.readFile(downloadedFilename).then((module) => {
      expect(module.name).to.equal("Question Types");
    });

    cy.readFile(downloadedFilename).its("questions").should("have.length", 6);
  });

  //Test download of localStorage Item
  it("should download module from the localStorage", { browser: "!firefox" }, () => {
    const moduleID = "cypress_1";
    //Add item to localStorage
    cy.fixture(`repeatio-module-${moduleID}.json`).then((fileContent) => {
      localStorage.setItem(`repeatio-module-${moduleID}`, JSON.stringify(fileContent));
    });

    //Click export button
    cy.get(`article[data-cy='module-${moduleID}']`).find("button.popover-button").click();
    cy.contains("Export").click();

    //Read file and check name and question length
    const downloadedFilename = path.join(downloadsFolder, `repeatio-module-${moduleID}.json`);
    cy.readFile(downloadedFilename).then((module) => {
      expect(module.name).to.equal("Cypress Fixture Module");
    });
    cy.readFile(downloadedFilename).its("questions").should("have.length", 6);
  });
});

/* //TODO:
- If id already in localStorage
- Prevent user from adding types_1
*/
