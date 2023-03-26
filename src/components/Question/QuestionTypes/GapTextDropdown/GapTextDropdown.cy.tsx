/// <reference types="cypress" />

import { MemoryRouter, Route } from "react-router-dom";
import { ModuleProvider } from "../../../module/moduleContext";
import { Question } from "../../Question";
import { GapTextDropdown } from "./GapTextDropdown";

import "../../../../index.css";
import "../../Question.css";

import { IParams } from "../../../../utils/types";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

// Setup default options
const defaultMockOptions = {
  text: "This is a []. This Question is of type [].",
  dropdowns: [
    {
      id: "select-0",
      options: ["Gap", "Square", "Circle"],
      correct: "Gap",
    },
    {
      id: "select-1",
      options: ["Multiple Choice", "Gap Text With Dropdown", "Gap Text"],
      correct: "Gap Text With Dropdown",
    },
  ],
};

describe("GapTextDropdown Component", () => {
  it("should render component with dropdown options", () => {
    cy.mount(<GapTextDropdown options={defaultMockOptions} formDisabled={false} />);

    // Assert two dropdown elements to render
    cy.get("select").should("have.length", 2);

    // Assert that text renders
    cy.contains("This Question is of type").should("exist");
  });

  it("should render if there is just a gap", () => {
    const options = {
      text: "[]",
      dropdowns: [
        {
          id: "select-0",
          options: ["Gap", "Square", "Circle"],
          correct: "Gap",
        },
      ],
    };

    cy.mount(<GapTextDropdown options={options} formDisabled={false} />);

    cy.get("select").should("have.length", 1);
  });

  it("should render text after a gap", () => {
    const options = {
      text: "[] Text",
      dropdowns: [
        {
          id: "select-0",
          options: ["Gap", "Square", "Circle"],
          correct: "Gap",
        },
      ],
    };

    cy.mount(<GapTextDropdown options={options} formDisabled={false} />);

    cy.get("select").should("have.length", 1);
    cy.contains("Text").should("exist");
  });

  it("should render two gaps next to each other", () => {
    const options = {
      text: "[][]",
      dropdowns: [
        {
          id: "select-0",
          options: ["Gap"],
          correct: "Gap",
        },
        {
          id: "select-1",
          options: ["Another Gap"],
          correct: "Another Gap",
        },
      ],
    };

    cy.mount(<GapTextDropdown options={options} formDisabled={false} />);

    cy.get("select").should("have.length", 2);
  });

  it("should render just text if there is no gap", () => {
    const options = {
      text: "This is just text",
    };

    cy.mount(<GapTextDropdown options={options} formDisabled={false} />);

    cy.contains("This is just text").should("exist");
  });

  it("should have 8 options (6 from the provided options + 2 empty ones)", () => {
    cy.mount(<GapTextDropdown options={defaultMockOptions} formDisabled={false} />);

    // Assert that 8 option elements are found
    cy.get("option").should("have.length", 8);
  });

  it("should handle changeEvent on select element", () => {
    cy.mount(<GapTextDropdown options={defaultMockOptions} formDisabled={false} />);

    // Test second select first
    cy.get("select#select-1").select("Gap Text With Dropdown").should("have.value", "Gap Text With Dropdown");

    // Assert that first select has correct value after change event
    cy.get("select#select-0").select("Gap").should("have.value", "Gap");
  });

  it("should render the same order of options after selection ", () => {
    cy.mount(<GapTextDropdown options={defaultMockOptions} formDisabled={false} />);

    let itemsOrder: string[] = [];

    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // store the order of the options in the itemsOrder array
        itemsOrder = options.get().map((option) => option.value);
      });

    cy.get<HTMLSelectElement>("select#select-0").select("Gap");

    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // create an array to store the current order of the options
        const currentOrder = options.get().map((option) => option.value);

        // assert that the current order is the same as the original order
        expect(currentOrder).to.deep.eq(itemsOrder);
      });
  });

  it("should disable all select elements if disabled prop is passed ", () => {
    cy.mount(<GapTextDropdown options={defaultMockOptions} formDisabled={true} />);

    // Assert that every select element is disabled
    cy.get("select").each(($el) => {
      expect($el).to.have.prop("disabled", true);
    });
  });
});

