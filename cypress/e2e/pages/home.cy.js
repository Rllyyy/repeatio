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
  /*  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "error").as("consoleError");
      },
    });
  });
 */
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
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
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

  //CREATING A MODULE
  //Test creating a new module
  it("should add module and show toast when creating a module", () => {
    cy.contains("Add Module").click();
    //Fill in form and click create button
    cy.get("input#create-module-id-input").type("test_cy_1").should("have.value", "test_cy_1");
    cy.get("input#create-module-name-input")
      .type("Module created with cypress")
      .should("have.value", "Module created with cypress");
    cy.get("input#create-module-compatibility-input").should("be.disabled").and("have.value", version);
    cy.get("form.create-module").contains("button", "Create").click();
    //Navigate to newly created module by toast
    cy.get(".Toastify__toast").contains("a", "test_cy_1").click({ force: true });
    cy.contains("h1", "Module created with cypress");
  });

  it("should not submit form when pressing enter inside input", () => {
    cy.contains("Add Module").click();
    cy.get("input#create-module-id-input").type("{enter}");
    cy.get("input#create-module-name-input").type("{enter}");
    cy.get(".create-module-errors").should("not.exist");
  });

  it("should show no errors when rendering initially", () => {
    cy.contains("Add Module").click();
    //Should not initially show errors
    cy.get(".create-module-errors").should("not.exist");

    //Should not show errors after input typing
    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get(".create-module-errors").should("not.exist");

    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.get(".create-module-errors").should("not.exist");
  });

  it("should show errors if trying to submit without filling out required fields", () => {
    cy.contains("Add Module").click();
    cy.contains("button", "Create").click();

    cy.contains("li", "Please provide an ID for the module.");
    cy.contains("li", "Please provide a name for the module.");
  });

  it("should show error if id of module is missing on submit and clear error if changing", () => {
    cy.contains("Add Module").click();

    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("button", "Create").click();

    //Expect error message
    cy.contains("li", "Please provide an ID for the module.");

    //Expect class invalid
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Expect error message to disappear after typing
    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.contains("li", "Please provide an ID for the module.").should("not.exist");
    cy.get(".create-module-errors").should("not.exist");
    cy.get("input#create-module-id-input").should("not.have.class", "is-invalid");
  });

  it("should show error if name of module is missing on submit and clear error if changing", () => {
    cy.contains("Add Module").click();

    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.contains("button", "Create").click();

    //Expect error message
    cy.contains("li", "Please provide a name for the module.");

    //Expect class invalid
    cy.get("input#create-module-name-input").should("have.class", "is-invalid");

    //Expect error message to disappear after typing
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("li", "Please provide a name for the module.").should("not.exist");
    cy.get(".create-module-errors").should("not.exist");
    cy.get("input#create-module-name-input").should("not.have.class", "is-invalid");
  });

  it('should show error if provided id for module is a reserved keyword ("module"/"types_1")', () => {
    cy.contains("Add Module").click();

    //Check against word "module"
    cy.get("input#create-module-id-input").type("module");
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("button", "Create").click();

    cy.contains(`The word "module" is a reserved keyword and can't be used inside an ID!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Check against word "types_1" as that value is used for the repeatio examples
    cy.get("input#create-module-id-input").clear().type("types_1");
    cy.contains(`The word "types_1" is a reserved keyword!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");
  });

  it("should show error if id of module already in localStorage", () => {
    //Setup localStorage to have item
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
    });

    cy.contains("Add Module").click();

    cy.get("input#create-module-id-input").type("cypress_1");
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("button", "Create").click();

    cy.contains(`ID of module ("cypress_1") already exists!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Check "healing of error"
    cy.get("input#create-module-id-input").clear().type("cypress_2");
    cy.contains(`ID of module ("cypress_1") already exists!`).should("not.exist");
    cy.get("input#create-module-id-input").should("not.have.class", "is-invalid");

    cy.contains("button", "Create").click();

    cy.get("article[data-cy='module-cypress_2']").should("be.visible");
  });

  //IMPORTING A MODULE
  //Test if importing a new module works
  it("should add module when importing a module", () => {
    cy.contains("Add Module").click();

    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    cy.get("form.import-module").contains("button", "Add").click();
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();
    cy.contains("h1", "Cypress Fixture Module");
    cy.get("article[data-cy='Question Overview'").contains("a", "View").click();

    cy.get(".question-table").find(".question").should("have.length", 6);
  });

  //Test if the toast for successful imports works
  it("should show success toast after importing module", () => {
    cy.contains("Add Module").click();

    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });
    cy.get("form.import-module").contains("button", "Add").click();

    cy.get(".Toastify").find("a").click();
    cy.url().should("include", "cypress_1");
    cy.contains("h1", "Cypress Fixture Module").should("be.visible");
  });

  //Test if importing a new module by drag'n'drop works
  it("should add module when importing a module by drag'n'drop", () => {
    cy.contains("Add Module").click();

    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { action: "drag-drop", force: true }
      );
    });

    cy.get("form.import-module").contains("button", "Add").click();
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();
    cy.contains("h1", "Cypress Fixture Module");
    cy.get("article[data-cy='Question Overview'").contains("a", "View").click();

    cy.get(".question-table").find(".question").should("have.length", 6);
  });

  it("should show overwriting warning if item is already in localStorage", () => {
    cy.contains("Add Module").click();

    //Setup localStorage to have item
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
    });

    //Send fixture to upload area
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    cy.contains(
      `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    ).should("be.visible");

    //Should remove the message when clicking on the x
    cy.get("ul.accepted-files>li").find("button.file-remove-btn").click();

    //Check that warnings no longer show
    cy.contains(
      `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    ).should("not.exist");
    cy.get("ul.import-module-warnings-list>li").should("not.exist");
  });

  it("should show warning messages when trying to import two existing modules", () => {
    const localStorageItemContent = {
      id: "lsi-1",
      name: "Local Storage Item 1",
      compatibility: "0.3.0",
      questions: [],
    };

    const date = Date.now();
    const localStorageItem = {
      contents: Cypress.Buffer.from(JSON.stringify(localStorageItemContent)),
      fileName: "repeatio-module-lsi-1.json",
      mimeType: "application/json",
      lastModified: date,
    };

    //Setup localStorage to have item
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
      localStorage.setItem(
        `repeatio-module-${localStorageItemContent.id}`,
        JSON.stringify(localStorageItemContent, null, "\t")
      );
    });

    //Just to check if the localStorage works
    cy.contains("h2", "Local Storage Item 1").should("be.visible");

    cy.contains("button", "Add Module").click();

    //Adding files
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        [
          {
            contents: fileContent,
            fileName: "repeatio-module-cypress_1.json",
          },
          localStorageItem,
        ],
        { force: true }
      );
    });

    //Check warnings
    cy.get("ul.import-module-warnings-list").find("li").should("have.length", 2);
    cy.contains(
      "li",
      `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    )
      .should("be.visible")
      .and("have.length", 1);

    cy.contains(
      "li",
      `${localStorageItemContent.id} already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    )
      .should("be.visible")
      .and("have.length", 1);

    cy.get(`li[id='${date}-repeatio-module-lsi-1.json'`).find("button.file-remove-btn").click();

    cy.get("ul.import-module-warnings-list")
      .find("li")
      .should("have.length", 1)
      .and(
        "have.text",
        `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
      );
  });

  it("should show error if trying to import the same file again", () => {
    cy.contains("Add Module").click();

    //First import should be ok
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("be.visible");

    //Try to import again
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Should show toast with warning
    cy.get(".Toastify").contains(
      "A file with the same ID (cypress_1) is already in your imports! Remove it, to add this file!"
    );

    //Regex match consoleError
    cy.get("@consoleError").should("be.calledWithMatch", /.*A file with.*/);

    //expect only one element in import list
    cy.get("ul.accepted-files").find("li").should("have.length", 1);
  });

  it("should toast warning if trying to import with no files", () => {
    cy.contains("Add Module").click();

    cy.get("form.import-module").contains("button", "Add").click();
    cy.contains("Please select a file!").should("exist");
  });

  it("should replace a existing file from the localStorage with the import", () => {
    const replacerModuleContent = {
      id: "cypress_1",
      name: "This module was replaced by cypress",
      compatibility: "0.3.0",
      questions: [],
    };

    const date = Date.now();
    const replacerModule = {
      contents: Cypress.Buffer.from(JSON.stringify(replacerModuleContent)),
      fileName: "repeatio-module-cypress_1.json",
      mimeType: "application/json",
      lastModified: date,
    };

    //Setup localStorage to have item
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
    });

    cy.contains("button", "Add Module").click();

    //Adding files
    cy.get('input[type="file"]').selectFile(replacerModule, { force: true });

    cy.contains(
      `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    );

    cy.get("form.import-module").contains("button", "Add").click();

    cy.contains("This module was replaced by cypress");
  });

  /* -------------------------------------- EXPORT MODULE -----------------------------------*/
  //Test Popover to be visible
  it("should show the Popover component when clicking on the popover button (3 vertical dots)", () => {
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.get(".MuiPaper-root").should("be.visible");
  });

  //Test download of public folder file (cypress saves it to cypress/downloads)
  it("should download 'Question Types' file", () => {
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
  it("should download module from the localStorage", () => {
    const moduleID = "cypress_1";
    //Add item to localStorage
    cy.fixture(`repeatio-module-${moduleID}.json`).then((fileContent) => {
      localStorage.setItem(`repeatio-module-${moduleID}`, JSON.stringify(fileContent, null, "\t"));
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
