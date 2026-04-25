/// <reference types="cypress" />
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IParams, ISearchParams } from "../../utils/types";
import { QuestionIdsProvider } from "../module/questionIdsContext";
import { CustomToastContainer } from "../toast/toast";
import { Question } from "./Question";

//CSS
import "../../index.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

/* 
  All lot of tests are located in the sub folders.
*/

//Setup Router to access context and useParams
interface IMockQuestionWithRouter extends Required<IParams> {
  order: NonNullable<ISearchParams["order"]>;
  mode: NonNullable<ISearchParams["mode"]>;
}
const MockQuestionWithRouter: React.FC<IMockQuestionWithRouter> = ({ moduleID, questionID, mode, order }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=${mode}&order=${order}`]}>
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
      <CustomToastContainer />
    </MemoryRouter>
  );
};

describe("Question Component", () => {
  it("should render question id, title, points, and help", () => {
    const module = {
      id: "question-test",
      name: "Question Test Module",
      type: "module",
      lang: "en",
      compatibility: "0.6.0",
      questions: [
        {
          id: "qID-1",
          title: "This is a question for the test suite",
          points: 5,
          type: "multiple-choice",
          help: "Choose the correct answer(s) please.",
          answerOptions: [
            {
              id: "option-1",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
              isCorrect: true,
            },
            { id: "option-2", text: "Lorem ipsum dolor sit amet consectetur adipisicing.", isCorrect: false },
          ],
        },
        {
          id: "qID-2",
          title: "This is the second question for the test suite",
          points: 5,
          type: "multiple-response",
          help: "Choose the correct answer(s).",
          answerOptions: [
            {
              id: "option-1",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
              isCorrect: true,
            },
          ],
        },
      ],
    };

    localStorage.setItem("repeatio-module-question-test", JSON.stringify(module, null, "\t"));

    cy.mount(
      <MockQuestionWithRouter mode='practice' moduleID='question-test' order='chronological' questionID='qID-1' />,
    );

    cy.contains("ID: qID-1").should("exist");
    cy.contains("This is a question for the test suite").should("exist");
    cy.contains("5 Points").should("exist");
    cy.contains("Choose the correct answer(s) please.").should("exist");
  });

  it("should render question with id qID-2 when params match", () => {
    const module = {
      id: "question-test",
      name: "Question Test Module",
      type: "module",
      lang: "en",
      compatibility: "0.6.0",
      questions: [
        {
          id: "qID-1",
          title: "This is a question for the test suite",
          points: 5,
          type: "multiple-choice",
          help: "Choose the correct answer(s) please.",
          answerOptions: [
            {
              id: "option-1",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
              isCorrect: true,
            },
          ],
        },
        {
          id: "qID-2",
          title: "This is the second question for the test suite",
          points: 5,
          type: "multiple-response",
          help: "Choose the correct answer(s).",
          answerOptions: [
            {
              id: "option-1",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
              isCorrect: true,
            },
          ],
        },
      ],
    };

    localStorage.setItem("repeatio-module-question-test", JSON.stringify(module, null, "\t"));

    cy.mount(
      <MockQuestionWithRouter mode='practice' moduleID='question-test' order='chronological' questionID='qID-2' />,
    );

    cy.contains("ID: qID-2").should("exist");
  });

  it("should render Question Not Found when id is missing", () => {
    const module = {
      id: "question-test",
      name: "Question Test Module",
      type: "module",
      lang: "en",
      compatibility: "0.6.0",
      questions: [
        {
          id: "qID-1",
          title: "This is a question for the test suite",
          points: 5,
          type: "multiple-choice",
          help: "Choose the correct answer(s) please.",
          answerOptions: [
            {
              id: "option-1",
              text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
              isCorrect: true,
            },
          ],
        },
      ],
    };

    localStorage.setItem("repeatio-module-question-test", JSON.stringify(module, null, "\t"));

    cy.mount(
      <MockQuestionWithRouter
        mode='practice'
        moduleID='question-test'
        order='chronological'
        questionID='id-not-found'
      />,
    );

    cy.contains("Question not found!").should("exist");
  });
  it("should reset the question on any navigation if there is just one question in the current context", () => {
    // Setup module
    const module = {
      id: "one-question",
      name: "Cypress Fixture Module",
      type: "module",
      lang: "en",
      compatibility: "0.6.0",
      questions: [
        {
          id: "qID-1",
          title:
            "This question is of the type Multiple-Choice. Exactly _**one**_ correct answer must be selected. A circle in front of each option can help to identify this kind of question. How many options can be correct?",
          points: 5,
          type: "multiple-choice",
          help: "Please choose the correct answer.",
          answerOptions: [
            {
              id: "option-0",
              text: "Just one option",
              isCorrect: true,
            },
          ],
        },
      ],
    };

    // Add localStorage
    localStorage.setItem("repeatio-module-one-question", JSON.stringify(module, null, "\t"));

    cy.mount(
      <MockQuestionWithRouter mode='practice' moduleID='one-question' order='chronological' questionID='qID-1' />,
    );

    cy.contains("Just one option").click();

    // Navigate to next question by submitting the form
    cy.get("button[aria-label='Check Question']").click();
    cy.get("button[aria-label='Next Question']").click();

    // Assert that the question correction disappeared
    cy.get("section.question-correction").should("not.exist");

    // Assert that the radio reset
    cy.get("input[type='radio']").should("not.be.checked").and("be.enabled");

    // Navigate to next question using the arrows
    cy.contains("Just one option").click();

    // Check question
    cy.get("button[aria-label='Check Question']").click();

    // Click show navigation button that only exists on small displays
    cy.window().then((win) => {
      if (win.innerWidth <= 650) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click arrow to go to the next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the question correction disappeared
    cy.get("section.question-correction").should("not.exist");

    // Assert that the radio reset
    cy.get("input[type='radio']").should("not.be.checked").and("be.enabled");
  });
});

/* //TODO 
- consider moving some of the tests to QuestionNavigation
- Test markdown of title and question correction
*/
