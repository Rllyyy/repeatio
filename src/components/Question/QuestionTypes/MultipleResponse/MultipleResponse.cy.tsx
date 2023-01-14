/// <reference types="cypress" />

import { MultipleResponse } from "./MultipleResponse";
import { Question } from "../../Question";

import { MemoryRouter, Route } from "react-router-dom";
import { ModuleProvider } from "../../../module/moduleContext";

import "../../../../index.css";
import "../../Question.css";

import { IParams } from "../../../../utils/types";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

/* 
  This file contains two test environments. 
  The first just mounts the MultipleResponse component.
  The second one renders the whole question component and uses the localStorage.
  Use the first option if just the component should be tested.
*/

const defaultMockOptions = [
  {
    id: "option-0",
    text: "This is the correct multiple response value",
    isCorrect: true,
  },
  {
    id: "option-1",
    text: "This is a false multiple response value",
    isCorrect: false,
  },
  {
    id: "option-2",
    text: "This is another false multiple response value",
    isCorrect: false,
  },
  {
    id: "option-3",
    text: "This is another correct multiple response value",
    isCorrect: true,
  },
];

describe("Multiple Response component", () => {
  it("should render 4 Multiple-Choice elements", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={false} />);

    // Query the DOM for input elements of type checkbox and assert that there are 4 of them
    cy.get("input[type='checkbox']").should("have.length", 4);
  });

  it("should select element if clicking on checkbox input (square)", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={false} />);

    // Check two checkboxes and assert that they are checked
    cy.get("input[value='option-0']").check().should("be.checked");
    cy.get("input[value='option-3']").check().should("be.checked");
  });

  it("should deselect element if clicking on checkbox input (square) again", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={false} />);

    // Check item
    cy.get("input[value='option-3']").check().should("be.checked");

    // Check and uncheck item and assert that input is unchecked
    cy.get("input[value='option-0']").click().click().should("not.be.checked");
  });

  it("should select element if clicking on the text", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={false} />);
    cy.contains("This is the correct multiple response value").click();
    cy.get("input[value='option-0']").should("be.checked");
  });

  it("should select multiple elements if clicking on checkbox ", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={false} />);

    // Check two checkboxes and assert that they are checked
    cy.get("input[value='option-0']").check();
    cy.get("input[value='option-3']").check().should("be.checked");
    cy.get("input[value='option-0']").should("be.checked");
  });

  it("should disable the input elements if form is disabled", () => {
    cy.mount(<MultipleResponse options={defaultMockOptions} formDisabled={true} />);
    cy.get("input[value='option-0']").should("be.disabled");
  });

  it("should support markdown", () => {
    const options = [
      {
        id: "option-0",
        text: "This is the **correct** multiple choice value",
        isCorrect: true,
      },
    ];
    cy.mount(<MultipleResponse options={options} formDisabled={false} />);
    cy.contains("strong", "correct").should("exist");
  });
});

