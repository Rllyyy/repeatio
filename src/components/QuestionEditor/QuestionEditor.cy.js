/// <reference types="cypress" />
import { Form } from "./QuestionEditor.jsx";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { ModuleProvider } from "../module/moduleContext.js";

//CSS
import "../../index.css";

//Mock Component with Router and Context
const MockFormWithRouter = () => {
  const history = createMemoryHistory();
  const route = "/module/test";
  history.push(route);

  const handleModalCloseSpy = cy.spy().as("handleModalCloseSpy");
  return (
    <Router history={history}>
      <ModuleProvider>
        <Form handleModalClose={handleModalCloseSpy} />
      </ModuleProvider>
    </Router>
  );
};

/* ------------------------------ Basic Test for Question Editor -------------------------------- */
describe("QuestionEditor.cy.js", () => {
  beforeEach(() => {
    cy.mount(<MockFormWithRouter />);
  });

  it("interact with all elements", () => {
    cy.get("input[name='id']").type("new-id").should("have.value", "new-id");
    cy.get("textarea[name='title']").type("New title").should("have.value", "New title");
    cy.get("input[name='points']").type("5").should("have.value", "5");
    cy.get("textarea[name='help']").type("This is help").should("have.value", "This is help");
    cy.get("select[name='type']").select("multiple-choice").should("have.value", "multiple-choice");
  });

  it("should focus elements if clicking on the label of the element", () => {
    //ID
    cy.get("label[for='modal-question-id-input']").click();
    cy.focused().should("have.attr", "name", "id").type("id").should("have.value", "id");

    //Title
    cy.get("label[for='modal-question-title-textarea']").click();
    cy.focused().should("have.attr", "name", "title").type("Title").should("have.value", "Title");

    //Points
    cy.get("label[for='modal-question-points-input']").click();
    cy.focused().should("have.attr", "name", "points").type("3").should("have.value", "3");

    //Help
    cy.get("label[for='modal-question-help-textarea']").click();
    cy.focused().should("have.attr", "name", "help").type("Help").should("have.value", "Help");

    //Type
    cy.get("label[for='modal-question-type-select']").click();
    cy.focused()
      .should("have.attr", "name", "type")
      .select("multiple-response")
      .should("have.value", "multiple-response");
  });

  it("should initially render with enabled submit button", () => {
    cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false");
  });

  it("should support tabbing content", () => {
    cy.get("body").tab().focused().should("have.attr", "name", "id");
    cy.get("input[name='id']").tab().focused().should("have.attr", "name", "title");
    cy.get("textarea[name='title']").tab().focused().should("have.attr", "name", "points");
    cy.get("input[name='points']").tab().focused().should("have.attr", "name", "help");
    cy.get("textarea[name='help']").tab().focused().should("have.attr", "name", "type");
  });

  it("should show 'Please select a Question Type' if no type is selected and clear it after type is selected", () => {
    cy.contains("Please select a Question Type");

    cy.get("select[name='type']").select("multiple-choice");
    cy.contains("Please select a Question Type").should("not.exist");
  });

  it("should show 'Please select a Question Type' after if was changed back to empty value", () => {
    cy.get("select[name='type']").select("multiple-choice");
    cy.get("select[name='type']").select("");
    cy.contains("Please select a Question Type").should("exist");
  });

  it("should request the modal to close on cancel click", () => {
    cy.contains("button", "Cancel").click();
    cy.get("@handleModalCloseSpy").should("have.been.called");
  });

  it("should change from radio inputs to checkboxes if changing from multiple-choice to multiple-response", () => {
    cy.get("select[name='type']").select("multiple-choice").should("have.value", "multiple-choice");
    cy.get("button#editor-add-item").click();
    cy.get(".editor-content").find("input[type='radio']").should("have.length", 1);

    cy.get("select[name='type']").select("multiple-response").should("have.value", "multiple-response");
    cy.get("button#editor-add-item").click();
    cy.get(".editor-content").find("input[type='checkbox']").should("have.length", 1);
  });

  it("shouldn't submit the form when clicking enter in the elements", () => {
    cy.get("select[name='type']").select("multiple-choice");

    //Create an input that would throw an error on submit
    cy.get("input[name='id']").type("#{enter}");
    cy.get("textarea[name='title']").type("title{enter}");
    cy.get("input[name='points']").type("5{enter}");
    cy.get("textarea[name='help']").type("help{enter}");

    //Check for multiple choice
    cy.get("select[name='type']").select("multiple-choice");
    cy.get("button#editor-add-item").type("{enter}");
    cy.get("input[type='radio'][value='option-0']").type("{enter}");
    cy.get(".editor-content").find("textarea").first().type("{enter}");
    cy.get("button#editor-remove-item").click();

    //Check multiple response
    cy.get("select[name='type']").select("multiple-response");
    cy.get("button#editor-add-item").click();
    cy.get("input[type='checkbox'][value='option-0']").type("{enter}");
    cy.get(".editor-content").find("textarea").first().type("{enter}");
    cy.get("button#editor-remove-item").click();

    //There should be no error because the form was never submitted
    cy.contains(`The id contains non allowed characters ("#")!`).should("not.exist");
  });
});

