/// <reference types="cypress" />

import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";
import { Question } from "../../Question";
import { ExtendedMatch, IExtendedMatch } from "./ExtendedMatch";

import "../../../../index.css";
import "../../Question.css";

import { IParams } from "../../../../utils/types";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

const defaultMockOptions = {
  leftSide: [
    {
      id: "left-0",
      text: "left 0",
    },
    {
      id: "left-1",
      text: "left 1",
    },
  ],
  rightSide: [
    {
      id: "right-0",
      text: "right 0",
    },
    {
      id: "right-1",
      text: "right 1",
    },
  ],
  correctMatches: [],
};

describe("Extended Match component", () => {
  it("should render 4 elements inside the Extended Match component", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);
    cy.get(".ext-match-element").should("have.length", 4);
  });

  it("should not create a line if clicking just one element", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='left-1']").click();
    cy.get("svg.svg-element>g").should("not.exist");
  });

  it("should create a line between two elements (left side first)", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-left-side").find(".ext-match-element-circle").first().click();
    cy.get(".ext-match-right-side").find(".ext-match-element-circle").first().click();

    cy.get("svg.svg-element>g").should("have.length", 1);

    cy.get("svg.svg-element line")
      .should("have.attr", "x1", 0)
      .and("have.attr", "y1", 25)
      .and("have.attr", "x2", 80)
      .and("have.attr", "y2", 25);
  });

  it("should create a line between two elements (right side first)", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get("line#left-0_right-0_line").should("exist");
  });

  it("should create multiple lines", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='left-1']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get("line#left-0_right-0_line").should("exist");
    cy.get("line#left-1_right-1_line").should("exist");

    cy.get("#element-left-0")
      .invoke("outerHeight")
      .then((left0OuterHeight) => {
        cy.get("#element-left-0").then((element) => {
          const y = (left0OuterHeight ?? 0) / 2 + element[0].getBoundingClientRect().top;

          cy.get("#left-0_right-0_line").should("have.attr", "y1", y);
        });
      });
  });

  it("should create multiple lines for one element", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='left-0']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get("line#left-0_right-0_line").should("exist");
    cy.get("line#left-0_right-1_line").should("exist");
  });

  it("should choose the last point for a line if clicking on right side twice", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get("line#left-0_right-0_line").should("exist");
  });

  it("should choose the last point for a line if clicking on left side twice", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='left-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();
    cy.get(".ext-match-element-circle[data-ident='right-0']").click();

    cy.get("line#left-0_right-0_line").should("exist");
  });

  it("should not render duplicate lines (left point first)", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='left-0']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get(".ext-match-element-circle[data-ident='left-1']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get(".ext-match-element-circle[data-ident='left-1']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get("line#left-0_right-1_line").should("exist").and("have.length", 1);
    cy.get("line#left-1_right-1_line").should("exist").and("have.length", 1);
    cy.get("svg.svg-element>g").should("have.length", 2);
  });

  it("should not render duplicate lines (right point first)", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get("line#left-0_right-1_line").should("exist").and("have.length", 1);
    cy.get("line#left-1_right-1_line").should("exist").and("have.length", 1);
    cy.get("svg.svg-element>g").should("have.length", 2);
  });

  it("should not render duplicate lines if first line is a duplicate", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='left-0']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get(".ext-match-element-circle[data-ident='left-0']").click();
    cy.get(".ext-match-element-circle[data-ident='right-1']").click();

    cy.get("line#left-0_right-1_line").should("exist").and("have.length", 1);
    cy.get("svg.svg-element>g").should("have.length", 1);
  });

  it("should select an element if clicking on it and highlight the opposite side", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-left-side")
      .find(".ext-match-element-circle")
      .first()
      .click()
      .should("have.class", "highlight-single-circle");

    cy.get(".ext-match-right-side").should("have.class", "highlight-all-right-circles");
  });

  it("should disable all elements if the form is disabled", () => {
    cy.mount(<ExtendedMatch formDisabled={true} options={defaultMockOptions} />);
    cy.get("button.ext-match-element-circle").should("be.disabled");
  });

  it("should remove a line", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get("#left-0_right-0_remove-btn").click();

    cy.get("line#left-0_right-0_line").should("not.exist");
  });

  it("should remove the one correct line", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get("#left-0_right-0_remove-btn").click({ force: true });

    cy.get("svg.svg-element>g").should("have.length", 1);
    cy.get("line#left-0_right-0_line").should("not.exist");
  });

  it("should remove one line from one element", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get("#left-0_right-0_remove-btn").click();

    cy.get("svg.svg-element>g").should("have.length", 1);
    cy.get("line#left-0_right-0_line").should("not.exist");
  });

  it("should remove all lines if clicking on Remove all lines", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.contains("button", "Remove all lines").click();

    cy.get("svg.svg-element>g").should("have.length", 0);
    cy.get("line#left-0_right-0_line").should("not.exist");
    cy.get("line#left-0_right-1_line").should("not.exist");
  });

  it("should redraw the lines if the viewport changes", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-left-side").find(".ext-match-element").first().find("button").click();
    cy.get(".ext-match-right-side").find(".ext-match-element").last().find("button").click();

    cy.viewport(700, 500);
    cy.get(".line-g").find("line").should("have.attr", "y2", 95).and("have.attr", "x2", 112);
  });

  it("should increase the radius of the remove line button if hovering the line", () => {
    cy.mount(<ExtendedMatch formDisabled={false} options={defaultMockOptions} />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".line-g").realHover({ position: "center" }).find("circle").should("have.css", "r", "9px");
  });

  it("should support markdown ", () => {
    const options = {
      leftSide: [
        {
          id: "left-0",
          text: "**left 0**",
        },
      ],
      rightSide: [
        {
          id: "right-0",
          text: "**right 0**",
        },
      ],
      correctMatches: [],
    };

    cy.mount(<ExtendedMatch formDisabled={false} options={options} />);
    cy.contains("strong", "left 0");
    cy.contains("strong", "right 0");
  });

  it("should not crash if options are empty", () => {
    const options = {};

    cy.mount(<ExtendedMatch formDisabled={false} options={options as IExtendedMatch} />);
    cy.get(".question-extended-match").should("exist");
  });
});

