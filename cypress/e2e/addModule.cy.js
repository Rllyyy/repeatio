/// <reference types="cypress" />
import { version } from "../../package.json";

/* This file contains e2e tests for the AddModule component which itself contains of the ImportModule and CreateModule component */

/* ------------------------------------ ADDMODULE COMPONENT ----------------------------------- */
describe("Test the addModule component", () => {
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
  });

  //Test if display Import or Create a Module modal on Add Module click
  it("should display 'Import or create Module' Modal when clicking on 'Add Module'", () => {
    cy.contains("h1", "Import or Create a Module").should("be.visible");
  });
});

/* ------------------------------------ IMPORTING A MODULE ------------------------------------ */
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
  });

  //Test if importing a new module works
  it("should add module when importing a module", () => {
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

    cy.get("form.import-module").contains("button", "Add").click({ force: true });
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();
    cy.contains("h1", "Cypress Fixture Module");
    cy.get("article[data-cy='Question Overview'").contains("a", "View").click();

    cy.get(".question-table").find(".question").should("have.length", 6);
  });

  //Check addition to localStorage
  it("should add new module to localStorage when importing a module", () => {
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
      .contains("button", "Add")
      .click({ force: true })
      .should(() => {
        const localStorageItem = JSON.parse(localStorage.getItem("repeatio-module-cypress_1"));

        //Check item with chai
        assert.isObject(localStorageItem);
        expect(localStorageItem).not.to.be.null;
        expect(localStorageItem.id).to.equal("cypress_1");
        expect(localStorageItem.name).to.equal("Cypress Fixture Module");
        expect(localStorageItem.questions).to.have.length(6);
      });
  });

  //Test if the toast for successful imports works
  it("should show success toast after importing module", () => {
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

    cy.get("form.import-module").contains("button", "Add").click({ force: true });

    //Regex match consoleError (brackets include current time so that needs to be escaped)
    cy.get("@consoleLog").should("be.calledWithMatch", /\[.*\] Imported cypress_1.*/);

    //Click on link inside toast
    cy.get(".Toastify").find("a").click();

    //Check url and heading
    cy.url().should("include", "cypress_1");
    cy.contains("h1", "Cypress Fixture Module").should("be.visible");
  });

  //Test if importing a new module by drag'n'drop works
  it("should add module when importing a module by drag'n'drop", () => {
    //Send file to upload area per drag and drop
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { action: "drag-drop", force: true }
      );
    });

    //Wait for the file to be added
    cy.get("ul.accepted-files").find("li").should("have.length", 1);

    //CLick add button
    cy.get("form.import-module").contains("button", "Add").click({ force: true });

    //In home click on view in added module
    cy.get("article[data-cy='module-cypress_1']").contains("View").click();

    //Check heading
    cy.contains("h1", "Cypress Fixture Module");

    //Navigate to question overview and check content
    cy.get("article[data-cy='Question Overview'").contains("a", "View").click();
    cy.get(".question-table").find(".question").should("have.length", 6);
  });

  //Show errors when trying to overwrite existing file in localStorage with import
  it("should show overwriting warning if item is already in localStorage", () => {
    cy.addModuleFixtureToLocalStorage();

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

    //Setup localStorage to have 2 items
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
      localStorage.setItem(
        `repeatio-module-${localStorageItemContent.id}`,
        JSON.stringify(localStorageItemContent, null, "\t")
      );
    });

    //Just to check if the localStorage works
    cy.contains("h2", "Local Storage Item 1").should("be.visible");

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

    cy.get(`li[id='${localStorageItemContent.id}'`).find("button.file-remove-btn").click();

    cy.get("ul.import-module-warnings-list")
      .find("li")
      .should("have.length", 1)
      .and(
        "have.text",
        `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
      );
  });

  it("should show error if trying to import the same file again (by comparing lastModified and name prop)", () => {
    //Setup file content
    const fileContent = {
      id: "file_1",
      name: "File 1",
      compatibility: "0.3.0",
      questions: [],
    };

    //Setup file
    const file = {
      contents: Cypress.Buffer.from(JSON.stringify(fileContent)),
      fileName: "repeatio-module-file-1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Send file to drop area
    cy.get('input[type="file"]').selectFile({ ...file }, { force: true });

    //Expect element to be added
    cy.contains("repeatio-module-file-1.json (file_1)").should("be.visible");
    cy.get("ul.accepted-files").should("have.length", 1);

    //Add same file again
    cy.get('input[type="file"]').selectFile({ ...file }, { force: true });

    //Expect Toast to show up with error, list to still have length of one and console to log error
    cy.get(".Toastify").contains("Module is already in the list of imports!");
    cy.get("ul.accepted-files").should("have.length", 1);
    cy.get("@consoleError").should("be.calledWithMatch", /\[.*\] Module is already in the list of imports!.*/);
  });

  //Error when trying to import a file with the same id (happens when user renames imports)
  //Somehow the lastModified prop of the fixture changes, so it doesn't get caught by the test above
  it("should show error if trying to import a file with an id that is already in the imports", () => {
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

    //Should show toast with warning and log warning (Regex to ignore time)
    cy.get(".Toastify").contains(
      "A file with the same ID (cypress_1) is already in your imports! Remove it, to add this file!"
    );
    cy.get("@consoleError").should(
      "be.calledWithMatch",
      /\[.*\] A file with the same ID \(cypress_1\) is already in your imports! Remove it, to add this file!.*/
    );

    //expect only one element in import list
    cy.get("ul.accepted-files").find("li").should("have.length", 1);
  });

  //Show warning if no file is chosen in upload
  it("should toast warning if trying to import with no files", () => {
    cy.get("form.import-module").contains("button", "Add").click({ force: true });
    cy.contains("Please select a file!").should("exist");
  });

  //Test replacing localStorage with input
  it("should replace a existing file from the localStorage with the import", () => {
    const replacerModuleContent = {
      id: "cypress_1",
      name: "This module was replaced by cypress",
      compatibility: "0.3.0",
      questions: [],
    };

    const replacerModule = {
      contents: Cypress.Buffer.from(JSON.stringify(replacerModuleContent)),
      fileName: "repeatio-module-cypress_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Add item localStorage
    cy.addModuleFixtureToLocalStorage();

    //Adding files
    cy.get('input[type="file"]').selectFile(replacerModule, { force: true });

    cy.contains(
      `cypress_1 already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
    );

    cy.get("form.import-module").contains("button", "Add").click({ force: true });

    cy.contains("This module was replaced by cypress");
  });

  //Test removing a file
  it("should remove a imported file if clicking on the remove button", () => {
    //Import file
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Click remove button
    cy.get("button.file-remove-btn").click();

    //Expect the file to no longer exist in the imports
    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("not.exist");
    cy.get("ul.accepted-files").find("li").should("have.length", 0);
  });

  //Test removing a file if there are multiple files found in the imports
  it.only("should only remove the correct imported file if clicking on the remove button if there are multiple imports present", () => {
    //Setup file content
    const fileContent = {
      id: "file_1",
      name: "File 1",
      compatibility: "0.3.0",
      questions: [],
    };

    //Setup file
    const file = {
      contents: Cypress.Buffer.from(JSON.stringify(fileContent)),
      fileName: "repeatio-module-file-1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Send file to drop area
    cy.get('input[type="file"]').selectFile({ ...file }, { force: true });

    //Import file
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Click remove button
    cy.get("ul.accepted-files").find("li[id='file_1']").find("button.file-remove-btn").click();

    //Expect only one file to be left
    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("exist").and("be.visible");
    cy.get("ul.accepted-files").find("li").should("have.length", 1);
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
  });

  //Test if display Import or Create a Module modal on Add Module click
  it("should display 'Import or create Module' Modal when clicking on 'Add Module'", () => {
    cy.contains("h1", "Import or Create a Module").should("be.visible");
  });

  //Test creating a new module
  it("should add module and show toast when creating a module", () => {
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

  //Check addition to localStorage
  it("should add new module to localStorage when creating a module", () => {
    cy.get("input#create-module-id-input").type("cypress-localStorage");
    cy.get("input#create-module-name-input").type("Cypress in localStorage");

    cy.get("form.create-module")
      .contains("button", "Create")
      .click()
      .should(() => {
        const localStorageItem = JSON.parse(localStorage.getItem("repeatio-module-cypress-localStorage"));

        //Check item with chai
        assert.isObject(localStorageItem);
        expect(localStorageItem).not.to.be.null;
        expect(localStorageItem.id).to.equal("cypress-localStorage");
        expect(localStorageItem.name).to.equal("Cypress in localStorage");
        expect(localStorageItem.questions).to.have.length(0);
      });
  });

  //Form should not submit if pressing enter on in input
  it("should not submit form when pressing enter inside input", () => {
    cy.get("input#create-module-id-input").type("{enter}");
    cy.get("input#create-module-name-input").type("{enter}");
    cy.get(".create-module-errors").should("not.exist");
  });

  //No errors on normal display
  it("should show no errors when rendering initially", () => {
    //Should not initially show errors
    cy.get(".create-module-errors").should("not.exist");

    //Should not show errors after input typing
    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get(".create-module-errors").should("not.exist");

    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.get(".create-module-errors").should("not.exist");
  });

  //Show errors
  it("should show errors if trying to submit without filling out required fields", () => {
    cy.contains("button", "Create").click();

    cy.contains("li", "Please provide an ID for the module.");
    cy.contains("li", "Please provide a name for the module.");
  });

  //Error display on submit for id and clearing if error are healed
  it("should show error if id of module is missing on submit and clear error if changing", () => {
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

  //Error for module name if missing and healed
  it("should show error if name of module is missing on submit and clear error if changing", () => {
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

  //Error when using reserved keywords (module/types_1)
  it('should show error if provided id for module is a reserved keyword ("module"/"types_1")', () => {
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

  //Error if using space inside id input
  it("should show error if using space in id", () => {
    //Check against word "module"
    cy.get("input#create-module-id-input").type("id 1");
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("button", "Create").click();

    cy.contains(`The ID has to be one word! Use hyphens ("-") to concat the word (id-1)`);

    //Test focus
    cy.focused().should("have.attr", "name", "id");

    //Should have class to add border and background
    cy.get("input[name='id']").should("have.class", "is-invalid");
  });

  //Error if module in already in localStorage and clearing of error if fixed by user
  it("should show error if id of module already in localStorage", () => {
    //Setup localStorage to have item
    cy.addModuleFixtureToLocalStorage();

    //Type into inputs
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
});
