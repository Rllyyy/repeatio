/// <reference types="cypress" />

import Home from "../../pages/index";
import "../../index.css";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { parseJSON } from "../../utils/parseJSON";
import { CustomToastContainer } from "../toast/toast";

// Interfaces / Types
import { IModule } from "../module/module";
import { TSettings } from "@hooks/useSetting";
import { IBookmarkedQuestions } from "../Question/components/Actions/BookmarkQuestion";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

const MockModulesWithRouter = () => {
  return (
    <div id='root'>
      <MemoryRouter>
        <main style={{ minHeight: "100vh", marginTop: 0 }}>
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
          <CustomToastContainer />
        </main>
      </MemoryRouter>
    </div>
  );
};

describe("Modules (Home) component", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data.json", { fixture: "../../public/data.json" }).as("getData");
  });

  it("should render modules from the localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");

    cy.mount(<MockModulesWithRouter />);

    cy.get("article.card").should("have.length", 3); //The third module is the example module that gets automatically added on first ever visit

    // Assert that the correct amount of questions get counted
    cy.get("article[data-cy='module-gap_text'").scrollIntoView().contains("p", "12 Questions").should("exist");
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
});

/* Module sort */
describe("Module sort", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data.json", { fixture: "../../public/data.json" }).as("getData");
  });

  it("should default select the sort by name (ascending)", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("Name (ascending)").should("exist").and("be.selected");
  });

  it("should change the selected sort on click", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("ID (ascending)").click();

    cy.contains("button", "Sort").click();
    cy.contains("ID (ascending)").should("be.selected");
  });

  it("should default sort the modules by name ascending", () => {
    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);
    // get order of all items
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", [
        "module-cypress_1",
        "module-types_1",
        "module-gap_text_dropdown",
        "module-gap_text",
        "module-multiple_choice",
        "module-multiple_response",
      ]);
  });

  it("should show the modules in reverse order of name on sort Name (descending) click", () => {
    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("Name (descending)").click();

    cy.wait(300);

    // get order of all items
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", [
        "module-multiple_response",
        "module-multiple_choice",
        "module-gap_text",
        "module-gap_text_dropdown",
        "module-types_1",
        "module-cypress_1",
      ]);
  });

  it("should sort the modules by id ascending on select click", () => {
    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("ID (ascending)").click();

    cy.wait(300);

    // get order of all items
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", [
        "module-cypress_1",
        "module-gap_text",
        "module-gap_text_dropdown",
        "module-multiple_choice",
        "module-multiple_response",
        "module-types_1",
      ]);
  });

  it("should sort the modules by id descending on select click", () => {
    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("ID (descending)").click();

    // get order of all items
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", [
        "module-types_1",
        "module-multiple_response",
        "module-multiple_choice",
        "module-gap_text_dropdown",
        "module-gap_text",
        "module-cypress_1",
      ]);
  });

  it("should sort a added module", () => {
    cy.viewport(800, 700);

    // Add Modules to localStorage
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Add Module").click();
    cy.contains("label", "Create Module").click();

    cy.get("input[name='id']").type("Y");
    cy.get("input[name='name']").type("Y");

    cy.get("select[name=lang]").select("en");
    cy.contains("button", "Create").click();

    // Assert that the new module was added to the end
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", ["module-cypress_1", "module-types_1", "module-Y"]);
  });

  it("should update the sort settings in the localStorage on sort change", () => {
    const settings: TSettings = {
      expanded: true,
    };

    localStorage.setItem("repeatio-settings", JSON.stringify(settings, null, "\t"));

    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    cy.contains("button", "Sort").click();
    cy.contains("ID (descending)")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));
        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.moduleSort).to.equal("ID (descending)");
        expect(localStorageItem?.expanded).to.equal(true);
      });
  });

  it("should use the sort from the localStorage ", () => {
    cy.fixtureToLocalStorage("repeatio-settings.json");

    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");

    cy.mount(<MockModulesWithRouter />);

    // get order of all items
    cy.get("article")
      .then((modules) => modules.get().map((module) => module.getAttribute("data-cy")))
      .should("deep.equal", [
        "module-cypress_1",
        "module-gap_text",
        "module-gap_text_dropdown",
        "module-multiple_choice",
        "module-multiple_response",
      ]);
  });
});

/* Add Module Modal */
describe("Add Module modal", () => {
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
});

