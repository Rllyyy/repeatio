/// <reference types="cypress" />

import { MemoryRouter, Route } from "react-router-dom";
import { ModuleProvider } from "../../../module/moduleContext";
import { Question } from "../../Question";
import { MultipleChoice } from "./MultipleChoice";

import "../../../../index.css";
import "../../Question.css";

import { IParams } from "../../../../utils/types";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

const defaultMockOptions = [
  {
    id: "option-0",
    text: "This is the correct multiple choice value",
    isCorrect: true,
  },
  {
    id: "option-1",
    text: "This is a false multiple choice value",
    isCorrect: false,
  },
  {
    id: "option-2",
    text: "This is another false multiple choice value",
    isCorrect: false,
  },
];

describe("MultipleChoice Component", () => {
  it("should render 3 Multiple-Choice elements", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={false} />);

    // Query the DOM for input elements of type radio and assert that there are 3 of them
    cy.get("input[type='radio']").should("have.length", 3);
  });

  it("should select element if clicking on radio input (circle)", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={false} />);
    cy.get("input[value='option-0']").check().should("be.checked");
  });

  it("should select element if clicking on the text", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={false} />);
    cy.contains("This is the correct multiple choice value").click();
    cy.get("input[value='option-0']").should("be.checked");
  });

  it("should deselect previous input if clicking on other input", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={false} />);

    // Click on element
    cy.get("input[value='option-0']").check();

    // Click other element
    cy.get("input[value='option-1']").check().should("be.checked");

    //Assert that the first element that was clicked is not checked anymore
    cy.get("input[value='option-0']").should("not.be.checked");
  });

  it("should disable the input elements if form is disabled", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={true} />);
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
    cy.mount(<MultipleChoice options={options} formDisabled={false} />);
    cy.contains("strong", "correct").should("exist");
  });

  it("should have no material ui out animation", () => {
    cy.mount(<MultipleChoice options={defaultMockOptions} formDisabled={false} />);

    cy.get("input[type='radio']")
      .not("checked")
      .parent()
      .find("span")
      .first()
      .find("svg")
      .last()
      .should("have.css", "transition", "transform 0s cubic-bezier(0.4, 0, 1, 1) 0s");
  });
});

