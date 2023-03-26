/// <reference types="cypress" />
import path from "path";
import {
  getBookmarkedLocalStorageItem,
  getBookmarkedQuestionsFromModule,
  IBookmarkedQuestions,
} from "../../src/components/Question/components/Actions/BookmarkQuestion";

/* ------------------------------------Bookmark in Module Overview ------------------------------ */
describe("Test usage of bookmarked Questions in module overview", () => {
  //Add fixture to localStorage and navigate to module url
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");
  });

  it("should display questions that are marked in the localStorage", () => {
    //Setup localStorage
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    //Click on start
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("be.visible");
  });

  it("should show modal after clicking on the dots in the bookmarkedQuestions", () => {
    cy.contains("li", "Import").should("not.exist");
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Import").should("be.visible");
    cy.contains("li", "Export").should("be.visible").and("not.be.disabled");
  });

  it("should error if there are no bookmarked questions defined", () => {
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("Found 0 bookmarked questions for this module!");
  });
});

/* --------------------------------------------- EXPORT ----------------------------------------- */

describe("Test export of bookmarked Questions", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder
  before(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  //navigate to module url
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "warn").as("consoleWarn");
        cy.stub(win.console, "info").as("consoleInfo");
      },
    });
  });

  it("should download marked questions from localStorage", () => {
    //Add fixture to localStorage
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Export").click();

    const downloadedFilename = path.join(downloadsFolder, "repeatio-marked-cypress_1.json");

    //Compare the downloaded file with the original file in the localStorage (which comes from a fixture)
    cy.readFile(downloadedFilename).then((downloadedContent) => {
      cy.fixture("repeatio-marked-cypress_1.json").then((fixtureContent) => {
        expect(downloadedContent).to.deep.equal(fixtureContent);
      });
    });
  });

  it("should show error if there are no bookmarked questions to be exported", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Export").click();

    //Test toast and console.error
    cy.get(".Toastify").contains(
      `Failed to export the bookmarked questions for "cypress_1" because there aren't any bookmarked questions!`
    );

    cy.get("@consoleError").should(
      "be.calledWithMatch",
      /\[.*\] Failed to export the bookmarked questions for "cypress_1" because there aren't any bookmarked questions\!/
    );
  });
});

/* ---------------------------------------------- IMPORT ---------------------------------------- */

describe("Test import of bookmarked Questions", () => {
  //Add fixture to localStorage and navigate to module url
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");
  });

  it("should import bookmarked Questions", () => {
    //Remove localStorage that was added by beforeEach hook
    cy.clearLocalStorage("repeatio-marked-cypress_1");

    //Find popover button (3 dots)
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    cy.fixture("repeatio-marked-cypress_1.json").then((fileContent) => {
      cy.get("input[type=file]")
        .selectFile({ contents: fileContent, fileName: "repeatio-marked-cypress_1.json" }, { force: true })
        .should(() => {
          const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");
          expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
          expect(bookmarkedLocalStorageItem?.type).to.equal("marked");
          expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
        });
    });

    //Expect toast success to show up with message
    cy.get(".Toastify").contains("Imported 2 question(s).Total saved questions: 2");
  });

  it("should only add imported items to the localStorage that are not duplicates and exist as questions in the module", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    //Build new file
    //Note that "qID-1" is already in the localStorage and "id-does-not-exist" is not present as a question id. These values should therefore be ignored
    const file = buildBookmarkFile("cypress_1", ["qID-1", "id-does-not-exist", "qID-4"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3", "qID-4"]);
      });

    //Show toast for success (Caution no space because of new line)
    cy.contains("Imported 1 question(s).Total saved questions: 3");

    //Show toast for warning if id isn't in module
    cy.contains("Failed to import id-does-not-exist as this id is not present in this module!");

    //Start saved questions and expect to find string (.../3 Questions)
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("3 Questions").should("be.visible");
  });

  it("should add imported items to the localStorage if there are more items in the import than the original storage", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    const file = buildBookmarkFile("cypress_1", ["qID-2", "qID-4", "qID-5", "qID-6"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = getBookmarkedQuestionsFromModule("cypress_1");
        expect(bookmarkedLocalStorageItem).to.deep.equal(["qID-1", "qID-3", "qID-2", "qID-4", "qID-5", "qID-6"]);
      });
  });

  it("should keep the original localStorage if the import is empty", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    //Build file to add
    const file = buildBookmarkFile("cypress_1", []);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
      });
  });

  it("should add items to the localStorage if there are no old items in the localStorage before", () => {
    cy.clearLocalStorage();

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();

    const file = buildBookmarkFile("cypress_1", ["qID-2", "qID-4", "qID-5"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-2", "qID-4", "qID-5"]);
      });
  });

  it("should keep marked Questions in localStorage the same if the import only contains duplicates", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    //Notice these values are only duplicates (but in different order that the fixture)

    const file = buildBookmarkFile("cypress_1", ["qID-3", "qID-1"]);

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");

        expect(bookmarkedLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
      });
  });
});

