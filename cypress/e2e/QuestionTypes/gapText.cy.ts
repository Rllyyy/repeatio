// This is the test file for integration test
// The component tests can be found in the file of the component
/// <reference types="cypress" />

describe("Gap Text", () => {
  //Before each test set fixture as localStorage
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
  });

  it("should render input and show answer as correct if values are correct", () => {
    cy.visit("/module/gap_text/question/gt-1");

    cy.get(".question-gap-text").find("input").should("have.length", 1);
    cy.get(".question-gap-text").find("input").type("first").should("have.value", "first");
    cy.get("button[type='submit']").click();

    cy.contains("Yes, that's correct!");
    cy.get(".question-gap-text").find("input").should("have.css", "border-color", "rgb(0, 128, 0)");
  });

  it("should show answer as correct if values are not entered in chronological order", () => {
    cy.visit("/module/gap_text/question/gt-3");

    cy.get(".question-gap-text").find("input").last().type("1").should("have.value", "1");
    cy.get(".question-gap-text").find("input").first().type("third").should("have.value", "third");
    cy.get(".question-gap-text").find("input").eq(1).type("contains").should("have.value", "contains"); //second input

    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!");
  });

  it("should show answer false if input is false", () => {
    cy.visit("/module/gap_text/question/gt-1");
    cy.get(".question-gap-text").find("input").type("this is false");
    cy.get("button[type='submit']").click();

    cy.contains("No, that's false!");
    cy.get(".question-gap-text").find("input").should("have.css", "border-color", "rgb(255, 0, 0)");
    cy.contains("This is the first question").should("exist");
  });

  it("should show answer false if input is empty", () => {
    cy.visit("/module/gap_text/question/gt-1");
    cy.get("button[type='submit']").click();

    cy.contains("No, that's false!");
    cy.get(".question-gap-text").find("input").should("have.css", "border-color", "rgb(255, 0, 0)");
  });

  it("should not submit the question on enter key", () => {
    cy.visit("/module/gap_text/question/gt-1");
    cy.get(".question-gap-text").find("input").type("{enter}");
    cy.get("section.question-correction").should("not.exist");
  });

  it("should support multiple correct answers in one input", () => {
    cy.visit("/module/gap_text/question/gt-3");
    cy.get(".question-gap-text").find("input").first().type("third").should("have.value", "third");
    cy.get(".question-gap-text").find("input").eq(1).type("contains").should("have.value", "contains"); //second input
    cy.get(".question-gap-text").find("input").last().type("1").should("have.value", "1");

    cy.get("button[type='submit']").click(); //submit
    cy.get("button[aria-label='Retry Question']").click(); //reset

    cy.get(".question-gap-text").find("input").first().type("third").should("have.value", "third");
    cy.get(".question-gap-text").find("input").eq(1).type("contains").should("have.value", "contains"); //second input
    cy.get(".question-gap-text").find("input").last().type("one").should("have.value", "one");

    cy.get("button[type='submit']").click(); //submit

    cy.contains(
      "This is the third question. It contains multiple gaps. Even gaps that have more than one; 1 correct answer."
    );
  });

  it("should clear question correction after navigation", () => {
    cy.visit("/module/gap_text/question/gt-1");

    cy.get(".question-gap-text").find("input").type("first");
    cy.get("button[type='submit']").click().click();

    cy.get("section.question-correction").should("not.exist");
  });

  it("should reset the values if clicking on reset button", () => {
    cy.visit("/module/gap_text/question/gt-1");

    cy.get(".question-gap-text").find("input").type("reset this");
    cy.get("button[aria-label='Reset Question']").click();
    cy.get(".question-gap-text").find("input").should("not.have.value", "reset this").and("have.value", "");
  });

  it("should reset the values if clicking on retry button", () => {
    cy.visit("/module/gap_text/question/gt-1");

    cy.get(".question-gap-text").find("input").type("retry this");
    cy.get("button[type='submit']").click(); //submit question
    cy.get("button[aria-label='Retry Question']").click(); //click retry
    cy.get(".question-gap-text").find("input").should("not.have.value", "retry this").and("have.value", "");

    //Check to type again
    cy.get(".question-gap-text").find("input").type("first").should("have.value", "first");
    cy.get("button[type='submit']").click();

    cy.contains("Yes, that's correct!");
  });

  it("should reset the question fields after question answer and navigation using the question-check-next button", () => {
    cy.visit("/module/gap_text/question/gt-1");

    cy.get(".question-gap-text").find("input").type("This should be cleared");
    cy.get("button[type='submit']").click().click();

    //second question
    cy.get(".question-gap-text").find("input").should("have.value", "");
  });

  it("should reset the input fields on navigation (no submit)", () => {
    cy.visit("/module/gap_text/question/gt-1");
    cy.get(".question-gap-text").find("input").type("navigate to next");
    cy.get("button[aria-label='Navigate to next Question']").click();

    //second question
    cy.get(".question-gap-text").find("input").should("have.value", "");
    cy.get("button[aria-label='Navigate to previous Question']").click(); //navigate back to first question using the buttons at the bottom

    //first question
    cy.get(".question-gap-text").find("input").should("have.value", "");
  });

  it("should reset the input fields on navigation (after submit)", () => {
    cy.visit("/module/gap_text/question/gt-1");
    cy.get(".question-gap-text").find("input").type("navigate to next");
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Navigate to next Question']").click();

    //second question
    cy.get(".question-gap-text").find("input").should("have.value", "");
  });

  it("should work after moving from a question with one input to multiple inputs", () => {
    cy.visit("/module/gap_text/question/gt-2");
    cy.get(".question-gap-text").find("input").type("second");

    cy.get("button[type='submit']").click().click();

    cy.get(".question-gap-text").find("input").first().type("third").should("have.value", "third");
    cy.get(".question-gap-text").find("input").eq(1).type("contains").should("have.value", "contains"); //second input
    cy.get(".question-gap-text").find("input").last().type("1").should("have.value", "1");
  });

  it("should render text even if there is no gap", () => {
    cy.visit("/module/gap_text/question/gt-4");
    cy.contains("This line does not contain any gaps").should("exist");
  });

  it("should render list", () => {
    cy.visit("/module/gap_text/question/gt-5");
    cy.get(".question-user-response ul").find("li").should("have.length", 2);
    cy.contains("p", "This should not be a list item").should("exist");
  });

  it("should render list after content without any white space", () => {
    cy.visit("/module/gap_text/question/gt-6");
    cy.get(".question-user-response ul").find("li").should("have.length", 2);
    cy.get(".question-gap-text").invoke("height").should("be.lessThan", 150);
  });

  it("should render markdown table", () => {
    cy.visit("/module/gap_text/question/gt-7");

    //Testing that white-space isn't pushing the table out of view
    cy.get("table").should("exist").and("be.visible");
    cy.get(".question-gap-text").invoke("height").should("be.lessThan", 180);
    cy.get("td .input-wrapper").find("input").type("work").should("have.value", "work");
    cy.contains("Text below table").should("be.visible");
    cy.contains("strong", "table").should("exist");
    cy.get("button[type='submit']").click();

    cy.contains("Yes, that's correct!").should("exist");
    cy.get(".question-correction").invoke("height").should("be.greaterThan", 47);
  });

  it("should render html table", () => {
    cy.visit("/module/gap_text/question/gt-8");
    cy.get("table").should("exist").and("be.visible");
    cy.get(".question-gap-text").invoke("height").should("be.lessThan", 180);
    cy.get("td .input-wrapper").find("input").type("work").should("have.value", "work");
    cy.contains("em", "italic");

    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
    cy.get(".question-correction").invoke("height").should("be.greaterThan", 47);
  });

  it("should allow multiple blank spaces in front of the actual test", () => {
    cy.visit("/module/gap_text/question/gt-9");
    cy.contains("Should not break with a lot of white-spaces.").should("exist");
  });

  it("should render markdown list if the first item is a gap", () => {
    cy.visit("/module/gap_text/question/gt-10");
    cy.contains("li", "List").should("exist");
    cy.get(".question-gap-text").find("input").should("exist");
  });
});

export {};