/* --------------------------------- Answer options editor ------------------------------------- */
describe("Test AnswerOptionsEditor inside QuestionEditor", () => {
  beforeEach(() => {
    cy.mount(<MockFormWithRouter />);
  });

  context("Multiple Choice", () => {
    it("should add radio elements with textarea if question type is multiple-choice", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("input[type='radio']").should("have.length", 2);
      cy.get(".editor").find("textarea[required]").should("have.length", 2);
    });

    it("should remove last radio element with textarea if question type is multiple-choice", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();
      cy.get(".editor").find("input[type='radio']").should("have.length", 2);

      cy.get("button#editor-remove-item").click();
      cy.get(".editor").find("input[type='radio']").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='option-1']").should("not.exist");
      cy.get(".editor").find("textarea[required]").should("have.length", 1);

      cy.get("button#editor-remove-item").click();
      cy.get(".editor").find("input[type='radio']").should("have.length", 0);
      cy.get(".editor").find("label[data-testid='option-0']").should("not.exist");
      cy.get(".editor").find("textarea[required]").should("have.length", 0);
    });

    it("should remove specif item from AnswerOptions (multiple-choice)", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("label[data-testid='option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("input[type='radio']").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='option-1']").should("exist");
    });

    it("should only have one radio checked at max if using multiple-choice", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("label[data-testid='option-1']").find("input[type='radio']").check().should("be.checked");

      cy.get(".editor").find("label[data-testid='option-0']").find("input[type='radio']").check().should("be.checked");

      cy.get(".editor").find("label[data-testid='option-1']").find("input[type='radio']").should("not.be.checked");
    });

    it("should not check radio button if editing textarea in multiple-choice element", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click();
      cy.get(".editor").find("textarea[required]").click();
      cy.get(".editor").find("label[data-testid='option-0']").find("input[type='radio']").should("not.be.checked");
    });

    it("should remove isCorrect and text prop from option if multiple-choice item is removed", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click();
      cy.get(".editor").find("label[data-testid='option-0']").find("input[type='radio']").click();
      cy.get(".editor").find("textarea[required]").type("This should be removed");

      //remove item and att new item
      cy.get("button#editor-remove-item").click();
      cy.get("button#editor-add-item").click();

      //check new item to be unused
      cy.get(".editor").find("label[data-testid='option-0']").find("input[type='radio']").should("not.be.checked");
      cy.get(".editor").find("textarea[required]").should("have.value", "");
    });

    it("should remove the selected multiple-choice element if there is initially one element", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click();

      cy.get(".editor").find("label[data-testid='option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("textarea[required]").should("have.length", 0);
      cy.get(".editor").find("label[data-testid='option-0']").should("not.exist");
    });

    it("should remove the selected multiple-choice element if there are initially multiple elements", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("label[data-testid='option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("textarea[required]").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='option-1']").should("exist");
    });

    it("should show no errors if removing multiple answerOptions before submit (multiple-choice)", () => {
      cy.get("select[name='type']").select("multiple-choice");

      cy.get("button#editor-add-item").click().click();
      cy.get("button#editor-remove-item").click().click();
      cy.contains("Add at least one item!").should("not.exist");
    });
  });

  context("Multiple Response", () => {
    it("should add checkbox elements with textarea if question type is multiple-choice", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("input[type='checkbox']").should("have.length", 2);
      cy.get(".editor").find("textarea[required]").should("have.length", 2);
    });

    it("should remove last radio element with textarea if question type is multiple-response", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();
      cy.get(".editor").find("input[type='checkbox']").should("have.length", 2);

      cy.get("button#editor-remove-item").click();
      cy.get(".editor").find("input[type='checkbox']").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='formControlLabel-option-1']").should("not.exist");
      cy.get(".editor").find("textarea[required]").should("have.length", 1);

      cy.get("button#editor-remove-item").click();
      cy.get(".editor").find("input[type='checkbox']").should("have.length", 0);
      cy.get(".editor").find("label[data-testid='formControlLabel-option-1']").should("not.exist");
      cy.get(".editor").find("textarea[required]").should("have.length", 0);
    });

    it("should remove specif item from AnswerOptions (multiple-response)", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("label[data-testid='formControlLabel-option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("input[type='checkbox']").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='formControlLabel-option-1']").should("exist");
    });

    it("should allow for multiple checkboxes to be checked if using multiple-response", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor")
        .find("label[data-testid='formControlLabel-option-1']")
        .find("input[type='checkbox']")
        .check()
        .should("be.checked");

      cy.get(".editor")
        .find("label[data-testid='formControlLabel-option-0']")
        .find("input[type='checkbox']")
        .check()
        .should("be.checked");

      cy.get(".editor")
        .find("label[data-testid='formControlLabel-option-1']")
        .find("input[type='checkbox']")
        .should("be.checked");
    });

    it("should not check checkbox if editing textarea in multiple-response element", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click();
      cy.get(".editor").find("textarea[required]").click();
      cy.get(".editor").find("input[type='checkbox']").should("not.be.checked");
    });

    it("should remove isCorrect and text prop from option if multiple-response item is removed", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click();
      cy.get(".editor").find("label[data-testid='formControlLabel-option-0']").find("input[type='checkbox']").click();
      cy.get(".editor").find("textarea[required]").type("This should be removed");

      //remove item and att new item
      cy.get("button#editor-remove-item").click();
      cy.get("button#editor-add-item").click();

      //check new item to be unused
      cy.get(".editor")
        .find("label[data-testid='formControlLabel-option-0']")
        .find("input[type='checkbox']")
        .should("not.be.checked");
      cy.get(".editor").find("textarea[required]").should("have.value", "");
    });

    it("should remove the selected multiple-response element if there is initially one element", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click();

      cy.get(".editor").find("label[data-testid='formControlLabel-option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("textarea[required]").should("have.length", 0);
      cy.get(".editor").find("label[data-testid='formControlLabel-option-0']").should("not.exist");
    });

    it("should remove the selected multiple-response element", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();

      cy.get(".editor").find("label[data-testid='formControlLabel-option-0']").click();
      cy.get("button#editor-remove-item").click();

      cy.get(".editor").find("textarea[required]").should("have.length", 1);
      cy.get(".editor").find("label[data-testid='formControlLabel-option-1']").should("exist");
    });

    it("should show no errors if removing multiple answerOptions before submit (multiple-response)", () => {
      cy.get("select[name='type']").select("multiple-response");

      cy.get("button#editor-add-item").click().click();
      cy.get("button#editor-remove-item").click().click();
      cy.contains("Add at least one item!").should("not.exist");
    });
  });
});