/* ------------------------------- Gap Text with Dropdown + Question Component ----------------- */

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

describe("Gap Text with Dropdown component inside Question component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-gap_text_dropdown.json");
  });

  it("should render Gap Text with Dropdown Question ", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    cy.get("select").should("have.length", 2);
  });

  it("should clear all select values on reset button click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Select values
    cy.get("select#select-0").select("Gap Text with Dropdown").should("have.value", "Gap Text with Dropdown");
    cy.get("select#select-1").select("fixture").should("have.value", "fixture");

    // Click reset button
    cy.get("button[aria-label='Reset Question']").click();

    // Assert that the value has cleared
    cy.get("select#select-0").should("have.value", "");
    cy.get("select#select-1").should("have.value", "");
  });

  it("should have the same order of items in select after reset click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-3' />);

    // Select a value
    cy.get("select#select-0").select(2);

    let itemsOrderBeforeReset: string[] = [];

    // Get order of options in select before reset click
    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // store the order of the options in the itemsOrderBeforeRetry array
        itemsOrderBeforeReset = options.get().map((option) => option.value);
      });

    // Click reset button
    cy.get("button[aria-label='Reset Question']").click();

    // Get order of options in select after reset click
    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // store the order of the current options in the itemsOrderAFTERReset array
        const itemsOrderAfterReset = options.get().map((option) => option.value);

        expect(itemsOrderBeforeReset).to.deep.eq(itemsOrderAfterReset);
      });
  });

  it("should clear all select values on retry button click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Select values
    cy.get("select#select-0").select("Gap Text with Dropdown").should("have.value", "Gap Text with Dropdown");
    cy.get("select#select-1").select("fixture").should("have.value", "fixture");

    //Submit Question and click retry button
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that the value has cleared
    cy.get("select#select-0").should("have.value", "");
    cy.get("select#select-1").should("have.value", "");
  });

  it("should reset the border color on retry click to gray", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    //Submit Question and click retry button
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    cy.get("select#select-0").should("have.css", "border", "1px solid rgb(180, 180, 180)");
  });

  it("should render the same order of options after question retry", { retries: 10 }, () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-3' />);

    let itemsOrderBeforeRetry: string[] = [];

    // Get order of options in select
    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // store the order of the options in the itemsOrderBeforeRetry array
        itemsOrderBeforeRetry = options.get().map((option) => option.value);
      });

    //Submit Question and click retry button
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    // Get order of options in select after retry click
    cy.get<HTMLSelectElement>("select#select-0")
      .children()
      .filter("option")
      .then((options: JQuery<HTMLOptionElement>) => {
        // store the order of the current options in the itemsOrderAFTERRetry array
        const itemsOrderAfterRetry = options.get().map((option) => option.value);

        expect(itemsOrderBeforeRetry).not.to.deep.eq(itemsOrderAfterRetry);
      });
  });

  it("should disable all select elements on question submit", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Submit Question
    cy.get("button[type='submit']").click();

    // Assert that all select elements are disabled
    cy.get("section.question-user-response")
      .get("select")
      .each(($el) => {
        expect($el).to.have.prop("disabled", true);
      });
  });

  it("should enable all select elements on retry question click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Submit Question and click retry
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that all select elements are disabled
    cy.get("section.question-user-response")
      .get("select")
      .each(($el) => {
        expect($el).to.have.prop("disabled", false);
      });
  });

  it("should enable all inputs after submit and navigating to next question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Submit form and navigate to next question
    cy.get("button[type='submit']").click().click();

    // Assert each element to be enabled (not disabled)
    cy.get("section.question-user-response")
      .get("select")
      .each(($el) => {
        expect($el).to.have.prop("disabled", false);
      });

    // Assert that element is still interactive
    cy.get("select#select-0").select("second").should("have.value", "second");
  });

  it("should deselect the values if navigating to the next question and use the new values for correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

    // Select value in first select element
    cy.get("select#select-0").select("Gap Text");

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Navigate to new site
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the select has empty value after navigation
    cy.get("select#select-0").should("have.value", "");

    // Check correct answer
    cy.get("select#select-0").select("second").should("have.value", "second");

    // Submit question
    cy.get("button[type='submit']").click();

    // Check correction
    cy.contains("Yes, that's correct!").should("exist");
  });

  context("Question correction on submit", () => {
    it("should show that the answer is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select correct values
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show that the answer is correct if the answer is correct but entered in a non chronological order", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select correct values in non chronological order
      cy.get("select#select-1").select("fixture");
      cy.get("select#select-0").select("Gap Text with Dropdown");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show question correction after submit even if answer was correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select correct values
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check that the answer correction works
      cy.get(".question-correction").contains("Gap Text with Dropdown").should("exist");
      cy.get(".question-correction").contains("question comes from").should("exist");
      cy.get(".question-correction").contains("fixture").should("exist");
    });

    it("should show that the given answer is incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select incorrect values
      cy.get("select#select-0").select("Gap Text");
      cy.get("select#select-1").select("internet");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should show question correction after submit if answer was incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select incorrect values
      cy.get("select#select-0").select("Gap Text");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check that the answer correction works
      cy.get(".question-correction").contains("No, that's false!").should("exist");
      cy.get(".question-correction").contains("Gap Text with Dropdown").should("exist");
      cy.get(".question-correction").contains("question comes from").should("exist");
      cy.get(".question-correction").contains("fixture").should("exist");
    });

    it("should work after moving from a question with one input to multiple inputs", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-2' />);

      cy.get("select#select-0").select("second");

      // Click show navigation button that only exists on small displays
      cy.get("body").then((body) => {
        if (body.find("button[aria-label='Show Navigation']").length > 0) {
          cy.get("button[aria-label='Show Navigation']").click();
        }
      });

      // Navigate to new site
      cy.get("button[aria-label='Navigate to previous Question']").click();

      // Select correct values
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    // BORDER
    it("should show green border on select element if the answer of the user is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select correct answers
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green on both elements
      cy.get("select#select-0").should("have.css", "border", "1px solid rgb(0, 128, 0)");
      cy.get("select#select-1").should("have.css", "border", "1px solid rgb(0, 128, 0)");
    });

    it("should show red border on select element if the answer of the user is incorrect or the user didn't select anything", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select incorrect answer
      cy.get("select#select-0").select("Gap Text");

      // submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green on both elements
      cy.get("select#select-0").should("have.css", "border", "1px solid rgb(255, 0, 0)");
      cy.get("select#select-1").should("have.css", "border", "1px solid rgb(255, 0, 0)");
    });

    it("should show answer as incorrect if the user doesn't select anything", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer correction works
      cy.get(".question-correction").contains("No, that's false!").should("exist");
    });

    it("should show the answer as correct if the first answer was incorrect but the user clicked retry and answered correctly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select incorrect values
      cy.get("select#select-0").select("Gap Text");
      cy.get("select#select-1").select("internet");

      // Submit question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Select correct values
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as incorrect if the first answer was correct but the user clicked retry and answered incorrectly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text_dropdown' questionID='gtd-1' />);

      // Select correct values
      cy.get("select#select-0").select("Gap Text with Dropdown");
      cy.get("select#select-1").select("fixture");

      // Submit question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Select incorrect values
      cy.get("select#select-0").select("Gap Text");
      cy.get("select#select-1").select("internet");

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer is incorrect
      cy.contains("No, that's false!").should("exist");
    });
  });
});