//Setup Router to access context and useParams
const RenderQuestionWithRouter = ({ moduleID, questionID }: Required<IParams>) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=practice&order=chronological`]}>
      <main style={{ marginTop: 0 }}>
        <Routes>
          <Route
            path='/module/:moduleID/question/:questionID'
            element={
              <QuestionIdsProvider>
                <Question />
              </QuestionIdsProvider>
            }
          />
        </Routes>
      </main>
    </MemoryRouter>
  );
};

describe("Extended Match component inside Question component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-extended_match.json");
  });

  it("should render component with 5 elements", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
    cy.get(".ext-match-element").should("have.length", 5);
  });

  /* Reset */
  it("should reset the lines if clicking on the reset button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get("svg.svg-element > g").should("have.length", 2);

    cy.get("button[aria-label='Reset Question']").click();
    cy.get("svg.svg-element > g").should("have.length", 0);
  });

  it("should keep order of items after reset button click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get("button[aria-label='Reset Question']").click();

    let elementsBeforeReset: string[] = [];

    cy.get(".extended-match-grid")
      .find(".ext-match-element-text")
      .each(($els) => {
        elementsBeforeReset.push($els.text());
      });

    // Reset
    cy.get("button[aria-label='Reset Question']").click();

    const elementsAfterReset: string[] = [];

    cy.get(".extended-match-grid")
      .find(".ext-match-element-text")
      .each(($els) => {
        elementsAfterReset.push($els.text());
      })
      .should(() => {
        expect(elementsBeforeReset).to.deep.equal(elementsAfterReset);
      });
  });

  it("should remove the highlight on reset click ", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();

    // Reset question
    cy.get("button[aria-label='Reset Question']").click();

    cy.get("button[data-ident='right-0']").should("not.have.class", "highlight-single-circle");

    // Assert that opposite side isn't highlighted
    cy.get(".ext-match-left-side").should("not.have.class", "highlight-all-left-circles");
  });

  /* Retry */
  it("should reset the lines if clicking on the retry button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get("button[type='submit']").click(); //submit question

    cy.get("button[aria-label='Retry Question']").click();
    cy.get("svg.svg-element > g").should("have.length", 0);
  });

  it("should enable all buttons after retry click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    // Submit Question and click retry
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that all input elements are disabled
    cy.get("section.question-user-response").find("button").should("be.enabled");
  });

  it("should randomize order of items after retry button click", { retries: 10 }, () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get("button[type='submit']").click();

    let elementsBeforeRetry: string[] = [];

    cy.get(".extended-match-grid")
      .find(".ext-match-element-text")
      .each(($els) => {
        elementsBeforeRetry.push($els.text());
      });

    // Retry
    cy.get("button[aria-label='Retry Question']").click();

    const elementsAfterRetry: string[] = [];

    cy.get(".extended-match-grid")
      .find(".ext-match-element-text")
      .each(($els) => {
        elementsAfterRetry.push($els.text());
      })
      .should(() => {
        expect(elementsBeforeRetry).not.to.deep.equal(elementsAfterRetry);
      });
  });

  it("should remove the highlight on correction click ", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get(".ext-match-element-circle[data-ident='right-0']").click();

    // Reset question
    cy.get("button[type='submit']").click();

    cy.get("button[data-ident='right-0']").should("not.have.class", "highlight-single-circle");

    // Assert that opposite side isn't highlighted
    cy.get(".ext-match-left-side").should("not.have.class", "highlight-all-left-circles");
  });

  it("should enable all buttons after submitting and navigating to the next question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
    // Submit Question and navigate to next
    cy.get("button[type='submit']").click().click();

    // Assert that all input elements are disabled
    cy.get("section.question-user-response").find("button").should("be.enabled");
  });

  it("should clear the values if navigating to the next question and use the new values for correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
    cy.get(".ext-match-element-circle[data-ident='right-2']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Navigate to new site
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that all lines have been cleared
    cy.get("svg.svg-element > g").should("have.length", 0);

    // Click the correct items
    cy.get(".ext-match-element-circle[data-ident='right-0']").click();
    cy.get(".ext-match-element-circle[data-ident='left-0']").click();

    cy.get(".ext-match-element-circle[data-ident='right-1']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    cy.get("button[type='submit']").click();

    // Check correction
    cy.contains("Yes, that's correct!").should("exist");
  });

  it("should reset the highlight on navigation", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
    cy.get(".ext-match-element-circle[data-ident='right-0']").click();

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Navigate to new site
    cy.get("button[aria-label='Navigate to next Question']").click();

    cy.get("button[data-ident='right-0']").should("not.have.class", "highlight-single-circle");

    // Assert that opposite side isn't highlighted
    cy.get(".ext-match-left-side").should("not.have.class", "highlight-all-left-circles");
  });

  it("should prevent adding and deleting of line after submit", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

    cy.get(".ext-match-element-circle[data-ident='right-2']").click();
    cy.get(".ext-match-element-circle[data-ident='left-1']").click();

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Submit Question
    cy.get("button[type='submit']").click();

    // Try to click on line delete button
    cy.get("#left-1_right-2_remove-btn").click();

    // Assert that the line is still there
    cy.get(".question-user-response svg.svg-element > g").should("have.length", 1);
    cy.get("#left-1_right-2_line").should("exist");

    // Try to add a new line
    cy.get("button.ext-match-element-circle[data-ident='left-0']");
    cy.get("button.ext-match-element-circle[data-ident='right-0']");

    // Assert that sill only one line rendered
    cy.get(".question-user-response svg.svg-element > g").should("have.length", 1);
  });

  it("should not show any circles to remove a line inside the question correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-4' />);

    // Submit Question
    cy.get("button[type='submit']").click();

    cy.get(".extended-match-grid-solution").find(".line-g").find("circle").should("not.exist");
  });

  context("Question correction on submit", { viewportHeight: 800, viewportWidth: 800 }, () => {
    it("should show that the answer is correct if the answer is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as correct if the user choose the correct values and removed any incorrect ones", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      cy.get(".ext-match-element-circle[data-ident='right-1']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Click the incorrect items
      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Remove incorrect line
      cy.get("#left-1_right-2_remove-btn").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as correct if there are no values", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-3' />);

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as correct if the user choose the correct lines and one element of a line", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);
      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Click a circle to create an incomplete line
      cy.get(".ext-match-element-circle[data-ident='right-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as incorrect if no lines were added", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should show the answer as incorrect if only one correct line was added", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-1' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should show the answer as incorrect if one correct and one incorrect line was added", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      // Click the incorrect items
      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should show the answer as incorrect if two correct lines and one incorrect line were added", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-1']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Click the incorrect items
      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should have the same order of elements in answer area and correction ", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Submit Question
      cy.get("button[type='submit']").click();

      cy.get(".extended-match-grid")
        .find(".ext-match-element-text")
        .then(($els) => {
          // jQuery => Array => get "innerText" from each
          // https://glebbahmutov.com/cypress-examples/recipes/get-text-list.html
          return Cypress._.map(Cypress.$.makeArray($els), "innerText");
        })
        .then((textArray: string[]) => {
          cy.get(".extended-match-grid-solution .ext-match-element-text")
            .then(($els) => {
              return Cypress._.map(Cypress.$.makeArray($els), "innerText");
            })
            .should("deep.equal", textArray);
        });
    });

    it("should show the correct lines in the answer correction", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Submit Question
      cy.get("button[type='submit']").click();

      cy.get("#left-0_right-0_line-static").should("exist");
      cy.get("#left-0_right-0_line-static").should("exist");
    });

    it("should work if moving from a question in two elements to multiple elements", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-4' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      // Submit the question
      cy.get("button[type='submit']").click();

      // Click show navigation button that just exists on small displays
      cy.get("body").then((body) => {
        if (body.find("button[aria-label='Show Navigation']").length > 0) {
          cy.get("button[aria-label='Show Navigation']").click();
        }
      });

      cy.get("input[aria-label='Navigate to question number']").clear().type("2");

      // Assert that the correction is hidden
      cy.get("section.question-correction ").should("not.exist");

      // Assert that the lines reset
      cy.get("svg.svg-element>g").should("have.length", 0);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-1']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit the question
      cy.get("button[type='submit']").click();

      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as correct if the first answer was incorrect but the user reset and then answered correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Click the incorrect items
      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      cy.get(".ext-match-element-circle[data-ident='right-1']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as incorrect if the first answer was correct but the user reset and answered incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='extended_match' questionID='em-2' />);

      // Click the correct items
      cy.get(".ext-match-element-circle[data-ident='right-0']").click();
      cy.get(".ext-match-element-circle[data-ident='left-0']").click();

      cy.get(".ext-match-element-circle[data-ident='right-1']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Click the incorrect items
      cy.get(".ext-match-element-circle[data-ident='right-2']").click();
      cy.get(".ext-match-element-circle[data-ident='left-1']").click();

      // Submit Question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("p", "No, that's false! The correct answer is:").should("exist");
    });
  });
});