/* -------------------------------------- onSubmit errors ----------------------------------------*/
describe("Test QuestionEditor.jsx onSubmit errors", () => {
  beforeEach(() => {
    cy.mount(<MockFormWithRouter />);
  });

  it("should disable submit button after invalid prop entry with submit and enable it after error clearing", () => {
    //Add an invalid id (contains spaces) and add required values
    cy.get("input[name='id']").type("new id");
    cy.get("select[name='type']").select("multiple-choice");
    cy.get("button#editor-add-item").click();
    cy.get(".editor-content").find("input[type='radio']").click();
    cy.get(".editor-content").find("textarea").first().type("mc option text");
    cy.get("button[type='submit']").click();

    cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true");

    //clearing error
    cy.get("input[name='id']").type("{backspace}{backspace}{backspace}-id");
    cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false");
  });

  context("HTML5 Browser validation", () => {
    it("should show browser validation error for required id input", () => {
      cy.get("button[type='submit']").click();
      cy.get("input[name='id']").then(($input) => {
        expect($input[0].validationMessage).to.eq("Please fill in this field.");
      });
    });

    it("should show browser validation error for required select input", () => {
      cy.get("input[name='id']").type("new-id");

      cy.get("button[type='submit']").click();
      cy.get("select[name='type']").then(($input) => {
        expect($input[0].validationMessage).to.eq("Please select an item in the list.");
      });
    });

    it("should show browser validation error for out of range points input", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("input[name='points']").type("-5");

      cy.get("button[type='submit']").click();
      cy.get("input[name='points']").then(($input) => {
        expect($input[0].validationMessage).to.eq("Value must be greater than or equal to 0.");
      });
    });

    it("should show browser validation error for missing multiple choice values (one checked and textarea filled)", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("button#editor-add-item").click();
      cy.get("button[type='submit']").click();

      //Check for validation error message on radio and click it after test
      cy.get(".editor-content")
        .find("input[type='radio']")
        .then(($input) => {
          expect($input[0].validationMessage).to.eq("Please select one of these options.");
        })
        .click();

      cy.get("button[type='submit']").click();

      cy.get(".editor-content")
        .find("textarea")
        .first()
        .then(($input) => {
          expect($input[0].validationMessage).to.eq("Please fill in this field.");
        });
    });

    it("should only require one radio input to be checked)", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("button#editor-add-item").click().click();

      //Check for message to show up and click after message shows
      cy.get("button[type='submit']").click();
      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("input[type='radio']")
        .then(($input) => {
          expect($input[0].validationMessage).to.eq("Please select one of these options.");
        })
        .click();

      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      cy.get(".editor-content")
        .find("label[data-testid='option-1']")
        .find("textarea")
        .first()
        .type("Textarea value for option-1");

      cy.get("button[type='submit']").click();

      //Validate that the form submits
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should show browser validation error for empty textarea in multiple response", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-response");
      cy.get("button#editor-add-item").click();
      cy.get("input[type='checkbox'][value='option-0']").check();

      //Submit form
      cy.get("button[type='submit']").click();

      //Find HTML validation message on textarea
      cy.get(".editor-content")
        .find("textarea")
        .first()
        .then(($input) => {
          expect($input[0].validationMessage).to.eq("Please fill in this field.");
        })
        .type("Content after first tried submit");

      //Validate that the form submits
      cy.get("button[type='submit']").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });
  });

  context("Custom form validation", () => {
    it("should show error if id contains spaces and clear error if changed", { browser: "!electron" }, () => {
      cy.get("input[name='id']").type("new id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      //Check if error is shown
      cy.get("input[name='id']").should("have.class", "is-invalid");
      cy.contains(`The id has to be one word! Use hyphens ("-") to concat the word (e.g. new-id).`).should("exist");

      //Check clearing of error
      cy.get("input[name='id']").clear().type("new-id");
      cy.get("input[name='id']").should("not.have.class", "is-invalid");
      cy.contains(`The id has to be one word! Use hyphens ("-") to concat the word (e.g. new-id).`).should("not.exist");
    });

    it("should show error if the id contains not allowed chars", { browser: "!electron" }, () => {
      cy.get("input[name='id']").type("#+!$%&/()=?");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      //Check error handling
      cy.get("input[name='id']").should("have.class", "is-invalid");
      cy.contains(
        `The id contains non allowed characters ("#", "+", "!", "$", "%", "&", "/", "(", ")", "=", "?")`
      ).should("exist");
    });

    it("should show error if no checkboxes in multiple-response have been checked and clear error after checking one box ", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-response");
      cy.get("button#editor-add-item").click();
      cy.get(".editor-content").find("textarea").first().type("Option-0 textarea content");

      //Submit form, expect error and break out of submit
      cy.get("button[type='submit']").click();
      cy.contains("p", "Check at least one item!").should("exist");
      cy.get("@handleModalCloseSpy").should("not.have.been.called");

      //Fix error and check for successful submit
      cy.get("input[type='checkbox'][value='option-0']").check();
      cy.get("button[type='submit']").click();
      cy.contains("p", "Check at least one item!").should("not.exist");
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should show error if no answerOptions were selected", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");

      cy.contains("button", "Add").click();
      cy.contains("p", "Add at least one item!");
    });

    it("should show errors for different form elements at the same time", () => {
      cy.get("input[name='id']").type("id-with-#");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      //Check error messages
      cy.contains("p", `The id contains non allowed characters ("#")!`).should("exist");
      cy.contains("p", "Add at least one item!").should("exist");
    });
  });
});

