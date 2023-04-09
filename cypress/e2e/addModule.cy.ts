/// <reference types="cypress" />
import { version } from "../../package.json";
import { parseJSON } from "../../src/utils/parseJSON";

import { IModule } from "../../src/components/module/module";

/* This file contains e2e tests for the AddModule component which itself contains of the ImportModule and CreateModule component .
All lot more component tests can be found in und src/components/Home/...
*/

/* ------------------------------------ ADDMODULE COMPONENT ----------------------------------- */
describe("Test the addModule component", () => {
  //Navigate to home url, subscribe to console logs (use regex to catch them) and click on "Add Module"
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Add Module").click();
  });

  //! Might be duplicate of Home.cy.tsx
  //Test if display Import or Create a Module modal on Add Module click
  it("should display 'Import or create Module' Modal when clicking on 'Add Module'", () => {
    cy.contains("h1", "Create or import a Module").should("be.visible");
  });
});

/* ------------------------------------ IMPORTING A MODULE ------------------------------------ */
//Some of these tests also exist as component tests
describe("Test importing a new module", () => {
  //Navigate to home url, subscribe to console logs (use regex to catch them) and click on "Add Module"
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "warn").as("consoleWarn");
        cy.stub(win.console, "info").as("consoleInfo");
      },
    });
    cy.contains("Add Module").click();
    cy.contains("span", "Import Module").click();
  });

  //Check addition to localStorage
  it("should add new module to localStorage when importing a module and close the modal", () => {
    //Send file to upload area
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Wait for the file to be added
    cy.get("ul.accepted-files").find("li").should("have.length", 1);

    //Click on add
    cy.get("form.import-module")
      .contains("button", "Import")
      .click({ force: true })
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        //Check item with chai
        assert.isObject(localStorageItem);
        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.name).to.equal("Cypress Fixture Module");
        expect(localStorageItem?.type).to.equal("module");
        expect(localStorageItem?.lang).to.equal("en");
        expect(localStorageItem?.compatibility).to.equal("0.5.0");
        expect(localStorageItem?.questions).to.have.length(6);
      });

    //Should close modal
    cy.contains("h1", "Create or import a Module").should("not.exist");
    cy.get(".ReactModalPortal").should("not.exist");
  });

  //Test if the toast for successful imports works
  it("should show success toast after importing module and navigate to new module", () => {
    //Send file to upload area
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Wait for the file to be added
    cy.get("ul.accepted-files").find("li").should("have.length", 1);

    cy.get("form.import-module").contains("button", "Import").click({ force: true });

    //Regex match consoleError (brackets include current time so that needs to be escaped)
    cy.get("@consoleLog").should("be.calledWithMatch", /\[.*\] Imported cypress_1.*/);

    //Click on link inside toast
    cy.get(".Toastify").find("a").click();

    //Check url and heading
    cy.url().should("include", "cypress_1");
    cy.contains("h1", "Cypress Fixture Module").should("be.visible");
  });
});

/* ------------------------------------ CREATING A MODULE ------------------------------------- */
describe("Test creating a new module", () => {
  //Navigate to home url, subscribe to console logs (use regex to catch them) and click on "Add Module"
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "warn").as("consoleWarn");
        cy.stub(win.console, "info").as("consoleInfo");
      },
    });
    cy.contains("Add Module").click();
    cy.contains("Create Module").click();
  });

  //Test creating a new module
  it("should add module and show toast when creating a module", () => {
    //Fill in form and click create button
    //id
    cy.get("input#create-module-id-input").type("test_cy_1").should("have.value", "test_cy_1");
    //name
    cy.get("input#create-module-name-input")
      .type("Module created with cypress", { delay: 2 })
      .should("have.value", "Module created with cypress");
    //language
    cy.get("select#create-module-language-select").select("English").should("have.value", "en");
    cy.get("select#create-module-language-select").find("option:selected").should("have.text", "English");
    //compatibility
    cy.get("input#create-module-compatibility-input").should("be.disabled").and("have.value", version);

    cy.get("form.create-module").contains("button", "Create").click();

    //Navigate to newly created module by toast
    cy.get(".Toastify__toast").contains("a", "test_cy_1").click({ force: true });
    cy.contains("h1", "Module created with cypress");
  });
});
