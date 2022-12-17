/// <reference types="cypress" />

import { QuestionPoints } from "../Question";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

describe("Testing Question Points", () => {
  it("Should render the QuestionPoints component)", () => {
    cy.mount(<QuestionPoints points={undefined} />);
    cy.get(".question-points").should("exist");
  });

  it('should render "? Points" if the value is undefined', () => {
    cy.mount(<QuestionPoints points={undefined} />);
    cy.contains("? Points").should("exist");
  });

  it('should render "? Points" if the value is null', () => {
    cy.mount(<QuestionPoints points={null} />);
    cy.contains("? Points").should("exist");
  });

  it("should show 0 Points if the input is 0", () => {
    cy.mount(<QuestionPoints points={0} />);
    cy.contains("0 Points").should("exist");
  });

  it('should render "1 Point" if the value is 1', () => {
    cy.mount(<QuestionPoints points={1} />);
    cy.contains("1 Point").should("exist");
  });

  it('should render "2 Points" if the value is 2', () => {
    cy.mount(<QuestionPoints points={2} />);
    cy.contains("2 Points").should("exist");
  });

  it('should render "2.5 Points" if the given value is 2.5', () => {
    cy.mount(<QuestionPoints points={2.5} />);
    cy.contains("2.5 Points").should("exist");
  });
});