/* --------------------------------------------- After submit ----------------------------------- */
describe("Test QuestionEditor.cy.js onChange errors after submit", () => {
  beforeEach(() => {
    cy.mount(<MockFormWithRouter />);
  });

  context("Predefined initial submit", () => {
    beforeEach(() => {
      //Trigger submit with error. Values are required so the html validation doesn't kick in.
      cy.get("input[name='id']").type("#");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("button#editor-add-item").click();

      cy.get(".editor-content").find("input[type='radio']").check();

      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      cy.contains("button", "Add").click();
      cy.get("input[name='id']").clear();
    });

    it("should have aria-disabled true on button after submit with error", () => {
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true");
    });

    it("should still have the ability to change the fields after submit if initial submit failed", () => {
      cy.get("input[name='id']").clear().type("new-id").should("have.value", "new-id");
      cy.get("textarea[name='title']").type("New title").should("have.value", "New title");
      cy.get("input[name='points']").type("5").should("have.value", "5");
      cy.get("textarea[name='help']").type("This is help").should("have.value", "This is help");
      cy.get("select[name='type']").select("multiple-response").should("have.value", "multiple-response");

      cy.get("button#editor-add-item").click();
      cy.get(".editor-content").find("input[type='checkbox']").check().should("be.checked");

      cy.get(".editor-content")
        .find("textarea")
        .first()
        .type("Textarea value for option-0")
        .should("have.value", "Textarea value for option-0");
    });

    it("should show error if id input field is empty after submit and clear error if input is typed into", () => {
      cy.get("input[name='id']").clear().should("have.class", "is-invalid");
      cy.contains("p", "The id can't be empty!").should("exist");

      //Type value into input
      cy.get("input[name='id']").type("new-id").should("have.class", "is-valid");
      cy.contains("p", "The id can't be empty!").should("not.exist");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should show error if using not allowed characters in id after submit and clear errors if valid id is typed into input", () => {
      cy.get("input[name='id']").clear().type("#+!$%&/()=?").should("have.class", "is-invalid");
      cy.contains(
        `The id contains non allowed characters ("#", "+", "!", "$", "%", "&", "/", "(", ")", "=", "?")`
      ).should("exist");

      //Type valid input
      cy.get("input[name='id']").clear().type("new-id").should("have.class", "is-valid");
      cy.contains(
        `The id contains non allowed characters ("#", "+", "!", "$", "%", "&", "/", "(", ")", "=", "?")`
      ).should("not.exist");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should show error if id contains spaces after submit and clear error after valid id is passed", () => {
      cy.get("input[name='id']").clear().type("id with blanks").should("have.class", "is-invalid");
      cy.contains(`The id has to be one word! Use hyphens ("-") to concat the word (e.g. id-with-blanks).`).should(
        "exist"
      );

      //Type valid input
      cy.get("input[name='id']").clear().type("new-id").should("have.class", "is-valid");
      cy.contains(`The id has to be one word! Use hyphens ("-") to concat the word (e.g. id-with-blanks).`).should(
        "not.exist"
      );

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should show error user selects empty value for type after submit ", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("").should("have.class", "is-invalid");
      cy.contains("p", "The type can't be empty!").should("exist");

      //Select valid input
      cy.get("select[name='type']").select("multiple-response").should("have.class", "is-valid");
      cy.contains("p", "The type can't be empty!").should("not.exist");
      cy.get("button#editor-add-item").click();
      cy.get("input[type='checkbox'][value='option-0']").check();
      cy.get(".editor-content").find("textarea").first().type("Textarea value for option-0");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should keep errors if changing id after type (after submit)", () => {
      //This is to test that the onChange validator doesn't overwrite existing errors with setErrors
      cy.get("select[name='type']").select("");
      cy.get("input[name='id']").type("#");

      cy.contains(`The id contains non allowed characters ("#")!`).should("exist");
      cy.contains(`The type can't be empty!`).should("exist");
    });

    it("should keep errors if changing type after id (after submit)", () => {
      //This is to test that the onChange validator doesn't overwrite existing errors with setErrors
      cy.get("input[name='id']").type("#");
      cy.get("select[name='type']").select("");

      cy.contains(`The id contains non allowed characters ("#")!`).should("exist");
      cy.contains(`The type can't be empty!`).should("exist");
    });
  });

  context("Without predefined fields submit", () => {
    it("should keep errors from submit if changing fields", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      //after submit
      cy.get("input[name='id']").type("#");
      cy.contains("p", "Add at least one item!").should("exist");
      cy.contains("p", `The id contains non allowed characters ("#")!`).should("exist");

      cy.get("input[name='id']").type("{backspace}").should("have.class", "is-valid");
      cy.contains("p", "Add at least one item!").should("exist");
      cy.contains("p", `The id contains non allowed characters ("#")!`).should("not.exist");
    });

    it("should add 'Add at least one item!' if multiple-choice options are removed after submit with error, keep other errors and clear error", () => {
      cy.get("input[name='id']").type("invalid id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("button#editor-add-item").click();

      cy.get(".editor-content").find("input[type='radio']").click();
      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");
      cy.contains("button", "Add").click();

      //after submit
      cy.get("button#editor-remove-item").click();
      cy.contains("Add at least one item!").should("exist");
      cy.contains(`The id has to be one word! Use hyphens ("-") to concat the word (e.g. invalid-id).`).should("exist");
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true");

      //make valid question and submit question
      cy.get("button#editor-add-item").click();
      cy.contains(`Add at least one item!`).should("not.exist");
      cy.get("input[name='id']").clear().type("valid-id");
      cy.get(".editor-content").find("input[type='radio']").click();
      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should add 'Add at least one item!' if multiple items are removed after submit", () => {
      //Make question with error to test form after submit
      cy.get("input[name='id']").type("invalid id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.get("button#editor-add-item").click().click();

      cy.get(".editor-content").find("input[type='radio']").first().click();

      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      cy.get(".editor-content")
        .find("label[data-testid='option-1']")
        .find("textarea")
        .first()
        .type("Textarea value for option-1");

      cy.contains("button", "Add").click();

      //After submit
      cy.get("input[name='id']").clear().type("valid-id");
      cy.get("button#editor-remove-item").click();
      cy.contains("Add at least one item!").should("not.exist");
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false");

      cy.get("button#editor-remove-item").click();
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true");
    });

    it("should clear 'Add at least one item!' error onChange after submit for multiple-choice", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      cy.get("button#editor-add-item").click();
      cy.contains("Add at least one item!").should("not.exist");

      cy.get(".editor-content").find("input[type='radio']").click();
      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should clear 'Add at least one item!' error onChange after submit for multiple-response", () => {
      cy.get("input[name='id']").type("new-id");
      cy.get("select[name='type']").select("multiple-response");
      cy.contains("button", "Add").click();

      cy.get("button#editor-add-item").click();
      cy.contains("Add at least one item!").should("not.exist");

      cy.get(".editor-content").find("input[type='checkbox']").click();
      cy.get(".editor-content")
        .find("label[data-testid='formControlLabel-option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });

    it("should submit after fixing multiple errors", () => {
      cy.get("input[name='id']").type("#");
      cy.get("select[name='type']").select("multiple-choice");
      cy.contains("button", "Add").click();

      cy.contains("p", `The id contains non allowed characters ("#")!`).should("exist");
      cy.contains("Add at least one item!").should("exist");
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true");

      cy.get("button#editor-add-item").click();
      cy.get("input[name='id']").type("{backspace}new-id");
      cy.get(".editor-content").find("input[type='radio']").click();
      cy.get(".editor-content")
        .find("label[data-testid='option-0']")
        .find("textarea")
        .first()
        .type("Textarea value for option-0");

      //Expect the submit button to work
      cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();
      cy.get("@handleModalCloseSpy").should("have.been.called");
    });
  });
});

//TODO
// - no error on update and same id
// - no error on updating and id

//should focus elements
//should focus elements on click
