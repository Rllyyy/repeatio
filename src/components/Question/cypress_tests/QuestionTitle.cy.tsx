/// <reference types="cypress" />

import { QuestionTitle } from "../Question";
import "../../../index.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

describe("Question Title Component", () => {
  it("should render title of question", () => {
    cy.mount(<QuestionTitle title='This is the title of the question' />);
    cy.contains("This is the title of the question");
  });

  it("should render markdown link with external href and _blank attribute", () => {
    cy.mount(
      <QuestionTitle title='This is a link to the project on [GitHub](https://www.github.com/Rllyyy/repeatio)' />
    );
    cy.contains("a", "GitHub")
      .should("have.attr", "href", "https://www.github.com/Rllyyy/repeatio")
      .and("have.attr", "target", "_blank");
  });

  it("should transform markdown link to start with https if protocol isn't given", () => {
    cy.mount(<QuestionTitle title='This is a link to the project on [GitHub](www.github.com/Rllyyy/repeatio)' />);
    cy.contains("a", "GitHub").should("have.attr", "href", "https://www.github.com/Rllyyy/repeatio");
  });

  it("should transform markdown link to start with https if protocol and subdomain (www) isn't given", () => {
    cy.mount(<QuestionTitle title='This is a link to the project on [GitHub](github.com/Rllyyy/repeatio)' />);
    cy.contains("a", "GitHub").should("have.attr", "href", "https://github.com/Rllyyy/repeatio");
  });
});
