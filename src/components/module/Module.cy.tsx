/// <reference types="cypress" />
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IModule, Module } from "./module";
import { CustomToastContainer } from "@components/toast/toast";
import { parseJSON } from "src/utils/parseJSON";
import { IBookmarkedQuestions } from "@components/Question/components/Actions/BookmarkQuestion";

import "../../index.css";

const MockModuleWithRouter = () => {
  return (
    <MemoryRouter initialEntries={["/module/cypress_1"]}>
      <Routes>
        <Route
          path='/module/:moduleID'
          element={
            <main>
              <Module />
            </main>
          }
        />
      </Routes>
      <CustomToastContainer />
    </MemoryRouter>
  );
};

/* ----------------------------------------- DELETE BOOKMARKS ----------------------------------- */

context("Delete BookmarkedQuestions", () => {
  it("should delete bookmarked questions on delete click", () => {
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Delete").click();

    cy.contains("button", "Remove bookmarked Questions")
      .click()
      .should(() => {
        expect(localStorage.getItem("repeatio-marked-cypress_1")).to.equal(null);
      });

    // Assert that the modal closed after removing the bookmarked questions
    cy.contains("h2", "Remove bookmarked Questions").should("not.exist");
  });

  it("should show warning if trying to delete bookmarked question but 0 questions are defined", () => {
    // cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Delete").click();
    cy.contains("Found 0 bookmarked questions for this module!").should("exist");
  });
});

/* ----------------------------------------- EXPORT BOOKMARKS ----------------------------------- */
context("Export Bookmarked Questions", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder
  beforeEach(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  it("should download marked question from localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Export").click();

    //const downloadedFilename = path.join(downloadsFolder, "repeatio-marked-cypress_1.json");

    //Compare the downloaded file with the original file in the localStorage (which comes from a fixture)
    cy.readFile(`${downloadsFolder}/repeatio-marked-cypress_1.json`).then((downloadedContent) => {
      cy.fixture("repeatio-marked-cypress_1.json").then((fixtureContent) => {
        expect(downloadedContent).to.deep.equal(fixtureContent);
      });
    });
  });

  it("should show an error if there are not bookmarked question to be exported", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Export").click();

    //Test toast and console.error
    cy.get(".Toastify").contains(
      `Failed to export the bookmarked questions for "cypress_1" because there aren't any bookmarked questions!`
    );
  });
});

/* ----------------------------------------- IMPORT BOOKMARKS ----------------------------------- */
context("Import Bookmarked Questions", () => {
  it("should import bookmarked Questions", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter />);

    //Find popover button (3 dots)
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    cy.fixture("repeatio-marked-cypress_1.json").then((fileContent) => {
      cy.get("input[type=file]")
        .selectFile({ contents: fileContent, fileName: "repeatio-marked-cypress_1.json" }, { force: true })
        .should(() => {
          const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
            localStorage.getItem("repeatio-marked-cypress_1")
          );

          expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
          expect(bookmarkedLocalStorageItem?.type).to.equal("marked");
          expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
        });
    });

    //Expect toast success to show up with message
    cy.get(".Toastify").contains("Imported 2 question(s).Total saved questions: 2").should("exist");
  });

  it("should only add imported items to the localStorage that are not duplicates and exist as questions in the module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    //Build new file
    //Note that "qID-1" is already in the localStorage and "id-does-not-exist" is not present as a question id. These values should therefore be ignored
    const file = buildBookmarkFile("cypress_1", ["qID-1", "id-does-not-exist", "qID-4"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
          localStorage.getItem("repeatio-marked-cypress_1")
        );

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.type).to.equal("marked");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3", "qID-4"]);
      });

    //Show toast for success (Caution no space because of new line)
    cy.contains("Imported 1 question(s).Total saved questions: 3");

    //Show toast for warning if id isn't in module
    cy.contains("Failed to import id-does-not-exist as this id is not present in this module!");
  });

  it("should add imported items to the localStorage if there are more items in the import than the original storage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    const file = buildBookmarkFile("cypress_1", ["qID-2", "qID-4", "qID-5", "qID-6"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
          localStorage.getItem("repeatio-marked-cypress_1")
        );

        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal([
          "qID-1",
          "qID-3",
          "qID-2",
          "qID-4",
          "qID-5",
          "qID-6",
        ]);
      });
  });

  it("should keep the original localStorage if the import is empty", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    //Build file to add
    const file = buildBookmarkFile("cypress_1", []);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
          localStorage.getItem("repeatio-marked-cypress_1")
        );

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
      });
  });

  it("should add items to the localStorage if there are no old items in the localStorage before", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    const file = buildBookmarkFile("cypress_1", ["qID-2", "qID-4", "qID-5"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
          localStorage.getItem("repeatio-marked-cypress_1")
        );

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-2", "qID-4", "qID-5"]);
      });
  });

  it("should keep marked Questions in localStorage the same if the import only contains duplicates ", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    //Notice these values are only duplicates (but in different order that the fixture)

    const file = buildBookmarkFile("cypress_1", ["qID-3", "qID-1"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = parseJSON<IBookmarkedQuestions>(
          localStorage.getItem("repeatio-marked-cypress_1")
        );

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
      });
  });
});

/* ----------------------------------------- MODULE INFO ----------------------------------- */

context("Module Info", () => {
  it("should show the module info", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Module Info']").find("button").click();

    cy.contains("h1", "Edit Module").should("exist");
    cy.get("input#module-editor-id-input").should("have.value", "cypress_1");
    cy.get("input#module-editor-name-input").should("have.value", "Cypress Fixture Module");
  });

  it("should update the module id and name", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleWithRouter />);

    cy.get("article[data-cy='Module Info']").find("button").click();

    cy.contains("h1", "Edit Module").should("exist");
    cy.get("input#module-editor-id-input").clear().type("updated");
    cy.get("input#module-editor-name-input").clear().type("Updated");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const updatedModule = parseJSON<IModule>(localStorage.getItem("repeatio-module-updated"));
        expect(updatedModule?.id).to.equal("updated");
        expect(updatedModule?.name).to.equal("Updated");
      });

    // Assert that the heading of the module changed
    cy.contains("h1", "Updated (updated)");
  });
});

/* --------------------------------------------- HELPERS ---------------------------------------- */
/**
 * Build and return a bookmark JSON file
 * @param moduleID - id of the module
 * @param questions - Array of the ids of the questions
 */
export function buildBookmarkFile(moduleID: "cypress_1" | (string & {}), questions: IBookmarkedQuestions["questions"]) {
  const fileContent = {
    id: moduleID,
    type: "marked",
    compatibility: "0.6.0",
    questions: questions,
  };

  return {
    contents: Cypress.Buffer.from(JSON.stringify(fileContent)),
    fileName: `repeatio-marked-${moduleID}.json`,
    mimeType: "application/json",
    lastModified: Date.now(),
  };
}
