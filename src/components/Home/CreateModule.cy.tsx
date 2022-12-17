/// <reference types="cypress" />

import { CreateModule } from "./CreateModule";
import { CustomToastContainer } from "../toast/toast";

import { MemoryRouter } from "react-router-dom";
import packageJSON from "../../../package.json";
import { parseJSON } from "../../utils/parseJSON";
import { IModule } from "./CreateModule";

// CSS
import "../../index.css";
import "./AddModule.css";

//Mocha / Chai for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

function MockCreateModuleComponent() {
  const handleModalCloseSpy = cy.spy().as("handleModalCloseSpy");
  return (
    <MemoryRouter>
      <main style={{ marginTop: 0 }}>
        <div className='import-create-module' style={{ backgroundColor: "white" }}>
          <CreateModule handleModalClose={handleModalCloseSpy} />
        </div>
        <CustomToastContainer />
      </main>
    </MemoryRouter>
  );
}

describe("Creating a module", () => {
  it("should add module and show toast when creating a module", () => {
    cy.mount(<MockCreateModuleComponent />);

    //Fill in form and click create button
    //id
    cy.get("input#create-module-id-input").type("test_cy_1").should("have.value", "test_cy_1");

    //name
    cy.get("input#create-module-name-input")
      .type("Module created with cypress", { delay: 2 })
      .should("have.value", "Module created with cypress");

    //language
    cy.get("select#create-module-language-select").select("English").should("have.value", "en");
    cy.get("select#create-module-language-select").find("option:selected").should("have.text", "English");

    //compatibility
    cy.get("input#create-module-compatibility-input").should("be.disabled").and("have.value", packageJSON.version);

    cy.get("form.create-module")
      .contains("button", "Create")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-test_cy_1"));

        expect(localStorageItem?.id).to.equal("test_cy_1");
        expect(localStorageItem?.name).to.equal("Module created with cypress");
        expect(localStorageItem?.lang).to.equal("en");
        expect(localStorageItem?.compatibility).to.equal("0.4.0");
        expect(localStorageItem?.questions).to.have.length(0);
      });

    //Expect toast to show up
    cy.get(".Toastify__toast").contains("a", "test_cy_1");
  });

  //Form should not submit if pressing enter on in input
  it("should not submit form when pressing enter inside input", () => {
    cy.mount(<MockCreateModuleComponent />);

    cy.get("input#create-module-id-input").type("{enter}");
    cy.get("input#create-module-name-input").type("{enter}");
    cy.get("p.error-message").should("not.exist");
  });

  //No errors on normal display
  it("should show no errors when rendering initially", () => {
    cy.mount(<MockCreateModuleComponent />);

    //Should not initially show errors
    cy.get("p.error-message").should("not.exist");

    //Should not show errors after input typing
    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get("p.error-message").should("not.exist");

    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.get("p.error-message").should("not.exist");

    cy.get("select#create-module-language-select").select("German");
    cy.get("p.error-message").should("not.exist");
  });

  //Show errors
  it("should show errors if trying to submit without filling out required fields", () => {
    cy.mount(<MockCreateModuleComponent />);

    cy.contains("button", "Create").click();

    cy.get("p.error-message").should("have.length", 3);

    cy.contains("p", "Provide an ID for the module.").should("exist");
    cy.contains("p", "Provide a name for the module.").should("exist");
    cy.contains("p", "Select a language for the module.").should("exist");
  });

  //Error display on submit for id and clearing if error are healed
  it("should show error if id of module is missing on submit and clear error if changing", () => {
    cy.mount(<MockCreateModuleComponent />);

    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.get("select#create-module-language-select").select("English");
    cy.contains("button", "Create").click();

    //Expect error message
    cy.contains("p", "Provide an ID for the module.").should("exist");

    //Expect class invalid
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Expect error message to disappear after typing
    cy.get("input#create-module-id-input").type("test_cy_1", { delay: 2 });
    cy.contains("li", "Provide an ID for the module.").should("not.exist");
    cy.get("p.error-message").should("not.exist");
    cy.get("input#create-module-id-input").should("not.have.class", "is-invalid");
  });

  //Error for module name if missing and be healed after fixing
  it("should show error if name of module is missing on submit and clear error if changing", () => {
    cy.mount(<MockCreateModuleComponent />);

    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get("select#create-module-language-select").select("English");
    cy.contains("button", "Create").click();

    //Expect error message
    cy.contains("p", "Provide a name for the module.").should("exist");

    //Expect class invalid
    cy.get("input#create-module-name-input").should("have.class", "is-invalid");

    //Expect error message to disappear after typing
    cy.get("input#create-module-name-input").type("Module created with cypress");
    cy.contains("p", "Provide a name for the module.").should("not.exist");
    cy.get("p.error-message").should("not.exist");
    cy.get("input#create-module-name-input").should("not.have.class", "is-invalid");
  });

  //Error for module language if missing and healed
  it("should show error if language of module is missing on submit and clear error if changing", () => {
    cy.mount(<MockCreateModuleComponent />);

    cy.get("input#create-module-id-input").type("test_cy_1");
    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.contains("button", "Create").click();

    //Expect error message
    cy.contains("p", "Select a language for the module.").should("exist");

    //Expect class invalid
    cy.get("select#create-module-language-select").should("have.class", "is-invalid");

    //Expect error message to disappear after typing
    cy.get("select#create-module-language-select").select("English");

    cy.contains("p", "Select a language for the module.").should("not.exist");
    cy.get(".create-module-errors").should("not.exist");
    cy.get("select#create-module-language-select").should("not.have.class", "is-invalid");
  });

  //Error when using reserved keywords (module/types_1)
  it('should show error if provided id for module is a reserved keyword ("module"/"types_1")', () => {
    cy.mount(<MockCreateModuleComponent />);

    //Check against word "module"
    cy.get("input#create-module-id-input").type("module");
    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.get("select#create-module-language-select").select("English");
    cy.contains("button", "Create").click();

    cy.contains(`The word "module" is a reserved keyword and can't be used inside an ID!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Check against word "types_1" as that value is used for the repeatio examples
    cy.get("input#create-module-id-input").clear().type("types_1");
    cy.contains(`The word "types_1" is a reserved keyword!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");
  });

  //Error if using space inside id input
  it("should show error if using space in id", () => {
    cy.mount(<MockCreateModuleComponent />);

    //Check against word "module"
    cy.get("input#create-module-id-input").type("id 1");
    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.get("select#create-module-language-select").select("English");
    cy.contains("button", "Create").click();

    cy.contains(`The ID has to be one word! Use hyphens ("-") to concat the word (id-1)`);

    //Test focus
    cy.focused().should("have.attr", "name", "id");

    //Should have class to add border and background
    cy.get("input[name='id']").should("have.class", "is-invalid");
  });

  //Error if module in already in localStorage and clearing of error if fixed by user
  it("should show error if id of module already in localStorage", () => {
    cy.mount(<MockCreateModuleComponent />);

    //Setup localStorage to have item
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    //Type into inputs
    cy.get("input#create-module-id-input").type("cypress_1");
    cy.get("input#create-module-name-input").type("Module created with cypress", { delay: 2 });
    cy.get("select#create-module-language-select").select("English");
    cy.contains("button", "Create").click();

    cy.contains(`ID of module ("cypress_1") already exists!`).should("be.visible");
    cy.get("input#create-module-id-input").should("have.class", "is-invalid");

    //Check "healing of error"
    cy.get("input#create-module-id-input").clear().type("cypress_2");
    cy.contains(`ID of module ("cypress_1") already exists!`).should("not.exist");
    cy.get("input#create-module-id-input").should("not.have.class", "is-invalid");

    cy.contains("button", "Create")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_2"));

        expect(localStorageItem?.id).to.equal("cypress_2");
        expect(localStorageItem?.name).to.equal("Module created with cypress");
        expect(localStorageItem?.lang).to.equal("en");
        expect(localStorageItem?.compatibility).to.equal("0.4.0");
        expect(localStorageItem?.questions).to.have.length(0);
      });
  });
});
