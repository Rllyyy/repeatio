/// <reference types="cypress" />

import { UserModulesList } from "./ModuleNotFound";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ModulePage } from "../../pages/module/module";

import "../../index.css";
import { ScrollToTop } from "../../utils/ScrollToTop";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

//Setup Component with Router
const MockUserModulesListWithRouter = () => {
  return (
    <MemoryRouter initialEntries={[`/module/test`]}>
      <Routes>
        <Route
          path='/module/:moduleID'
          element={
            <div className='module-not-found'>
              <UserModulesList />
            </div>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

const MockModulePageWithRouter = () => {
  return (
    <MemoryRouter initialEntries={[`/module/test`]}>
      <ScrollToTop />
      <main style={{ marginTop: 0 }}>
        <Routes>
          <Route path='/module/:moduleID' element={<ModulePage />} />
        </Routes>
      </main>
    </MemoryRouter>
  );
};

describe("<ModuleNotFound />", () => {
  it("should navigate to the existing module on click", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModulePageWithRouter />);

    cy.contains("a", "Cypress Fixture Module (cypress_1)").click();

    cy.contains("h1", "Cypress Fixture Module (cypress_1)").should("exist");
  });
});

describe("Test order of Modules in QuestionNotFound component", () => {
  it("should order the existing user modules in alphabetical order on initial render", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Add two files to localStorage
    //First item
    const localStorageItemContent = {
      id: "lsi-1",
      name: "Z Module",
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
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
      type: "module",
      lang: "en",
      compatibility: "0.5.0",
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