/* --------------------------------------- DELETION --------------------------------------------- */

describe("Test deletion of bookmarked Questions", () => {
  //Navigate to module url and spy on console
  beforeEach(() => {
    cy.visit("/module/types_1", {
      onBeforeLoad(win) {
        cy.spy(win.console, "log").as("consoleLog");
        cy.stub(win.console, "error").as("consoleError");
        cy.stub(win.console, "warn").as("consoleWarn");
        cy.stub(win.console, "info").as("consoleInfo");
      },
    });
  });

  it("should delete bookmarked questions on delete click", () => {
    //Setup localStorage with fixture
    cy.fixtureToLocalStorage("repeatio-marked-types_1.json");

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Delete")
      .click()
      .should(() => {
        expect(localStorage.getItem("repeatio-marked-types_1")).to.be.null;
      });

    //Check with ui
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("Found 0 bookmarked questions for this module!");

    cy.contains(`Deleted bookmarked questions for "types_1"!`);
    cy.get("@consoleLog").should("be.calledWithMatch", /\[.*\] Deleted bookmarked questions for "types_1"\!/);
  });

  it("should show error if trying to delete bookmarked questions but 0 questions are defined", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Delete").click();
    cy.contains(`Failed to delete the bookmarked questions for "types_1" because there are 0 questions saved!`);
    cy.get("@consoleError").should(
      "be.calledWithMatch",
      /\[.*\] Failed to delete the bookmarked questions for "types_1" because there are 0 questions saved\!/
    );
  });
});

/* ----------------------------------------- v0.4 Transform ------------------------------------ */
//TODO remove this when developing v0.5
describe("Transform from Bookmark to v0.4 Test", () => {
  it("should replace v0.3 bookmark file structure with new v0.4 in localStorage onMount", () => {
    localStorage.setItem("repeatio-marked-types_1", JSON.stringify(["qID-1", "qID-3"]));
    cy.visit("module/types_1").should(() => {
      const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem("types_1");

      expect(bookmarkedLocalStorageItem?.id).to.equal("types_1");
      expect(bookmarkedLocalStorageItem?.type).to.equal("marked");
      expect(bookmarkedLocalStorageItem?.compatibility).to.equal("0.4.0");
      expect(bookmarkedLocalStorageItem?.questions).to.deep.equal(["qID-1", "qID-3"]);
    });
  });
});

/* --------------------------------------------- HELPERS ---------------------------------------- */
/**
 * Build and return a bookmark JSON file
 * @param moduleID - id of the module
 * @param questions - Array of the ids of the questions
 */
export function buildBookmarkFile(moduleID: "types_1" | (string & {}), questions: IBookmarkedQuestions["questions"]) {
  const fileContent = {
    id: moduleID,
    type: "marked",
    compatibility: "0.4.0",
    questions: questions,
  };

  return {
    contents: Cypress.Buffer.from(JSON.stringify(fileContent)),
    fileName: `repeatio-marked-${moduleID}.json`,
    mimeType: "application/json",
    lastModified: Date.now(),
  };
}
