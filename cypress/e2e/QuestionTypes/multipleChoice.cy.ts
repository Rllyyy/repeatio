/// <reference types="cypress" />

describe("Multiple Choice", () => {
  //Add example module to local Storage and visit first question in module which is the multiple response question
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.visit("/module/cypress_1/question/qID-1");
  });

  //Test click on input
  it("should select radio input on click", () => {
    cy.get("label.MuiFormControlLabel-root").first().click().find("input").should("be.checked");
  });

  //Test deselection
  it("should deselect previously selected input when clicking different input", () => {
    cy.contains("All options can be correct").click().find("input").should("be.checked");
    cy.contains("Exactly one option can be correct").click().find("input").should("be.checked");
    cy.contains("All options can be correct").find("input").should("not.be.checked");
  });

  //Test deselection on reset click
  it("should deselect input when clicking retry", () => {
    cy.get("label.MuiFormControlLabel-root").first().click().find("input").should("be.checked");
    cy.get("button[aria-label='Reset Question'").click();
    cy.get("label.MuiFormControlLabel-root").first().find("input").should("not.be.checked");
  });

  //Test disable input on submit
  it("should disable all input in form after submit", () => {
    cy.get("button[type='submit']").click();
    cy.get("label.MuiFormControlLabel-root")
      .find("input[type='radio']")
      .each(($el) => {
        expect($el).to.be.disabled;
      });
  });

  //Test reenabling on retry click
  it("should enable all inputs in form after retry", () => {
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();
    cy.get("label.MuiFormControlLabel-root")
      .find("input[type='radio']")
      .each(($el) => {
        expect($el).not.to.be.disabled;
      });

    cy.get("label.MuiFormControlLabel-root").first().click().find("input").should("be.checked");
  });

  //Test question correction (answer correct)
  it("should show question correction after submit (case correction correct)", () => {
    cy.contains("Exactly one option can be correct").click();
    cy.get("button[type='submit']").click();

    cy.get("section.question-correction")
      .should("have.css", "border", "2px solid rgb(21, 104, 60)")
      .and("have.css", "backgroundColor", "rgb(145, 202, 172)");

    cy.contains("Yes, that's correct!").should("be.visible");
    cy.get(".question-correction").find("ul > li > p").should("have.text", "Exactly one option can be correct");
  });

  //Test question correction (answer false)
  it("should show question correction after submit (case correction correct)", () => {
    cy.contains("No option can be correct").click();
    cy.get("button[type='submit']").click();

    cy.get("section.question-correction")
      .should("have.css", "border", "2px solid rgb(173, 31, 15)")
      .and("have.css", "backgroundColor", "rgb(241, 177, 170)");

    cy.contains("No, that's false! The correct answer is:").should("be.visible");
    cy.get(".question-correction").find("ul > li > p").should("have.text", "Exactly one option can be correct");
  });

  //Test outline after submit
  it("should outline correct answer in green after submit if user selection is correct", () => {
    cy.contains("Exactly one option can be correct").click();
    cy.get("button[type='submit']").click();
    cy.get("label[data-testid='option-3']").should("have.css", "outline", "rgb(0, 128, 0) solid 1px");
  });

  //Test outline after submit
  it("should outline correct answer and user selection in red after submit if user selection is false", () => {
    cy.contains("No option can be correct").click();
    cy.get("button[type='submit']").click();
    cy.get("label[data-testid='option-2']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
    cy.get("label[data-testid='option-3']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
  });

  //Test if the out animation for material uis radios is removed
  it("should have no material ui out animation", () => {
    cy.get("input[type='radio']")
      .not("checked")
      .parent()
      .find("span")
      .first()
      .find("svg")
      .last()
      .should("have.css", "transition", "transform 0s cubic-bezier(0.4, 0, 1, 1) 0s");
  });
});

export {};

/** //TODO testing
 * - Tabbing
 *
 */
