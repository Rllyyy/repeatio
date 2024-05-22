/// <reference types="cypress" />

/* ------------------------------------Bookmark in Module Overview ------------------------------ */
describe("Test usage of bookmarked Questions in module overview", () => {
  //Add fixture to localStorage and navigate to module url
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

  it("should changed the url to mode bookmarked on navigation", () => {
    // Add bookmarked items to localStorage
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=bookmarked&order=chronological");
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

  it("should show warning  if there are no bookmarked questions defined", () => {
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();
    cy.contains("Found 0 bookmarked questions for this module!");
  });

  it("should support removing and editing of question id while viewing bookmarked questions", () => {
    /* Szenario:
      1. View bookmarked questions
      2. Remove question from bookmarked items
      3. Edit id of this question
      4. Navigate for and back */
    // Add bookmarked items to localStorage
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();

    // Unsave the question
    cy.get("button[aria-label='Unsave Question'").click();

    // Edit the question id
    cy.get("button[aria-label='Edit Question'").click();
    cy.get("input[name='id']").type("0");
    cy.contains("button", "Update").click();

    // Assert that the question id changed
    cy.contains("ID: qID-10").should("exist");

    // Navigate to next question and back
    cy.get("button[aria-label='Navigate to next Question']").click();
    cy.contains("ID: qID-3").should("exist");
    cy.get("button[aria-label='Navigate to previous Question']").click();
    cy.contains("ID: qID-10").should("exist");
  });

  it("should start bookmarked practice with question that exists and show warning in console", () => {
    const bookmarkedFile = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.7.0",
      questions: ["invalid-id", "qID-1", "also-invalid"],
    };

    // Update the localStorage with the new item
    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(bookmarkedFile, null, "\t"));

    // Start practicing with bookmarked questions
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();

    // Assert url changed to first valid id
    cy.url().should("include", "module/cypress_1/question/qID-1?mode=bookmarked&order=chronological");

    // Assert that console logged invalid ids
    cy.get("@consoleWarn").should("be.calledWithMatch", "Couldn't find the following ids: invalid-id, also-invalid");

    cy.contains("1/1 Questions").should("exist");
  });

  it("should redirect to module if all bookmarked questions get unsaved and the practice mode changes", () => {
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Start practicing with bookmarked questions
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();

    // Remove the bookmarked questions
    cy.get("button[aria-label='Unsave Question']").click();
    cy.get("button[aria-label='Navigate to next Question']").click();
    cy.get("button[aria-label='Unsave Question']").click();

    // Click shuffle button
    cy.get("button[aria-label='Enable shuffle'").click();

    // Assert the correct redirect to the module overview
    cy.url().should("match", /.*module\/cypress_1(?![\w\/])/);
  });

  it("should redirect to a bookmarked question if the question gets unsaved and the user clicks the shuffle button", () => {
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Start practicing with bookmarked questions
    cy.get("article[data-cy='Bookmarked Questions']").contains("button", "Start").click();

    cy.get("button[aria-label='Unsave Question']").click();

    cy.get("button[aria-label='Enable shuffle'").click();

    cy.contains("ID: qID-3").should("exist");
    cy.url().should("include", "/module/cypress_1/question/qID-3?mode=bookmarked&order=random");
  });
});