//Setup Router to access context and useParams
const RenderQuestionWithRouter = ({ moduleID, questionID }: IParams) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}`]}>
      <main style={{ marginTop: 0 }}>
        <ModuleProvider>
          <Route path='/module/:moduleID/question/:questionID' component={Question} />
        </ModuleProvider>
      </main>
    </MemoryRouter>
  );
};

describe("MultipleResponse Component rendered inside Question Component with Router", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_response.json");
  });

  it("should render Multiple Response Question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Assert all elements to render
    cy.get("input[type='checkbox']").should("have.length", 4);
  });

  it("should deselect selected checkbox input if clicking on the reset button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Check correct checkbox input
    cy.get("input[value='option-0']").check();

    // Click reset button
    cy.get("button[aria-label='Reset Question']").click();

    // Assert that the checkbox input is not checked
    cy.get("input[value='option-0']").should("not.be.checked");
  });

  it("should keep the order of checkbox items after the reset button click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    let orderBeforeResetClick: string[] = [];

    cy.get("span.formControlLabel-typography")
      .find("p")
      .then((paragraphs) => {
        // store order of items in array
        orderBeforeResetClick = paragraphs.get().map((paragraph) => paragraph.textContent || "");
      });

    // Click on reset button
    cy.get("button[aria-label='Reset Question']").click();

    // Get all elements again and check order
    cy.get("span.formControlLabel-typography")
      .find("p")
      .then((paragraphs) => {
        // store current order of items in array
        const orderAfterRetryClick = paragraphs.get().map((paragraph) => paragraph.textContent || "");

        // Assert that both arrays are identical
        expect(orderBeforeResetClick).to.deep.eq(orderAfterRetryClick);
      });
  });

  it("should deselect selected checkbox input if clicking on the retry button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Check correct checkbox input
    cy.get("input[value='option-0']").check();

    // Submit the form
    cy.get("button[type='submit']").click();

    // Click reset button
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that the checkbox input is not checked
    cy.get("input[value='option-0']").should("not.be.checked");
  });

  it("should randomize the options after retry click", { retries: 10 }, () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-3' />);

    let orderBeforeRetryClick: string[] = [];

    cy.get("div.MuiFormGroup-root")
      .find("label")
      .then((labels) => {
        // store order of items in array
        orderBeforeRetryClick = labels.get().map((label) => label.getAttribute("data-testid") || "");
      });

    // submit question
    cy.get("button[type='submit']").click();

    // Click retry button
    cy.get("button[aria-label='Retry Question']").click();

    // Get all elements again
    cy.get("div.MuiFormGroup-root")
      .find("label")
      .then((labels) => {
        // store order of items in array
        const orderAfterRetryClick = labels.get().map((label) => label.getAttribute("data-testid") || "");

        expect(orderBeforeRetryClick).not.to.deep.eq(orderAfterRetryClick);
      });
  });

  it("should disable all input in form after submit", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Submit form
    cy.get("button[type='submit']").click();

    // Assert that each element is disabled
    cy.get("input[type='checkbox']").each(($el) => {
      expect($el).to.have.prop("disabled", true);
    });
  });

  it("should enable all inputs in form after retry", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Submit form
    cy.get("button[type='submit']").click();

    // Click on retry button
    cy.get("button[aria-label='Retry Question']").click();

    // Assert each element to be enabled (not disabled)
    cy.get("input[type='checkbox']").each(($el) => {
      expect($el).to.have.prop("disabled", false);
    });

    // Assert that element is still interactive
    cy.get("input[value='option-0']").check().should("be.checked");
  });

  it("should enable all inputs after submit and navigating to next question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Submit form and navigate to next question
    cy.get("button[type='submit']").click().click();

    // Assert each element to be enabled (not disabled)
    cy.get("input[type='checkbox']").each(($el) => {
      expect($el).to.have.prop("disabled", false);
    });

    // Assert that element is still interactive
    cy.get("input[value='option-0']").check().should("be.checked");
  });

  it("should not submit the form on enter key stroke", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Type enter on checkbox input and assert that form doesn't submit (element should stay enabled)
    cy.get("input[value='option-1']").type("{enter}").should("not.be.disabled");
  });

  it("should uncheck the question if navigating to the next question and use a new value for correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Check input
    cy.get("input[value='option-0']").check();

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Navigate to new site
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Input should not be checked
    cy.get("input[value='option-0']").should("not.be.checked");

    // Check correct checkbox input button
    cy.get("input[value='option-1']").check();

    // Submit question
    cy.get("button[type='submit']").click();

    // Check correction
    cy.contains("Yes, that's correct!").should("exist");
  });

  context("Question correction on submit", () => {
    it("should show that the answer is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

      // Click correct answers
      cy.contains("This is the correct multiple response value").click();
      cy.contains("This is another correct multiple response value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show question correction after submit (case answer correct)", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

      // Click correct answers
      cy.contains("This is the correct multiple response value").click();
      cy.contains("This is another correct multiple response value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Question correction should say that the answer is correct with green css
      cy.get("section.question-correction")
        .should("have.css", "border", "2px solid rgb(21, 104, 60)")
        .and("have.css", "backgroundColor", "rgb(145, 202, 172)");

      cy.contains("Yes, that's correct!").should("be.visible");
      cy.get(".question-correction").contains("li", "This is the correct multiple response value").should("exist");
      cy.get(".question-correction").contains("li", "This is another correct multiple response value").should("exist");
    });

    it("should show question correction after submit (case answer false)", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

      // Click correct answers
      cy.contains("This is a false multiple response value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Question correction should say that the answer is false with red css
      cy.get("section.question-correction")
        .should("have.css", "border", "2px solid rgb(173, 31, 15)")
        .and("have.css", "backgroundColor", "rgb(241, 177, 170)");

      cy.contains("No, that's false! The correct answer is:").should("be.visible");
      cy.get(".question-correction").contains("li", "This is the correct multiple response value").should("exist");
      cy.get(".question-correction").contains("li", "This is another correct multiple response value").should("exist");
    });

    it("should outline correct answer in green after submit if user selection is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

      // Click correct checkbox inputs and submit question
      cy.contains("This is the correct multiple response value").click();
      cy.contains("This is another correct multiple response value").click();
      cy.get("button[type='submit']").click();

      // Asset that the correct labels have a green outline after submit
      cy.get("label[data-testid='formControlLabel-option-0']").should(
        "have.css",
        "outline",
        "rgb(0, 128, 0) solid 1px"
      );
      cy.get("label[data-testid='formControlLabel-option-3']").should(
        "have.css",
        "outline",
        "rgb(0, 128, 0) solid 1px"
      );
    });
  });

  it("should outline correct answer and user selection in red after submit if user selection is false", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Click false checkbox input and submit question
    cy.contains("This is a false multiple response value").click();
    cy.get("button[type='submit']").click();

    // Assert that the the selected and correct answer have a red outline
    cy.get("label[data-testid='formControlLabel-option-0']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
    cy.get("label[data-testid='formControlLabel-option-3']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
  });

  it("should show answer as incorrect answer if user didn't select anything", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Submit question
    cy.get("button[type='submit']").click();

    // Assert that the answer is incorrect
    cy.contains("p", "No, that's false! The correct answer is:").should("exist");
  });

  it("should show the answer as correct if the first answer was incorrect but the user reset and then answered correct", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Click false value and submit
    cy.contains("This is a false multiple response value").click();
    cy.get("button[type='submit']").click();

    // Retry question
    cy.get("button[aria-label='Retry Question']").click();

    // Click correct answers and submit
    cy.contains("This is the correct multiple response value").click();
    cy.contains("This is another correct multiple response value").click();
    cy.get("button[type='submit']").click();

    // Assert that answer is correct
    cy.contains("p", "Yes, that's correct!").should("exist");
  });

  it("should show the answer as incorrect if the first answer was correct but the user reset and answered incorrect", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_response' questionID='mr-1' />);

    // Click correct values and submit
    cy.contains("This is the correct multiple response value").click();
    cy.contains("This is another correct multiple response value").click();
    cy.get("button[type='submit']").click();

    // Retry question
    cy.get("button[aria-label='Retry Question']").click();

    // Click incorrect answer
    cy.get("button[type='submit']").click();
    cy.contains("This is a false multiple response value").click();

    // Assert that answer is incorrect
    cy.contains("p", "No, that's false! The correct answer is:").should("exist");
  });
});