//Setup Router to access context and useParams
const RenderQuestionWithRouter = ({ moduleID, questionID }: Required<IParams>) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=practice&order=chronological`]}>
      <main style={{ marginTop: 0 }}>
        <ModuleProvider>
          <Route path='/module/:moduleID/question/:questionID' component={Question} />
        </ModuleProvider>
      </main>
    </MemoryRouter>
  );
};

describe("Multiple Choice component inside Question component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
  });

  it("should render Multiple Choice Question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Assert all elements to render
    cy.get("input[type='radio']").should("have.length", 3);
  });

  it("should deselect selected radio input if clicking on the reset button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Check correct radio input
    cy.get("input[value='option-0']").check();

    // Click reset button
    cy.get("button[aria-label='Reset Question']").click();

    // Assert that the radio input is not checked
    cy.get("input[value='option-0']").should("not.be.checked");
  });

  it("should keep the order of radio items after the reset button click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

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

  it("should deselect selected radio input if clicking on the retry button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Check correct radio input
    cy.get("input[value='option-0']").check();

    // Submit the form
    cy.get("button[type='submit']").click();

    // Click retry button
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that the radio input is not checked
    cy.get("input[value='option-0']").should("not.be.checked");
  });

  it("should remove the outline on retry click ", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Submit form
    cy.get("button[type='submit']").click();

    // Click on retry button
    cy.get("button[aria-label='Retry Question']").click();

    // Get the element that had the outline after the submit and assert that it has no outline
    cy.get("label[data-testid='option-0']").should("have.css", "outlineWidth", "0px");
  });

  it("should randomize the options after retry click", { retries: 10 }, () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-3' />);

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

  it("should disable all input in form on submit", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Submit form
    cy.get("button[type='submit']").click();

    // Assert that each element is disabled
    cy.get("input[type='radio']").each(($el) => {
      expect($el).to.have.prop("disabled", true);
    });
  });

  it("should enable all inputs in form after retry", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Submit form
    cy.get("button[type='submit']").click();

    // Click on retry button
    cy.get("button[aria-label='Retry Question']").click();

    // Assert each element to be enabled (not disabled)
    cy.get("input[type='radio']").each(($el) => {
      expect($el).to.have.prop("disabled", false);
    });

    // Assert that element is still interactive
    cy.get("input[value='option-0']").check().should("be.checked");
  });

  it("should enable all inputs after submit and navigating to next question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Submit form and navigate to next question
    cy.get("button[type='submit']").click().click();

    // Assert each element to be enabled (not disabled)
    cy.get("input[type='radio']").each(($el) => {
      expect($el).to.have.prop("disabled", false);
    });

    // Assert that element is still interactive
    cy.get("input[value='option-0']").check().should("be.checked");
  });

  it("should not submit the form on enter key stroke", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

    // Type enter on radio input and assert that form doesn't submit (element should stay enabled)
    cy.get("input[value='option-1']").type("{enter}").should("not.be.disabled");
  });

  it("should uncheck the question if navigating to the next question and use a new value for correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

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

    // Check correct radio button
    cy.get("input[value='option-1']").check();

    // Submit question
    cy.get("button[type='submit']").click();

    // Check correction
    cy.contains("Yes, that's correct!").should("exist");
  });

  context("Question correction on submit", () => {
    it("should show that the answer is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click correct answer
      cy.contains("This is the correct multiple choice value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show question correction after submit (case answer correct)", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click on correct radio input
      cy.contains("This is the correct multiple choice value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Question correction should say that the answer is correct with green css
      cy.get("section.question-correction")
        .should("have.css", "border", "2px solid rgb(21, 104, 60)")
        .and("have.css", "backgroundColor", "rgb(145, 202, 172)");

      cy.contains("Yes, that's correct!").should("be.visible");
      cy.get(".question-correction")
        .find("ul > li > p")
        .should("have.text", "This is the correct multiple choice value");
    });

    it("should show question correction after submit (case answer false)", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click on false radio input
      cy.contains("This is a false multiple choice value").click();

      // Submit question
      cy.get("button[type='submit']").click();

      // Question correction should say that the answer is false with red css
      cy.get("section.question-correction")
        .should("have.css", "border", "2px solid rgb(173, 31, 15)")
        .and("have.css", "backgroundColor", "rgb(241, 177, 170)");

      cy.contains("No, that's false! The correct answer is:").should("be.visible");
      cy.get(".question-correction")
        .find("ul > li > p")
        .should("have.text", "This is the correct multiple choice value");
    });

    it("should outline correct answer in green after submit if user selection is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click correct radio input and submit question
      cy.contains("This is the correct multiple choice value").click();
      cy.get("button[type='submit']").click();

      // Asset that the correct label has a green outline after submit
      cy.get("label[data-testid='option-0']").should("have.css", "outline", "rgb(0, 128, 0) solid 1px");
    });

    it("should outline correct answer and user selection in red after submit if user selection is false", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click false radio input and submit question
      cy.contains("This is a false multiple choice value").click();
      cy.get("button[type='submit']").click();

      // Assert that the the selected and correct answer have a red outline
      cy.get("label[data-testid='option-1']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
      cy.get("label[data-testid='option-0']").should("have.css", "outline", "rgb(255, 0, 0) solid 1px");
    });

    it("should show answer as incorrect answer if user didn't select anything", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer is incorrect
      cy.contains("p", "No, that's false! The correct answer is:").should("exist");
    });

    it("should show the answer as correct if the first answer was incorrect but the user clicked retry and answered correctly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click false value and submit
      cy.contains("This is a false multiple choice value").click();
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Click correct answer ans submit
      cy.contains("This is the correct multiple choice value").click();
      cy.get("button[type='submit']").click();

      // Assert that answer is correct
      cy.contains("p", "Yes, that's correct!").should("exist");
    });

    it("should show the answer as incorrect if the first answer was correct but the user reset and answered incorrectly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='multiple_choice' questionID='mc-1' />);

      // Click correct value and submit
      cy.contains("This is the correct multiple choice value").click();
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Click incorrect answer
      cy.get("button[type='submit']").click();
      cy.contains("This is a false multiple choice value").click();

      // Assert that answer is incorrect
      cy.contains("p", "No, that's false! The correct answer is:").should("exist");
    });
  });
});

// Should remove oultine on
