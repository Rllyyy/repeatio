/// <reference types="cypress" />

describe("Show questions of a module", () => {
  context("cypress_1 fixture", () => {
    beforeEach(() => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    });

    it("should show component when navigating from the module overview", () => {
      cy.visit("/module/cypress_1");
      cy.get("a[aria-label='View all Questions']").click();

      cy.url().should("include", "/module/cypress_1/all-questions");
      cy.contains("All Questions").should("exist");
      cy.get(".question-table > div").should("have.length", 6);
    });

    it(
      "should scroll to top if navigating from the module overview",
      { scrollBehavior: false, viewportHeight: 500, viewportWidth: 600 },
      () => {
        cy.visit("/module/cypress_1");
        cy.contains("Question Overview").scrollIntoView();
        cy.get("a[aria-label='View all Questions']").click();

        cy.contains("All Questions").should("be.visible");
      }
    );

    it("should show all questions when entering the url directly", () => {
      cy.visit("/module/cypress_1/all-questions");
      cy.contains("All Questions").should("exist");
      cy.get(".question-table > div").should("have.length", 6);
    });

    it("should navigate to the question if clicking on an arrow inside an item", () => {
      cy.visit("/module/cypress_1/all-questions");
      cy.get("#question-qID-2").find("a.link-to-question").click();
      cy.contains("Multiple Response questions have at least one correct answer.").should("exist");
      cy.url().should("include", "/module/cypress_1/question/qID-2?mode=practice&order=chronological");
    });
  });

  context("Types bookmarked fixture", () => {
    it("should reset question ids in the context when clicking arrow", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

      // Add bookmarked questions
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

      // navigate to module
      cy.visit("/module/cypress_1");

      // Visit bookmarked questions
      cy.get("article[data-cy='Bookmarked Questions']").contains("Start").click();

      // Go back in history
      cy.go("back");

      // Go to question overview
      cy.get("a[aria-label='View all Questions']").click();

      // Visit a question that is not in the bookmarked questions array
      cy.get("#question-qID-5").find("a.link-to-question").click();

      // Check if question is shown
      cy.contains("This is a question of the type Extended Match.").should("exist");
    });
  });
});

export {};
