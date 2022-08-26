/// <reference types="cypress" />
import path from "path";

describe("Test Export of bookmarked Questions", () => {
  const downloadsFolder = Cypress.config("downloadsFolder");

  //Delete cypress/downloads folder
  before(() => {
    cy.task("deleteFolder", downloadsFolder);
  });

  //Add fixture to localStorage and navigate to home url
  beforeEach(() => {
    cy.fixture("repeatio-marked-types_1.json").then((fileContent) => {
      localStorage.setItem("repeatio-marked-types_1", JSON.stringify(fileContent, null, "\t"));
    });
    cy.visit("/module/types_1");
  });

  it("should display questions that are marked in the localStorage", () => {
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("be.visible");
  });

  it("should show modal after clicking on the dots in the bookmarkedQuestions", () => {
    cy.contains("li", "Import").should("not.exist");
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Import").should("be.visible");
    cy.contains("li", "Export").should("be.visible").and("not.be.disabled");
  });

  it("should download marked questions from localStorage", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    cy.contains("li", "Export").click();

    const downloadedFilename = path.join(downloadsFolder, "repeatio-marked-types_1.json");

    //Compare the downloaded file with the original file in the localStorage (which comes from a fixture)
    cy.readFile(downloadedFilename).then((downloadedContent) => {
      cy.fixture("repeatio-marked-types_1.json").then((fixtureContent) => {
        expect(downloadedContent).to.deep.equal(fixtureContent);
      });
    });
  });

  it("should only add imported items to the localStorage that are not duplicates and exist as questions in the module", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    //Note that "qID-1" is already in the localStorage and "id-does-not-exist" is not present as a question id. These values should therefore be ignored
    const content = JSON.stringify(["qID-1", "id-does-not-exist", "qID-4"]);

    const file = {
      contents: Cypress.Buffer.from(content),
      fileName: "repeatio-marked-types_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const localStorageMarked = JSON.parse(localStorage.getItem("repeatio-marked-types_1"));
        expect(localStorageMarked).to.deep.equal(["qID-1", "qID-3", "qID-4"]);
      });

    //TODO expect toastify to be visible
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();

    cy.contains("3 Questions").should("be.visible");
  });

  it("should add imported items to the localStorage if there are more items in the import than the original storage", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    const content = JSON.stringify(["qID-2", "qID-4", "qID-5", "qID-6"]);

    const file = {
      contents: Cypress.Buffer.from(content),
      fileName: "repeatio-marked-types_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const localStorageMarked = JSON.parse(localStorage.getItem("repeatio-marked-types_1"));
        expect(localStorageMarked).to.deep.equal(["qID-1", "qID-3", "qID-2", "qID-4", "qID-5", "qID-6"]);
      });
  });

  it("should keep the original localStorage if the import is empty", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    const content = JSON.stringify([]);

    const file = {
      contents: Cypress.Buffer.from(content),
      fileName: "repeatio-marked-types_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const localStorageMarked = JSON.parse(localStorage.getItem("repeatio-marked-types_1"));
        expect(localStorageMarked).to.deep.equal(["qID-1", "qID-3"]);
      });
  });

  it("should add items to the localStorage if there are no old items in the localStorage before", () => {
    cy.clearLocalStorage();

    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    const content = JSON.stringify(["qID-2", "qID-4", "qID-5"]);

    const file = {
      contents: Cypress.Buffer.from(content),
      fileName: "repeatio-marked-types_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const localStorageMarked = JSON.parse(localStorage.getItem("repeatio-marked-types_1"));
        expect(localStorageMarked).to.deep.equal(["qID-2", "qID-4", "qID-5"]);
      });
  });

  it("should keep marked Questions in localStorage the same if the import only contains duplicates", () => {
    cy.get("article[data-cy='Bookmarked Questions']").find("button.popover-button").click();
    //Notice these values are only duplicates (but in different order that the fixture)
    const content = JSON.stringify(["qID-3", "qID-1"]);

    const file = {
      contents: Cypress.Buffer.from(content),
      fileName: "repeatio-marked-types_1.json",
      mimeType: "application/json",
      lastModified: Date.now(),
    };

    cy.get("input[type=file]")
      .selectFile(file, { force: true })
      .should(() => {
        const localStorageMarked = JSON.parse(localStorage.getItem("repeatio-marked-types_1"));
        expect(localStorageMarked).to.deep.equal(["qID-1", "qID-3"]);
      });
  });
});
