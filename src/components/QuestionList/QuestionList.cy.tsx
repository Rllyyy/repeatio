/// <reference types="cypress" />
import { QuestionList } from "./QuestionList";
import { QuestionIdsProvider } from "../module/questionIdsContext";

// Router
import { Route, MemoryRouter, Routes } from "react-router-dom";

import "../../index.css";

//Types
import { IParams } from "../../utils/types";
import { parseJSON } from "../../utils/parseJSON";
import { IModule } from "../module/module";

//Mocha for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

//Mock component with react router to have access to params
function QuestionListWithRouter({ moduleID }: Required<Pick<IParams, "moduleID">>) {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/all-questions`]}>
      <main style={{ marginTop: 0 }}>
        <Routes>
          <Route
            path='/module/:moduleID/all-questions'
            element={
              <QuestionIdsProvider>
                <QuestionList />
              </QuestionIdsProvider>
            }
          />
        </Routes>
      </main>
    </MemoryRouter>
  );
}

describe("QuestionList", () => {
  it("should render list from localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("div[cy-data='question']").should("have.length", 6);
  });

  it("should render 404 Error if module isn't found", () => {
    cy.mount(<QuestionListWithRouter moduleID='error' />);
    cy.contains("h1", "404").should("exist");
  });
});

describe("QuestionList - Drag and Drop", { viewportWidth: 780 }, () => {
  it("should move a question", { retries: 5 }, () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);

    cy.get("#question-qID-1")
      .find("button[cy-data='drag-handle']")
      .realMouseDown({ button: "left", position: "center" })
      .realMouseMove(0, 150, { position: "center" })
      .realMouseUp({ position: "center" })
      .wait(500)
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-2", "qID-3", "qID-1", "qID-4", "qID-5", "qID-6"]);
        });
      });

    // Assert that the third question was the first question
    cy.get("div[cy-data='question']").eq(2).find("span[cy-data='id']").should("have.text", "qID-1");
  });

  it("should update the localStorage after drag'n'drop", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);

    cy.get("#question-qID-5")
      .find("button[cy-data='drag-handle']")
      .realMouseDown({ button: "left", position: "center" })
      .realMouseMove(0, -150, { position: "center" })
      .realMouseUp({ position: "center" })
      .should(() => {
        const questionIds = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"))?.questions.map(
          (question) => question.id
        );
        expect(questionIds).to.deep.equal(["qID-1", "qID-2", "qID-5", "qID-3", "qID-4", "qID-6"]);
      });
  });

  it("should reset the position when canceling the drag'n'drop", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);

    cy.get("#question-qID-1")
      .find("button[cy-data='drag-handle']")
      .realMouseDown({ button: "left", position: "center" })
      .realMouseMove(0, 150, { position: "center" })
      .realPress("Escape")
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-1", "qID-2", "qID-3", "qID-4", "qID-5", "qID-6"]);
        });
      });
  });
});

/*
describe("QuestionList - Sort Buttons", () => {
  it("should move a question down and change localStorage", { viewportWidth: 800 }, () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("button[aria-label='Move qID-2 down'")
      .click()
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-1", "qID-3", "qID-2", "qID-4", "qID-5", "qID-6"]);
        });
      })
      .then(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));
        // Assert that none of the other module values changed
        expect(module?.id).to.deep.equal("cypress_1");
        expect(module?.name).to.deep.equal("Cypress Fixture Module");

        // Assert the changed order of question
        const moduleQuestionIds = module?.questions.map((question) => question.id);
        expect(moduleQuestionIds).to.deep.equal(["qID-1", "qID-3", "qID-2", "qID-4", "qID-5", "qID-6"]);
      });
  });

  it("should move a question two down and update localStorage with changes", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("button[aria-label='Move qID-2 down'")
      .click()
      .click()
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-1", "qID-3", "qID-4", "qID-2", "qID-5", "qID-6"]);
        });
      })
      .then(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));
        // Assert that none of the other module values changed
        expect(module?.id).to.deep.equal("cypress_1");
        expect(module?.name).to.deep.equal("Cypress Fixture Module");

        // Assert the changed order of question
        const moduleQuestionIds = module?.questions.map((question) => question.id);
        expect(moduleQuestionIds).to.deep.equal(["qID-1", "qID-3", "qID-4", "qID-2", "qID-5", "qID-6"]);
      });
  });

  it("should move a question up and change the localStorage", { viewportWidth: 800 }, () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("button[aria-label='Move qID-2 up'")
      .click()
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-2", "qID-1", "qID-3", "qID-4", "qID-5", "qID-6"]);
        });
      })
      .then(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));
        // Assert that none of the other module values changed
        expect(module?.id).to.deep.equal("cypress_1");
        expect(module?.name).to.deep.equal("Cypress Fixture Module");

        // Assert the changed order of question
        const moduleQuestionIds = module?.questions.map((question) => question.id);
        expect(moduleQuestionIds).to.deep.equal(["qID-2", "qID-1", "qID-3", "qID-4", "qID-5", "qID-6"]);
      });
  });

  it("should move the first question to the end if clicking on move up", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("button[aria-label='Move qID-1 up'")
      .click()
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-2", "qID-3", "qID-4", "qID-5", "qID-6", "qID-1"]);
        });
      })
      .then(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));
        // Assert that none of the other module values changed
        expect(module?.id).to.deep.equal("cypress_1");
        expect(module?.name).to.deep.equal("Cypress Fixture Module");

        // Assert the changed order of question
        const moduleQuestionIds = module?.questions.map((question) => question.id);
        expect(moduleQuestionIds).to.deep.equal(["qID-2", "qID-3", "qID-4", "qID-5", "qID-6", "qID-1"]);
      });
  });

  it("should move the last question to the beginning if clicking on move down", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<QuestionListWithRouter moduleID='cypress_1' />);
    cy.get("button[aria-label='Move qID-6 down'")
      .click()
      .then(() => {
        cy.get("span[cy-data='id']").should(($spans) => {
          const idValues = $spans.toArray().map((span) => span.textContent);
          expect(idValues).to.deep.equal(["qID-6", "qID-1", "qID-2", "qID-3", "qID-4", "qID-5"]);
        });
      })
      .then(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));
        // Assert that none of the other module values changed
        expect(module?.id).to.deep.equal("cypress_1");
        expect(module?.name).to.deep.equal("Cypress Fixture Module");

        // Assert the changed order of question
        const moduleQuestionIds = module?.questions.map((question) => question.id);
        expect(moduleQuestionIds).to.deep.equal(["qID-6", "qID-1", "qID-2", "qID-3", "qID-4", "qID-5"]);
      });
  });
});
*/
