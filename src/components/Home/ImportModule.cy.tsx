/// <reference types="cypress" />

import { ImportModule } from "./ImportModule";
import { CustomToastContainer } from "../toast/toast";
import { MemoryRouter } from "react-router-dom";
import { parseJSON } from "../../utils/parseJSON";
import { IModule } from "../module/module";

import "../../index.css";
import "./AddModule.css";

//Mocha / Chai for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

function MockImportModuleComponent() {
  const handleModalCloseSpy = cy.spy().as("handleModalCloseSpy");
  return (
    <MemoryRouter>
      <main style={{ marginTop: 0 }}>
        <div className='import-create-module' style={{ backgroundColor: "white" }}>
          <ImportModule handleModalClose={handleModalCloseSpy} />
        </div>
        <CustomToastContainer />
      </main>
    </MemoryRouter>
  );
}

describe("Importing a Module", () => {
  it("should add new module to localStorage when importing a module", () => {
    cy.mount(<MockImportModuleComponent />);

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

        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.name).to.equal("Cypress Fixture Module");
        expect(localStorageItem?.type).to.equal("module");
        expect(localStorageItem?.lang).to.equal("en");
        expect(localStorageItem?.compatibility).to.equal("0.5.0");
        expect(localStorageItem?.questions).to.have.length(6);
      });
  });

  it("should replace the text inside the Import button with a spinner", () => {
    cy.mount(<MockImportModuleComponent />);

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

    cy.get("form.import-module").contains("button", "Import");

    // Assert that the text import is invisible while the import is loading
    cy.get("button[type='submit']").contains("Import").should("have.css", "color", "rgba(0, 0, 0, 0)");

    // Import button should reappear after file finished uploading
    cy.get("button[type='submit']").contains("Import").should("have.css", "color", "rgb(255, 255, 255)");
  });

  it("should display a loading symbol while the module data is uploading", () => {
    cy.mount(<MockImportModuleComponent />);

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

    cy.get("div.circular-bars-spinner").should("exist");
  });

  //Test if the toast for successful imports works
  it("should show success toast after importing module", () => {
    cy.mount(<MockImportModuleComponent />);

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

    cy.contains("Successfully imported cypress_1.").should("exist");
  });

  //Test if importing a new module by drag'n'drop works
  it("should add module when importing a module by drag'n'drop", () => {
    cy.mount(<MockImportModuleComponent />);

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

    //Wait for the file to be added and click button after
    cy.get("button.import-module-btn[aria-disabled='false']")
      .click({ force: true })
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.name).to.equal("Cypress Fixture Module");
        expect(localStorageItem?.type).to.equal("module");
        expect(localStorageItem?.lang).to.equal("en");
        expect(localStorageItem?.compatibility).to.equal("0.5.0");
        expect(localStorageItem?.questions).to.have.length(6);
      });
  });

  //Show errors when trying to overwrite existing file in localStorage with import
  it("should show overwriting warning if item is already in localStorage and clear after removing that file", () => {
    cy.mount(<MockImportModuleComponent />);

    //Add module from fixture to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

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

    cy.contains("Importing an existing module will replace that module with the imported one!").should("exist");

    cy.get(".accepted-files > #cypress_1")
      .find("div[aria-label='This file will replace the existing module!']")
      .should("exist");

    //Should remove the message when clicking on the x
    cy.get("ul.accepted-files>li").find("button.file-remove-btn").click();

    //Check that warnings no longer show
    cy.contains("Importing an existing module will replace that module with the imported one!").should("not.exist");
    cy.get("ul.import-module-warnings").should("not.exist");
  });

  it("should show warning messages when trying to import two existing modules", () => {
    cy.mount(<MockImportModuleComponent />);

    const localStorageItemContent = {
      id: "lsi-1",
      name: "Local Storage Item 1",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
      questions: [],
    };

    const localStorageItem = {
      contents: Cypress.Buffer.from(JSON.stringify(localStorageItemContent)),
      fileName: "repeatio-module-lsi-1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Setup localStorage to have 2 items
    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      localStorage.setItem(`repeatio-module-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
      localStorage.setItem(
        `repeatio-module-${localStorageItemContent.id}`,
        JSON.stringify(localStorageItemContent, null, "\t")
      );
    });

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

    //Check the warning svg exists for cypress_1
    cy.get(".accepted-files > #cypress_1")
      .find("div[aria-label='This file will replace the existing module!']")
      .find("svg")
      .should("exist");

    //Check the warning svg exists for lsi-1
    cy.get(".accepted-files > #lsi-1")
      .find("div[aria-label='This file will replace the existing module!']")
      .find("svg")
      .should("exist");

    //Check warning
    cy.contains("Importing an existing module will replace that module with the imported one!").should("exist");

    //Remove lsi-1
    cy.get(`li[id='${localStorageItemContent.id}'`).find("button.file-remove-btn").click();

    //Check warning to still exist
    cy.contains("Importing an existing module will replace that module with the imported one!").should("exist");
  });

  it("should show error if trying to import the same file again (by comparing lastModified and name prop)", () => {
    cy.mount(<MockImportModuleComponent />);

    //Setup file content
    const fileContent = {
      id: "file_1",
      name: "File 1",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
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
    cy.contains("repeatio-module-file-1.json (file_1)").should("exist");
    cy.get("ul.accepted-files").should("have.length", 1);

    //Add same file again
    cy.get('input[type="file"]').selectFile({ ...file }, { force: true });

    //Expect Toast to show up with error, list to still have length of one and console to log error
    cy.get(".Toastify").contains("Module is already in the list of imports!");
    cy.get("ul.accepted-files").should("have.length", 1);
  });

  //Error when trying to import a file with the same id (happens when user renames imports)
  //Somehow the lastModified prop of the fixture changes, so it doesn't get caught by the test above
  it("should show error if trying to import a file with an id that is already in the imports", () => {
    cy.mount(<MockImportModuleComponent />);

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

    //expect only one element in import list
    cy.get("ul.accepted-files").find("li").should("have.length", 1);
  });

  //Show warning if no file is chosen in upload
  it("should toast warning if trying to import with no files", () => {
    cy.mount(<MockImportModuleComponent />);

    cy.get("form.import-module").contains("button", "Import").click({ force: true });
    cy.contains("Please select a file!").should("exist");
  });

  //Show error if user tries to import a bookmark file
  //This might be supported in the future
  it("should show toast error if trying to import a bookmark file", () => {
    cy.mount(<MockImportModuleComponent />);

    //Import bookmark file
    cy.fixture("repeatio-marked-types_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-marked-types_1.json",
        },
        { force: true }
      );
    });

    cy.get(".Toastify__toast--error").should("exist");
  });

  //Replace the existing file if adding a module with the same id
  it("should replace a existing file from the localStorage with the import", () => {
    cy.mount(<MockImportModuleComponent />);

    //Build content
    const replacerModuleContent = {
      id: "cypress_1",
      name: "This module was replaced by cypress",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
      questions: [],
    };

    //Build file
    const replacerModule = {
      contents: Cypress.Buffer.from(JSON.stringify(replacerModuleContent)),
      fileName: "repeatio-module-cypress_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Add item localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Adding files
    cy.get('input[type="file"]').selectFile(replacerModule, { force: true });

    //Check the warning svg exists
    cy.get(".accepted-files > #cypress_1")
      .find("div[aria-label='This file will replace the existing module!']")
      .find("svg")
      .should("exist");

    //Check warning text
    cy.contains("Importing an existing module will replace that module with the imported one!").should("exist");

    cy.get("form.import-module")
      .contains("button", "Import")
      .click({ force: true })
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        expect(localStorageItem?.name).to.equal("This module was replaced by cypress");
      });
  });

  //Test removing a file
  it("should remove a imported file if clicking on the remove button", () => {
    cy.mount(<MockImportModuleComponent />);

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
  it("should only remove the correct imported file if clicking on the remove button if there are multiple imports present", () => {
    cy.mount(<MockImportModuleComponent />);

    cy.fixture("repeatio-module-cypress_1.json").then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: fileContent,
          fileName: "repeatio-module-cypress_1.json",
        },
        { force: true }
      );
    });

    //Wait for the content to show up
    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("exist");

    //Setup file content
    const fileContent = {
      id: "file_1",
      name: "File 1",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
      questions: [],
    };

    //Setup file
    const file = {
      contents: Cypress.Buffer.from(JSON.stringify(fileContent)),
      fileName: "repeatio-module-file-1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Second file
    const fileContent2 = {
      id: "file_2",
      name: "File 2",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
      questions: [],
    };

    const file2 = {
      contents: Cypress.Buffer.from(JSON.stringify(fileContent2)),
      fileName: "repeatio-module-file-2.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    //Send file to drop area
    cy.get('input[type="file"]').selectFile([file, file2], { force: true });

    //Import file

    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("exist");
    cy.contains("repeatio-module-file-1.json (file_1)").should("exist");
    cy.contains("repeatio-module-file-2.json (file_2)").should("exist");

    //Expect only two files to be left after removing one file
    cy.get("ul.accepted-files").find("li[id='file_1']").find("button.file-remove-btn").click();
    cy.contains("repeatio-module-cypress_1.json (cypress_1)").should("exist");
    cy.contains("repeatio-module-file-2.json (file_2)").should("exist");
    cy.get("ul.accepted-files").find("li").should("have.length", 2);

    //Expect only one field to be left after remove click
    cy.get("ul.accepted-files").find("li[id='cypress_1']").find("button.file-remove-btn").click();
    cy.contains("repeatio-module-file-2.json (file_2)").should("exist");
    cy.get("ul.accepted-files").find("li").should("have.length", 1);
  });
});

//TODO
// - test import of bookmark ✔ + old
//- show warning if hoovering
//clear warning
