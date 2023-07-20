/// <reference types="cypress" />

import { IModule, Module } from "../module/module";
import { ModuleEditorForm } from ".";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// functions
import { parseJSON } from "../../utils/parseJSON";

//css
import "../../index.css";

// Interfaces
import { IParams } from "../../utils/types";
import { IBookmarkedQuestions } from "../Question/components/Actions/BookmarkQuestion";

const MockModuleWithRouter = ({ moduleId }: { moduleId: Required<IParams["moduleID"]> }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleId}`]}>
      <main style={{ marginTop: 0 }}>
        <Routes>
          <Route path='/module/:moduleID' element={<Module />} />
        </Routes>
      </main>
    </MemoryRouter>
  );
};

const MockModuleEditorWithRouter = ({ moduleId }: { moduleId: Required<IParams["moduleID"]> }) => {
  const handleModalCloseSpy = cy.spy().as("handleModalCloseSpy");

  return (
    <MemoryRouter initialEntries={[`/module/${moduleId}`]}>
      <main style={{ marginTop: 0 }}>
        <Routes>
          <Route
            path='/module/:moduleId'
            element={<ModuleEditorForm moduleId={moduleId} handleModalClose={handleModalCloseSpy} mode='edit' />}
          />
        </Routes>
      </main>
    </MemoryRouter>
  );
};

describe("<ModuleEditor />", () => {
  it("open the module editor when clicking on edit in Module Info", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    // Assert that the modal opened
    cy.contains("h1", "Edit Module").should("exist");
    cy.get(".ReactModal__Overlay--after-open").should("exist");
  });

  it("should close the modal when clicking on the x", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();
    cy.get("button[aria-label='Close Edit Modal']").click();

    // Assert that the modal is closed
    cy.get(".ReactModal__Overlay--after-open").should("not.exist");
    cy.contains("h1", "Edit Module").should("not.exist");
  });

  it("should close the modal after successful form submission", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    cy.get("input[name='id']").clear().type("updated-item", { delay: 2 });
    cy.get("input[name='name']").clear().type("Updated Module", { delay: 2 });

    cy.contains("button", "Update").click();

    // Assert that the modal is closed
    cy.get(".ReactModal__Overlay--after-open").should("not.exist");
    cy.contains("h1", "Edit Module").should("not.exist");
  });

  it("should update the id of the module when updating a module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    cy.get("input[name='id']").clear().type("updated-item", { delay: 2 });

    cy.contains("button", "Update").click();

    cy.contains("h1", "updated-item").should("exist");
  });

  it("should update the name of the module when updating a module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    cy.get("input[name='name']").clear().type("Updated Module", { delay: 2 });

    cy.contains("button", "Update").click();

    cy.contains("h1", "Updated Module").should("exist");
  });

  it("should show an error if renaming to an existing module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");

    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    cy.get("input[name='id']").clear().type("multiple_choice", { delay: 2 });

    cy.contains("button", "Update").click();

    cy.contains('ID of module ("multiple_choice") already exists!').should("exist");
  });

  it("should update the bookmarked questions if the id of the module changes", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");

    cy.mount(<MockModuleWithRouter moduleId='cypress_1' />);

    cy.get("article[data-cy='Module Info']").contains("button", "Edit").click();

    cy.get("input[name='id']").clear().type("updated_value", { delay: 2 });

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const bookmarkedItem = parseJSON<IBookmarkedQuestions>(localStorage.getItem(`repeatio-marked-updated_value`));

        expect(bookmarkedItem).not.to.equal(null);
        expect(bookmarkedItem?.id).to.equal("updated_value");
      });
  });

  it("should fill the form with the module properties", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);

    cy.get("#module-editor-id-input").should("have.value", "cypress_1");
    cy.get("#module-editor-name-input").should("have.value", "Cypress Fixture Module");
    cy.get("#module-editor-language-select").should("have.value", "en");
    cy.get("#module-editor-compatibility-input").should("have.value", "0.5.0");
  });

  it("should update the module editor values on Change", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);
    cy.get("#module-editor-id-input").clear().type("updated_id").should("have.value", "updated_id");
    cy.get("#module-editor-name-input").clear().type("Updated Name").should("have.value", "Updated Name");
    cy.get("#module-editor-language-select").select("German").should("have.value", "de");
  });

  it("should update the module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);
    cy.get("#module-editor-id-input").clear().type("updated_id");
    cy.get("#module-editor-name-input").clear().type("Updated Name");
    cy.get("#module-editor-language-select").select("German");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-updated_id"));

        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.id).to.equal("updated_id");
        expect(localStorageItem?.name).to.equal("Updated Name");
        expect(localStorageItem?.lang).to.equal("de");
        expect(localStorageItem?.compatibility).to.equal("0.5.0");
        expect(localStorageItem?.type).to.equal("module");
        expect(localStorageItem?.questions).to.have.length(6);
      });
  });

  it("should update the module if not changing the id", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);

    // Update name and language
    cy.get("#module-editor-name-input").clear().type("Updated Name");
    cy.get("#module-editor-language-select").select("German");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.name).to.equal("Updated Name");
        expect(localStorageItem?.lang).to.equal("de");
        expect(localStorageItem?.compatibility).to.equal("0.5.0");
        expect(localStorageItem?.type).to.equal("module");
        expect(localStorageItem?.questions).to.have.length(6);
      });
  });

  it("should show an error if the user tries to change the id to an already existing module id", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);
    cy.get("#module-editor-id-input").clear().type("multiple_choice");
    cy.contains("button", "Update").click();
    cy.contains('ID of module ("multiple_choice") already exists!').should("exist");
  });

  it("should disable/enable the Update button if there are (no) errors", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<MockModuleEditorWithRouter moduleId='cypress_1' />);
    cy.get("#module-editor-id-input").clear();
    cy.contains("button", "Update").click().should("be.disabled");

    cy.get("#module-editor-id-input").type("updated_id");

    cy.contains("button", "Update").click().should("be.enabled");
  });

  it("should fallback to default props if the module is missing type and compatibility properties", () => {
    const module = {
      id: "no_type_and_compatibility",
      name: "No type and compatibility",
      lang: "en",
      questions: [],
    };

    localStorage.setItem(`repeatio-module-${module.id}`, JSON.stringify(module));
    cy.mount(<MockModuleEditorWithRouter moduleId={module.id} />);

    cy.get("#module-editor-compatibility-input").should("have.value", "0.4.0");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${module.id}`));

        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.compatibility).to.equal("0.4.0");
        expect(localStorageItem?.type).to.equal("module");
      });
  });

  // update bookmark item
});
