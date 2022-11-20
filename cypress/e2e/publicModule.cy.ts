/// <reference types="cypress" />

describe("Test the module that is provided by the public folder", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display module", () => {
    cy.contains("Question Types (types_1)").should("be.visible");
  });

  it("should answer all questions in public module", () => {
    cy.contains("View").click();

    cy.contains("Question Types (types_1)").should("be.visible");
    //Click on start in practice
    cy.contains("Practice").parent().parent().contains("Start").click();

    //Multiple Choice
    cy.contains("Exactly one option can be correct").click();
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Multiple Response
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.contains("All options can be correct").click();
    cy.contains("One option can be correct").click();
    cy.contains("One or more options can be correct").click();
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Gap Text
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.get("#input-wrapper-0").find("input").type("gaps");
    cy.get("#input-wrapper-1").find("input").type("correct");
    cy.get("#input-wrapper-2").find("input").type("not");
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Gap Text Dropdown
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.get("#select-wrapper-0").find("select").select("Dropdown");
    cy.get("#select-wrapper-1").find("select").select("50%");
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Extended Match
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.contains("7+4").parent().parent().find("button").click();
    cy.contains("11").parent().parent().find("button").click();
    cy.contains("Hello").parent().parent().find("button").click();
    cy.contains("World").parent().parent().find("button").click();
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Tables
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.get("#select-wrapper-0").find("select").select("1.8 Mio");
    cy.get("#select-wrapper-1").find("select").select("1.5 Mio");
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Check if back at beginning
    cy.contains("ID: qID-1");
  });
});
