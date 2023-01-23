import Home from "../../pages/index";
import "../../index.css";
import { MemoryRouter, Route } from "react-router-dom";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
//declare const expect: Chai.ExpectStatic;

const MockModulesWithRouter = () => {
  return (
    <MemoryRouter>
      <main style={{ minHeight: "100vh", marginTop: 0 }}>
        <Route exact path='/' component={Home} />
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

  it("should render modules from localStorage and public folder", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");

    cy.mount(<MockModulesWithRouter />);

    cy.get("article.card").should("have.length", 3);

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

// TODO maybe implement the tests from deleteModule.cy.ts and exportModule.cy.ts into here ??