/* Module Deletion */
describe("Module deletion", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data.json", { fixture: "../../public/data.json" }).as("getData");
  });

  it("should open the module deletion confirm modal when clicking on delete", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1'").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();

    cy.get(".ReactModal__Content--after-open").should("exist");
    cy.contains("h2", "Delete Module?").should("exist");
  });

  it("should close the popover after when opening the deletion confirm modal", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1'").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();

    cy.get(".MuiPaper-root").should("not.exist");
  });

  it("should close the DeletionConfirmModal when clicking cancel", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1'").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();
    cy.get("button").contains("Cancel").click();

    // Assert that the modal is closed
    cy.contains("h2", "Delete Module?").should("not.exist");
    cy.get(".ReactModal__Content--after-open").should("not.exist");
  });

  it("should close the DeletionConfirmModal when clicking on the X button", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1'").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();
    cy.get("button[aria-label='Close Modal']").click();

    // Assert that the modal is closed
    cy.contains("h2", "Delete Module?").should("not.exist");
    cy.get(".ReactModal__Content--after-open").should("not.exist");
  });

  it("should close the module deletion confirm modal when clicking on delete after deletion", () => {
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1'").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();

    cy.get("button").contains("Delete Module").click();

    // Assert that the modal is closed
    cy.contains("h2", "Delete Module?").should("not.exist");
    cy.get(".ReactModal__Content--after-open").should("not.exist");
  });

  it("should remove a module from the overview if it gets deleted", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");

    cy.mount(<MockModulesWithRouter />);
    cy.get("article[data-cy='module-gap_text'").scrollIntoView().find("button.popover-button").click();

    cy.get("ul.MuiList-root").contains("Delete").click();
    cy.get("button").contains("Delete Module").click();

    // Assert that the element is deleted and there are just 2 modules left
    cy.get("article[data-cy='module-gap_text").should("not.exist");
    cy.get("article.card").should("have.length", 2);
  });

  it("should delete module that is located in localStorage", () => {
    cy.mount(<MockModulesWithRouter />);

    //Add item to localStorage and check existence
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.contains("Cypress Fixture Module (cypress_1)").should("exist");

    //Click delete module button
    cy.get("article[data-cy='module-cypress_1']").find("button.popover-button").click();
    cy.get("ul.MuiList-root").contains("Delete").click();

    cy.get("button")
      .contains("Delete Module")
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
    cy.get("ul.MuiList-root").contains("Delete").click();

    cy.get("button")
      .contains("Delete Module")
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

    //Delete module
    cy.get(".MuiList-root").contains("Delete").click({ force: true });
    cy.get("button").contains("Delete Module").click();

    //Expect toast to show up
    cy.get(".Toastify").contains("Couldn't find the file repeatio-module-cypress_1 in the localStorage!");
  });
});

/* Module edit */
describe("Module Edit", () => {
  beforeEach(() => {
    cy.intercept("GET", "/data.json", { fixture: "../../public/data.json" }).as("getData");
  });

  it("should open the <EditModule /> component", () => {
    cy.mount(<MockModulesWithRouter />);
    cy.get("button.popover-button").click();
    cy.get("li[aria-label='Edit Module']").click();
    cy.get(".ReactModal__Content--after-open").should("be.visible");
  });

  it("should update the module id in the module overview", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-cypress_1']").find("button.popover-button").click();
    cy.get("li[aria-label='Edit Module']").click();

    cy.get("input#module-editor-id-input").clear().type("changed");

    cy.get("button[type='submit']").click();

    cy.get("article[data-cy='module-changed']").should("exist");
    cy.get("article").should("have.length", 2);
  });

  it("should update the module in the localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-cypress_1']").find("button.popover-button").click();
    cy.get("li[aria-label='Edit Module']").click();

    cy.get("input#module-editor-id-input").clear().type("changed", { delay: 2 });
    cy.get("input#module-editor-name-input").clear().type("name-changed", { delay: 2 });
    cy.get("select#module-editor-language-select").select("German");

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const module = parseJSON<IModule>(localStorage.getItem("repeatio-module-changed"));

        // Assert that the module exists
        expect(module).not.to.equal(null);

        // Assert that the id, name and language changed
        expect(module?.id).to.equal("changed");
        expect(module?.name).to.equal("name-changed");
        expect(module?.lang).to.equal("de");
      });
  });

  it("should update the bookmarked localStorage items on id change", () => {
    cy.fixtureToLocalStorage("repeatio-marked-types_1.json");
    cy.mount(<MockModulesWithRouter />);

    cy.get("article[data-cy='module-types_1']").find("button.popover-button").click();
    cy.get("li[aria-label='Edit Module']").click();

    cy.get("input#module-editor-id-input").clear().type("changed", { delay: 2 });

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const module = parseJSON<IBookmarkedQuestions>(localStorage.getItem("repeatio-marked-changed"));

        // Assert that the module exists
        expect(module).not.to.equal(null);

        // Assert that the id changed
        expect(module?.id).to.equal("changed");
      });
  });
});

// TODO maybe implement the tests from deleteModule.cy.ts and exportModule.cy.ts into here ??
