import Home from "../../pages/index";
import "../../index.css";
import { MemoryRouter, Route } from "react-router-dom";
import { parseJSON } from "../../utils/parseJSON";
import { CustomToastContainer } from "../toast/toast";

// Interfaces / Types
import { TSettings } from "../../utils/types";
import { IModule } from "../module/module";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

const MockModulesWithRouter = () => {
  return (
    <MemoryRouter>
      <main style={{ minHeight: "100vh", marginTop: 0 }}>
        <Route exact path='/' component={Home} />
        <CustomToastContainer />
      </main>
    </MemoryRouter>
  );
};

describe("Modules (Home) component", () => {
  it("should show modal if clicking on the 'Add Module' button", () => {
    cy.viewport(500, 500);
    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Add Module").click();

    cy.get("div.ReactModal__Content--after-open").should("exist");
    cy.contains("Create or import a Module").should("be.visible");

    cy.get("div.ReactModal__Content--after-open").invoke("height").should("equal", 432);

    // Assert that there is space above the modal content
    // In the actual app the heading 'module overview' is hidden but the navbar at the top is visible
    cy.contains("h1", "Module Overview").should("be.visible");
  });

  it("should show the modal content on desktop views", () => {
    cy.viewport(900, 700);
    cy.mount(<MockModulesWithRouter />);
    cy.contains("button", "Add Module").click();

    cy.contains("Create or import a Module").should("be.visible");
  });

  it("should show the modal in view if there are a lot of modules", () => {
    cy.viewport(800, 700);

    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-empty-questions.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Add Module").click();

    cy.contains("Create or import a Module").should("be.visible");

    cy.get("article.card").last().scrollIntoView();
    cy.contains("Create or import a Module").should("be.visible");

    // Mobile
    cy.viewport(500, 500);
    cy.contains("Create or import a Module").should("be.visible");
  });

  it("should close the modal if clicking the exist button", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Add Module").click();

    cy.get("button.modal-close-btn").click();
    cy.get("div.ReactModal__Content--after-open").should("not.exist");
  });

  it("should add the default module to the localStorage if there is to settings item in the localStorage", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article.card")
      .should("have.length", 1)
      .should(() => {
        const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));
        expect(settings?.addedExampleModule).to.equal(true);
      });
  });

  it("should not add the default module to the localStorage if the module was previously added to the module but the module was deleted (settings.addedExampleModule === false)", () => {
    cy.mount(<MockModulesWithRouter />);

    // Add settings to show that the item was already added
    localStorage.setItem("repeatio-settings", JSON.stringify({ addedExampleModule: true }));

    cy.get("article.card")
      .should("not.exist")
      .should(() => {
        const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));
        expect(settings?.addedExampleModule).to.equal(true);
      });
  });

  it("should render modules from the localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");

    cy.mount(<MockModulesWithRouter />);

    cy.get("article.card").should("have.length", 3); //The third module is the example module that gets automatically added on first ever visit

    // Assert that the correct amount of questions get counted
    cy.get("article[data-cy='module-gap_text'").scrollIntoView().contains("p", "10 Questions").should("exist");
  });

  it("should remove a module from the overview if it gets deleted", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");

    cy.mount(<MockModulesWithRouter />);
    cy.get("article[data-cy='module-gap_text'").scrollIntoView().find("button.popover-button").click();

    cy.get("ul.MuiList-root").contains("Delete").click();

    // Assert that the element is deleted and there are just 2 modules left
    cy.get("article[data-cy='module-gap_text").should("not.exist");
    cy.get("article.card").should("have.length", 2);
  });
});

/* Module Deletion */
describe("Module deletion", () => {
  it("should delete module that is located in localStorage", () => {
    cy.mount(<MockModulesWithRouter />);

    //Add item to localStorage and check existence
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.contains("Cypress Fixture Module (cypress_1)").should("exist");

    //Click delete module button
    cy.get("article[data-cy='module-cypress_1']").find("button.popover-button").click();
    cy.get("ul.MuiList-root")
      .contains("Delete")
      .click()
      .should(() => {
        //Delete from localStorage
        expect(localStorage.getItem("repeatio-module-cypress_1")).to.equal(null);
      });

    //Toast
    cy.get(".Toastify").contains("Deleted module cypress_1!");

    //Module should no longer exist/be visible in list of modules
    cy.contains("Cypress Fixture Module (cypress_1)").should("not.exist");
  });

  it("should delete example module", () => {
    cy.mount(<MockModulesWithRouter />);

    // Add another module
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Click delete module button
    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.get("ul.MuiList-root")
      .contains("Delete")
      .click()
      .should(() => {
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-types_1`));
        expect(module).to.equal(null);
      });

    // Assert the example module to no longer be present on the page
    cy.contains("h2", "Question Types (types_1)").should("not.exist");

    // Assert that the other module is unaffected be the deletion and still exist in the DOM
    cy.contains("h2", "Cypress Fixture Module (cypress_1)").should("exist");
  });

  it("should toast error if to be deleted file can't be found in localStorage ", () => {
    cy.mount(<MockModulesWithRouter />);

    //Add fixture to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Click on dots
    cy.get(`article[data-cy='module-cypress_1']`).find("button.popover-button").click();

    //remove item from localStorage so it can't be found to simulate not existing file
    cy.clearLocalStorage("repeatio-module-cypress_1");

    //Click on export
    cy.get(".MuiList-root").contains("Delete").click({ force: true });

    //Expect toast to show up
    cy.get(".Toastify").contains("Couldn't find the file repeatio-module-cypress_1 in the localStorage!");
  });
});

// TODO maybe implement the tests from deleteModule.cy.ts and exportModule.cy.ts into here ??
