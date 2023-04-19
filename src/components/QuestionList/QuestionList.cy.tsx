/// <reference types="cypress" />
import { QuestionList } from "./QuestionList";
import { QuestionIdsProvider } from "../module/questionIdsContext";

// Router
import { Route, MemoryRouter, Routes } from "react-router-dom";

import "../../index.css";

//Types
import { IParams } from "../../utils/types";

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
    cy.get("div.question").should("have.length", 6);
  });

  it("should render 404 Error if module isn't found", () => {
    cy.mount(<QuestionListWithRouter moduleID='error' />);
    cy.contains("h1", "404").should("exist");
  });
});
