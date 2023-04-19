/// <reference types="cypress" />

/* These e2e tests only cover tests related to the url. All other tests are handled by component tests  */

describe("Question", () => {
  it("should show question component with mode practice and order chronological when navigating from module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");

    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.contains("ID: qID-1").should("exist");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should show question with mode practice and order random", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1");

    cy.get("article[data-cy='Practice']").contains("button", "Random").click();
    cy.get(".question-id").should("exist");

    // Assert that the url correctly updated
    cy.url().should("include", "?mode=practice&order=random");
  });

  it("should redirect to mode practice and order chronological if both values are undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to mode practice if value is undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?order=random");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=random");
  });

  it("should redirect to order chronological if value is undefined", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to mode practice if the value is not practice or bookmarked", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=incorrectValue&order=chronological");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should redirect to order chronological if the value is not practice or bookmarked", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice&order=incorrectValue");

    // Assert that the url correctly updated
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");
  });

  it("should hide the question correction for multiple choice questions if navigating back using the browser", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.visit("/module/multiple_choice/question/mc-1?mode=practice&order=chronological");

    // navigate to next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Select a value
    cy.contains("label", "False").click();

    // Submit question
    cy.get("button[aria-label='Check Question']").click();

    // navigate back using the browsers back function
    cy.go("back");

    // Assert that the question correction disappeared
    cy.get("section.question-correction").should("not.exist");

    // Assert that all input elements are enabled and not checked
    cy.get(".question-user-response")
      .find("input[type=radio]")
      .each(($radioItem) => {
        cy.wrap($radioItem).should("be.enabled").and("not.be.checked");
      });
  });

  it("should hide the question correction for multiple response questions if navigating back using the browser", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");
    cy.visit("/module/multiple_response/question/mr-1?mode=practice&order=chronological");

    // navigate to next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Click a answer
    cy.contains("label", "False").click();

    // Submit question
    cy.get("button[aria-label='Check Question']").click();

    // navigate back using the browsers back function
    cy.go("back");

    // Assert that the question correction disappeared
    cy.get("section.question-correction").should("not.exist");

    // Assert that all input elements are enabled and not checked
    cy.get(".question-user-response")
      .find("input[type=checkbox]")
      .each(($checkboxItem) => {
        cy.wrap($checkboxItem).should("be.enabled").and("not.be.checked");
      });
  });

  it("should hide the question correction for gap text questions if navigating back using the browser", () => {
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.visit("/module/gap_text/question/gt-1?mode=practice&order=chronological");

    // navigate to next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Click a answer
    cy.get("section.question-user-response").find("input[type='text']").type("incorrect");

    // Submit question
    cy.get("button[aria-label='Check Question']").click();

    // navigate back using the browsers back function
    cy.go("back");

    // Assert that the question correction disappeared
    cy.get("section.question-correction").should("not.exist");

    // Assert that all input elements are enabled and don't have a value
    cy.get(".question-user-response")
      .find("input[type='text']")
      .each(($inputTextItem) => {
        cy.wrap($inputTextItem).should("be.enabled").and("not.have.value");
      });
  });

  /* Navigation */
  it("should update the url when clicking the next button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice&order=chronological");

    cy.get("button[aria-label='Check Question']").click();
    cy.get("button[aria-label='Next Question'").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-2?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-2").should("exist");
  });

  it("should navigate to previous question url when clicking the previous question button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-2?mode=practice&order=chronological");

    cy.get("button[aria-label='Navigate to previous Question']").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-1").should("exist");
  });

  it("should navigate to first question when clicking the to first question button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-4?mode=practice&order=chronological");

    cy.get("button[aria-label='Navigate to first Question']").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-1").should("exist");
  });

  it("should navigate to last question when clicking the to last question button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-2?mode=practice&order=chronological");

    cy.get("button[aria-label='Navigate to last Question']").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-6?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-6").should("exist");
  });

  it("should navigate to the last question if clicking previous on first question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice&order=chronological");

    cy.get("button[aria-label='Navigate to previous Question']").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-6?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-6").should("exist");
  });

  it("should navigate to the first question if clicking next on last question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-6?mode=practice&order=chronological");

    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the url changed
    cy.url().should("include", "/module/cypress_1/question/qID-1?mode=practice&order=chronological");

    // Assert that the new question loaded
    cy.contains("ID: qID-1").should("exist");
  });
});

describe("Question edit", () => {
  it(
    "should close the question editor if navigating to a different question using the browsers history",
    { scrollBehavior: false },
    () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.visit("/module/cypress_1/question/qID-1?mode=practice");

      // navigate to next question
      cy.get("button[aria-label='Navigate to next Question']").click();

      // Open editor
      cy.get("button[aria-label='Edit Question']").click();

      // navigate back
      cy.go("back");

      // Assert that the edit modal closed
      cy.get(".ReactModal__Overlay--after-open").should("not.exist");
      cy.contains("h1", "Edit Question").should("not.exist");
    }
  );
});

describe("Question deletion", () => {
  it("should redirect to module overview if all questions in the current context get deleted", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1?mode=practice");
    cy.get("button[aria-label='Delete Question']").click().click().click().click().click().click();

    // Assert that the url changed to the module overview
    cy.url().should("include", "module/cypress_1");

    // Assert that the module overview is displayed
    cy.contains("h1", "Cypress Fixture Module (cypress_1)").should("exist");
  });
});

export {};
