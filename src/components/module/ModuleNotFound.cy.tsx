/// <reference types="cypress" />

import { UserModulesList } from "./ModuleNotFound";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import "../../index.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

//Setup Component with Router
const MockUserModulesListWithRouter = () => {
  const history = createMemoryHistory();
  const route = "/module/test";
  history.push(route);

  return (
    <Router history={history}>
      <div className='module-not-found'>
        <UserModulesList />
      </div>
    </Router>
  );
};

describe("Test order of Modules in QuestionNotFound component", () => {
  it("should order the existing user modules in alphabetical order on initial render", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Add two files to localStorage
    //First item
    const localStorageItemContent = {
      id: "lsi-1",
      name: "Z Module",
      lang: "en",
      compatibility: "0.4.0",
      questions: [],
    };

    localStorage.setItem(
      `repeatio-module-${localStorageItemContent.id}`,
      JSON.stringify(localStorageItemContent, null, "\t")
    );

    //Second item
    const localStorageItemContent2 = {
      id: "lsi-2",
      name: "B Module",
      lang: "en",
      compatibility: "0.4.0",
      questions: [],
    };

    localStorage.setItem(
      `repeatio-module-${localStorageItemContent2.id}`,
      JSON.stringify(localStorageItemContent2, null, "\t")
    );

    cy.mount(<MockUserModulesListWithRouter />);

    //Check for deep equality:
    //source: https://stackoverflow.com/a/58496906/14602331
    cy.get(".user-modules ul")
      .find("li")
      .then(($items) => {
        return $items.map((_, html) => Cypress.$(html).text()).get();
      })
      .should("deep.equal", ["B Module (lsi-2)", "Cypress Fixture Module (cypress_1)", "Z Module (lsi-1)"]);
  });
});
