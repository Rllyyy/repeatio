/// <reference types="cypress" />

import { Question, QuestionBottom } from "../Question";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IParams, ISearchParams } from "../../../utils/types";
import { QuestionIdsProvider } from "../../module/questionIdsContext";

import "../../../index.css";
import { CustomToastContainer } from "../../toast/toast";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

interface IRenderComponentWithRouter {
  component: JSX.Element;
  order: NonNullable<ISearchParams["order"]>;
  mode: NonNullable<ISearchParams["mode"]>;
  moduleID: Required<IParams["moduleID"]>;
  questionID: Required<IParams["questionID"]>;
}

const RenderComponentWithRouter = ({ component, moduleID, questionID, mode, order }: IRenderComponentWithRouter) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=${mode}&order=${order}`]}>
      <main style={{ marginTop: 0, padding: 0 }}>
        <Routes>
          <Route
            path='/module/:moduleID/question/:questionID'
            element={<QuestionIdsProvider>{component}</QuestionIdsProvider>}
          />
        </Routes>
      </main>
      <CustomToastContainer />
    </MemoryRouter>
  );
};

describe("Question Bottom Component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
  });

  it("should render QuestionBottom component", () => {
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );

    // Assert that the component inside the Question exists
    cy.get("div.question-bottom").should("exist");
  });

  it("should disable the buttons if the question isn't found", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        moduleID='invalid'
        questionID='invalid'
        order='chronological'
        mode='practice'
      />
    );

    // Assert that the buttons are disabled
    cy.get("div.question-bottom").find("button.question-check-next").should("be.disabled");
    cy.get("div.question-bottom").find("button.question-retry").should("be.disabled");
  });

  it("should not render the question actions and navigation and have class collapsed on component widths <= 650", () => {
    cy.viewport(650, 720);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );

    // Assert that question-bottom has class collapsed
    cy.get("div.question-bottom").should("have.class", "collapsed");

    // Assert that the actions and navigation aren't visible
    cy.get(".question-actions-navigation-wrapper").should("not.exist");
  });

  it("should render the question actions and navigation and have class expanded on a component widths >= 651", () => {
    cy.viewport(651, 720);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );

    // Assert that the question-bottom has class expanded
    cy.get("div.question-bottom").should("have.class", "expanded");

    // Assert that the actions and navigation exists
    cy.get(".question-actions-navigation-wrapper").should("exist");
  });

  it("should collapse the bottom if resizing the viewport", () => {
    cy.viewport(750, 720);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );
    cy.viewport(600, 720);

    // Assert that question-bottom has class collapsed
    cy.get("div.question-bottom").should("have.class", "collapsed");

    // Assert that the actions and navigation aren't visible
    cy.get(".question-actions-navigation-wrapper").should("not.exist");
  });

  it("should show the question navigation and question actions on show navigation button click ", () => {
    cy.viewport(500, 500);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );
    cy.get("button[aria-label='Show Navigation']").click();
    cy.get(".question-actions-navigation-wrapper").should("exist");
  });

  it("should not render the show navigation button if the width of the question-bottom component is greater than 800", () => {
    cy.viewport(900, 720);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );
    cy.get("button[aria-label='Show Navigation']").should("not.exist");
  });

  it("should not render the show navigation button if resizing from a small viewport to a viewport greater than 800 and back", () => {
    cy.viewport(500, 500);
    cy.mount(
      <RenderComponentWithRouter
        component={
          <QuestionBottom
            disabled={false}
            handleResetQuestionComponent={() => {}}
            fetchQuestion={() => {}}
            handleResetRetryQuestion={() => {}}
            question={undefined}
            showAnswer={false}
          />
        }
        moduleID='cypress_1'
        questionID='qID-1'
        order='chronological'
        mode='practice'
      />
    );

    // Assert that the button exists
    cy.get("button[aria-label='Show Navigation']").should("exist");

    // Resize to a bigger viewport and assert that the navigation no longer exists
    cy.viewport(900, 500);
    cy.get("button[aria-label='Show Navigation']").should("not.exist");

    // Resize back to smaller viewport and assert that the navigation exists again
    cy.viewport(500, 500);
    cy.get("button[aria-label='Show Navigation']").should("exist");
  });

  it("should scroll back to top when navigating to the next question using the navigation arrow", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click arrow to go to the next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the question scrolled back to the top
    cy.contains("ID: qID-2").should("be.visible");
  });

  it.only("should scroll back to the top of the question when navigating to the next question by submitting the question again", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Check question and navigate to next question
    cy.get("button[aria-label='Check Question']").click();
    cy.get("button[aria-label='Next Question']").click();

    // Assert that the question scrolled back to the top
    cy.contains("ID: qID-2").should("be.visible");
  });

  it("should scroll back to the top of the question when navigating to the next question by using the navigation arrows after the question correction", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Check question and navigate to next question
    cy.get("button[aria-label='Check Question']").click();

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click arrow to go to the next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the question scrolled back to the top
    cy.contains("ID: qID-2").should("be.visible");
  });

  it("should keep the scroll position if clicking reset the question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-2'
      />
    );

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Click on reset question button
    cy.get("button[aria-label='Reset Question']").click();

    cy.get("label.MuiFormControlLabel-root").last().should("be.visible");
  });

  it("should reset the scroll position if clicking the retry button after submitting a question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-2'
      />
    );

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Submit the question
    cy.get("button[aria-label='Check Question']").click();

    // Click on reset question button
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that the window scrolled back to the top
    cy.contains("ID: qID-2").should("be.visible");
  });

  it("should keep state of show navigation on mobile", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    // navigate to next question using the arrow
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the navigation is still visible
    cy.get(".question-actions-navigation-wrapper").should("be.visible");

    // Navigate to next question by submitting the form
    cy.get("button[aria-label='Check Question']").click();
    cy.get("button[aria-label='Next Question']").click();

    // Assert that the navigation is still visible
    cy.get(".question-actions-navigation-wrapper").should("be.visible");
  });

  it("should change the question when changing the navigation input", () => {
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='gap_text'
        order='chronological'
        questionID='gt-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number'").type("1");

    cy.contains("ID: gt-11").should("exist");
  });

  it("should show the current position", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-3'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").should("have.value", "3");
  });

  it("should show the current position at 0 for the first question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").should("have.value", "1");
  });

  it("should not change/unmount the question if clearing the navigation input", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").clear().should("have.value", "");

    cy.contains("ID: qID-1");
  });

  it("should keep the focus on the input navigation on change", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").clear().type("4");

    // Assert that the input is focused
    cy.focused().should("have.attr", "aria-label", "Navigate to question number");
  });

  it("should not change the question if navigating to a position that is not in range of the questions", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-1'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").type("23").should("have.value", "123");

    cy.contains("ID: qID-1");
  });

  it("should show empty text content if the question isn't found", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-does-not-exist'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number']").should("have.value", "").type("3");

    cy.contains("ID: qID-3").should("exist");
  });

  it("should show the current position in input when navigating to the next question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='cypress_1'
        order='chronological'
        questionID='qID-2'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    // Navigate to next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    cy.get("input[aria-label='Navigate to question number']").should("have.value", "3");
  });

  it("should clear the question correction when navigating by using the input navigation", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='multiple_response'
        order='chronological'
        questionID='mr-2'
      />
    );

    // Submit question
    cy.get("button[type='submit'").click();

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    cy.get("input[aria-label='Navigate to question number'").clear().type("1");

    // Assert that the question correction disappeared
    cy.get(".question-correction").should("not.exist");

    // Assert that all input elements are active
    cy.get("section.question-user-response")
      .get("input[type='checkbox']")
      .each(($el) => {
        expect($el).to.have.prop("disabled", false);
      });
  });

  it("should not submit the question when clicking enter on the navigation input element", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");
    cy.mount(
      <RenderComponentWithRouter
        component={<Question />}
        mode='practice'
        moduleID='multiple_response'
        order='chronological'
        questionID='mr-2'
      />
    );

    // Show navigation
    cy.get("button[aria-label='Show Navigation']").click();

    // Type enter
    cy.get("input[aria-label='Navigate to question number'").type("{enter}");

    cy.get(".question-correction").should("not.exist");
  });
});
