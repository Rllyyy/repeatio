/// <reference types="cypress" />

import { IModule } from "../../src/components/module/module";
import { parseJSON } from "../../src/utils/parseJSON";
import { TSettings } from "../../src/utils/types";

describe("Test the module that is provided by the public folder", () => {
  it("should display module", () => {
    cy.visit("/");
    cy.contains("Question Types (types_1)").should("be.visible");
  });

  it("should answer all questions in public module", () => {
    cy.visit("/");

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
    cy.get("#input-0").type("gaps");
    cy.get("#input-1").type("correct");
    cy.get("#input-2").type("not");
    cy.get("body").click();
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Gap Text Dropdown
    cy.contains("Yes, that's correct!").should("not.exist");
    cy.get("#select-0").select("Dropdown");
    cy.get("#select-1").select("50%");
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
    cy.get("#select-0").select("1.8 Mio");
    cy.get("#select-1").select("1.5 Mio");
    cy.get("button[aria-label='Check Question']").click();
    cy.contains("Yes, that's correct!");
    cy.get("button[aria-label='Next Question']").click();

    //Check if back at beginning
    cy.contains("ID: qID-1");
  });

  it("should show question if directly navigating to question from an external source", () => {
    // This is for example the case if the user visits the website from the docs and he has never been to the homepage
    cy.visit("/module/types_1/question/qID-1?mode=practice&order=chronological");

    // Asset that the question renders, that the module was added and that the settings were updated
    cy.contains("ID: qID-1")
      .should("exist")
      .and(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-types_1"));
        expect(module).not.to.equal(null);

        const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));
        expect(settings?.addedExampleModule).to.equal(true);
      });
  });
});

export {};
