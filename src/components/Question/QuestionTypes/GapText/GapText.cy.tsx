/// <reference types="cypress" />

import { MemoryRouter, Route } from "react-router-dom";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";
import { Question } from "../../Question";
import { GapText } from "./GapText";

import { IParams } from "../../../../utils/types";

import "../../../../index.css";
import "../../Question.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

describe("GapText", () => {
  it("should render 3 gap text elements", () => {
    const options = {
      text: "[] two **three**. One [] three. One two []",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 3);
    cy.contains("strong", "three").should("exist");
  });

  it("should render multiple gaps and display input", () => {
    const options = {
      text: "[][][]",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 3);

    cy.get("input").eq(1).type("two").should("have.value", "two");
    cy.get("input").last().type("three").should("have.value", "three");
    cy.get("input").first().type("One").should("have.value", "One");
  });

  it("should render gap text even if there are no gaps", () => {
    const options = {
      text: "Text without any gaps",
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.contains("Text without any gaps").should("exist");
    cy.get("input").should("not.exist");
  });

  it("should tab through inputs", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("body").tab().focused().type("One").should("have.value", "One");
    cy.get("input[value='One']").tab().focused().type("two").should("have.value", "two");
  });

  it("should not show error if there is no text and no correctGapValues", () => {
    const options = { text: "" };
    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get(".question-gap-text").should("exist");
  });

  it("should render links instead of gaps", () => {
    const options = {
      text: "[]()This line should [not](www.google.com) include any gaps. []()\nBut this one can have a [].",
      correctGapValues: [["gap"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 1);
    cy.get("a").should("have.length", 3);
  });

  it("should render image instead of gaps", () => {
    const options = {
      text: "![]() This line should have ![]() an image ![cypress](https://raw.githubusercontent.com/cypress-io/cypress/develop/assets/cypress-logo-light.png) and no gap!\n But this one should have a []",
      correctGapValues: [["gap"]],
    };

    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("input").should("have.length", 1);
    cy.get("img").should("have.length", 3);
    cy.get("img").last().invoke("height").should("be.greaterThan", 150);
  });

  it("should render table with a gap if there is text before", () => {
    const options = {
      text: "Text before\n| test | this |\n|------|------|\n| is   | []   |",
      correctGapValues: [["gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.contains("Text before").should("be.visible");
    cy.get("table").should("exist").and("be.visible");
    cy.get("input").should("exist").type("value").should("have.value", "value");
  });

  it("should render markdown table with a gap inside div with whitespace", () => {
    const options = {
      text: `This table<div style=" white-space: normal;">\n | test | this |\n|------|------|\n| is   | []   | \n </div>\n\n **Bold**`,
      correctGapValues: [["gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("table").should("exist").and("be.visible");
    cy.contains("strong", "Bold").should("exist");
    cy.get("input").should("exist").type("value").should("have.value", "value");
  });

  it("should render list with a gap and gap above list", () => {
    const options = {
      text: `[]\n - [] \n - there`,
      correctGapValues: [["List", "gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("input").should("have.length", 2);
    cy.get("li").should("have.length", 2);
    cy.contains("li", "there").should("exist");
  });

  it("should update the input elements on input change", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").first().type("One").should("have.value", "One");
    cy.get("input").eq(1).type("two").should("have.value", "two");
    cy.get("input").last().type("three").should("have.value", "three");
  });

  it("should disable inputs if disabled is passed from the parent", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={true} />);

    cy.get("input").each(($el) => expect($el).to.be.disabled);
  });

  it("should render markdown element in first line", () => {
    const options = {
      text: "1. List [] \n 2. Another item",
      correctGapValues: [["item"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.get("ol").find("li").should("have.length", 2);
    cy.get("input").should("have.length", 1).and("be.visible");
  });

  it("should render markdown list if the first item is a gap", () => {
    const options = {
      text: "[]\n 1. List [] \n 2. Another item",
      correctGapValues: [["The List", "Item"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.contains("li", "List").should("exist");
    cy.get("input").should("have.length", 2);
  });

  //This might break if using a parser
  it("should continue formatting if gap is in-between", () => {
    const options = {
      text: `**This [] should be bold**`,
      correctGapValues: [["line"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.contains("strong", "This").should("exist");
    cy.contains("strong", "should be bold").should("exist");

    cy.get("input").should("have.length", 1);
  });

  it("should support html elements at the beginning", () => {
    const options = {
      text: "<h1>Heading</h1>\n\n **Bold** \n [] [] Test []",
      correctGapValues: [["One"], ["Two"], ["."]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.contains("h1", "Heading").should("exist");
    cy.contains("strong", "Bold").should("exist");
    cy.get("input").should("have.length", 3);
  });

  it("should render markdown after gap", () => {
    const options = {
      text: "This is a:\n [] **test**",
      correctGapValues: [["new"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.contains("strong", "test");
    cy.get("input").should("exist");
  });
});

//Setup Router to access context and useParams
const RenderQuestionWithRouter = ({ moduleID, questionID }: Required<IParams>) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=practice&order=chronological`]}>
      <main style={{ marginTop: 0 }}>
        <QuestionIdsProvider>
          <Route path='/module/:moduleID/question/:questionID' component={Question} />
        </QuestionIdsProvider>
      </main>
    </MemoryRouter>
  );
};

describe("Gap Text component inside Question component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
  });

  it("should render GapText component with one input", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    // Assert that one input elements renders and the input can be typed into
    cy.get("input#input-0").should("have.length", 1);
    cy.get("input#input-0").type("first").should("have.value", "first");
  });

  it("should not submit the question on enter key press", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    cy.get("input#input-0").type("{enter}");
    cy.get("section.question-correction").should("not.exist");
  });

  it("should reset the input values if clicking on the reset button", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    cy.get("input#input-0").type("reset this", { delay: 2 });
    cy.get("button[aria-label='Reset Question']").click();
    cy.get("input#input-0").should("not.have.value", "reset this").and("have.value", "");
  });

  it("should reset the values if clicking on retry button and check answer with new values", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    cy.get("input#input-0").type("retry this", { delay: 2 });
    cy.get("button[type='submit']").click(); //submit question
    cy.get("button[aria-label='Retry Question']").click(); //click retry
    cy.get("input#input-0").should("not.have.value", "retry this").and("have.value", "");

    //Check to type again
    cy.get("input#input-0").type("first").should("have.value", "first");
    cy.get("button[type='submit']").click();

    cy.contains("Yes, that's correct!");
  });

  it("should reset the border color on retry click to gray", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    //Submit Question and click retry button
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    cy.get("input#input-0").should("have.css", "border", "1px solid rgb(180, 180, 180)");
  });

  it("should disable all input elements on question submit", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    // Submit Question
    cy.get("button[type='submit']").click();

    // Assert that all input elements are disabled
    cy.get("section.question-user-response")
      .get("input")
      .each(($el) => {
        expect($el).to.have.prop("disabled", true);
      });
  });

  it("should enable all input elements on retry question click", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-3' />);

    // Submit Question and click retry
    cy.get("button[type='submit']").click();
    cy.get("button[aria-label='Retry Question']").click();

    // Assert that all input elements are disabled
    cy.get("section.question-user-response")
      .get("input")
      .each(($el) => {
        expect($el).to.have.prop("disabled", false);
      });
  });

  it("should enable all inputs after submit and navigating to next question", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    // Submit form and navigate to next question
    cy.get("button[type='submit']").click().click();

    // Assert each element to be enabled (not disabled)
    cy.get("section.question-user-response")
      .get("input")
      .each(($el) => {
        expect($el).to.have.prop("disabled", false);
      });

    // Assert that element is still interactive
    cy.get("input#input-0").type("second").should("have.value", "second");
  });

  it("should clear the values if navigating to the next question and use the new values for correction", () => {
    cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

    // Type into the input
    cy.get("input#input-0").type("first", { delay: 2 });

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Navigate to new site
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the input has empty value after navigation
    cy.get("input#input-0").should("have.value", "");

    // Check correct answer
    cy.get("input#input-0").type("second", { delay: 2 }).should("have.value", "second");

    // Submit question
    cy.get("button[type='submit']").click();

    // Check correction
    cy.contains("Yes, that's correct!").should("exist");
  });

  context("Question correction on submit", () => {
    it("should show that the answer is correct if the answer is correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-3' />);

      // Type correct input
      cy.get("input#input-0").type("third");
      cy.get("input#input-1").type("contains");
      cy.get("input#input-2").type("one");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!");
    });

    it("should show that the answer is correct if the answer is correct but entered in a non chronological order", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-3' />);

      // Type correct input
      cy.get("input#input-2").type("one");
      cy.get("input#input-0").type("third");
      cy.get("input#input-1").type("contains");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!");
    });

    it("should show the answer as correct if the input has multiple correct values", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-4' />);

      // Type correct values using "1"
      cy.get("input#input-0").type("1");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!");

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Type correct values using "one"
      cy.get("input#input-0").type("one");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!");
    });

    it("should show question correction after submit even if answer was correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type correct input
      cy.get("input#input-0").type("first");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer correction works
      cy.get(".question-correction").contains("This is the").should("exist");
      cy.get(".question-correction").find(".correct-gap-value").should("have.text", "first");
    });

    it("should separate the items in the question correction with semicolons", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-4' />);

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the values are separated by semicolons
      cy.get(".correct-gap-value").should("have.text", "1; one; One");
    });

    it("should show that the given answer is incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type incorrect value
      cy.get("input#input-0").type("false");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("No, that's false!").should("exist");
    });

    it("should show question correction after submit if answer was incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type correct input
      cy.get("input#input-0").type("last");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the answer correction works
      cy.get(".question-correction").contains("This is the").should("exist");
      cy.get(".question-correction").find(".correct-gap-value").should("have.text", "first");
    });

    it("should work after moving from a question with one input to multiple inputs", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-2' />);

      cy.get("input#input-0").type("second");

      cy.get("button[type='submit']").click().click();

      cy.get("input#input-0").type("third").should("have.value", "third");
      cy.get("input#input-1").type("contains", { delay: 2 }).should("have.value", "contains");
      cy.get("input#input-2").type("1").should("have.value", "1");

      cy.get("button[type='submit']").click();
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should clear the question correction on submit and navigating with Question Navigation (button[aria-label='Navigate to next Question']) instead of submitting the question again", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type into the input
      cy.get("input#input-0").type("first", { delay: 2 });

      // Submit the question
      cy.get("button[aria-label='Check Question']").click();

      // Click show navigation button that just exists on small displays
      cy.get("body").then((body) => {
        if (body.find("button[aria-label='Show Navigation']").length > 0) {
          cy.get("button[aria-label='Show Navigation']").click();
        }
      });

      // Navigate to new site
      cy.get("button[aria-label='Navigate to next Question']").click();

      // Assert that the input has empty value after navigation and is enabled
      cy.get("input#input-0").should("have.value", "").and("not.be.disabled");

      // Assert that the question correction went away
      cy.get("section.question-correction").should("not.exist");

      // Type correct answer
      cy.get("input#input-0").type("second", { delay: 2 }).should("have.value", "second");

      // Submit question
      cy.get("button[type='submit']").click();

      // Check correction
      cy.contains("Yes, that's correct!").should("exist");
    });

    //BORDERS
    it("should render green border on input element if the answer if correct", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type correct input
      cy.get("input#input-0").type("first");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green
      cy.get("input#input-0").should("have.css", "border", "1px solid rgb(0, 128, 0)");
    });

    it("should show red border on input element if the answer of the user is incorrect or the user didn't input anything", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-3' />);

      // Type incorrect answer
      cy.get("input#input-0").type("last");

      // submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green on the elements
      cy.get("input#input-0").should("have.css", "border", "1px solid rgb(255, 0, 0)");
      cy.get("input#input-1").should("have.css", "border", "1px solid rgb(255, 0, 0)");
    });

    it("should render a red border if the user doesn't input anything and show answer as incorrect", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green on the elements
      cy.get("input#input-0").should("have.css", "border", "1px solid rgb(255, 0, 0)");

      // Assert that the given answer is incorrect
      cy.contains("No, that's false!").should("exist");
    });

    it("should add a green border to the correctly answered gap and a red border to those answered incorrectly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-3' />);

      // Type correct value
      cy.get("input#input-1").type("multiple");

      // Type incorrect value
      cy.get("input#input-2").type("false");

      // submit Question
      cy.get("button[type='submit']").click();

      // Assert that the the border changes to green or red on the input elements
      cy.get("input#input-0").should("have.css", "border", "1px solid rgb(255, 0, 0)");
      cy.get("input#input-1").should("have.css", "border", "1px solid rgb(255, 0, 0)");
      cy.get("input#input-2").should("have.css", "border", "1px solid rgb(255, 0, 0)");

      // Assert that the given answer is incorrect
      cy.contains("No, that's false!").should("exist");
    });

    it("should show the answer as correct if the first answer was incorrect but the user clicked retry and answered correctly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type incorrect input
      cy.get("input#input-0").type("false");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Type correct input
      cy.get("input#input-0").type("first");

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer is correct
      cy.contains("Yes, that's correct!").should("exist");
    });

    it("should show the answer as incorrect if the first answer was correct but the user clicked retry and answered incorrectly", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-1' />);

      // Type correct input
      cy.get("input#input-0").type("first");

      // Submit Question
      cy.get("button[type='submit']").click();

      // Retry question
      cy.get("button[aria-label='Retry Question']").click();

      // Type incorrect input
      cy.get("input#input-0").type("incorrect");

      // Submit question
      cy.get("button[type='submit']").click();

      // Assert that the answer is incorrect
      cy.contains("No, that's false!").should("exist");
    });
  });

  context("Markdown and HTML elements", () => {
    it("should render list", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-5' />);

      // Assert that the list has two items
      cy.get(".question-user-response ul").find("li").should("have.length", 2);

      // Assert that there is a p element after the list
      cy.contains("p", "This should not be a list item").should("exist");
    });

    it("should render list after content without any white space", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-6' />);

      cy.get(".question-user-response ul").find("li").should("have.length", 2);
      cy.get(".question-gap-text").invoke("height").should("be.lessThan", 150);
    });

    it("should render markdown table", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-7' />);

      //Testing that white-space isn't pushing the table out of view
      cy.get("table").should("exist").and("be.visible");
      cy.get(".question-gap-text").invoke("height").should("be.lessThan", 180);
      cy.get("input#input-0").type("work").should("have.value", "work");

      cy.contains("Text below table").should("be.visible");
      cy.contains("strong", "table").should("exist");

      // Submit Question
      cy.get("button[type='submit']").click();

      cy.contains("Yes, that's correct!").should("exist");
      cy.get(".question-correction").invoke("height").should("be.greaterThan", 47);
    });

    it("should render html table", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-8' />);

      // Assert that the table is in view and the values get rendered
      cy.get("table").should("exist").and("be.visible");
      cy.get(".question-gap-text").invoke("height").should("be.lessThan", 180);
      cy.get("td .input-wrapper").find("input").type("work").should("have.value", "work");
      cy.contains("em", "italic");

      // Submit Question
      cy.get("button[type='submit']").click();

      cy.contains("Yes, that's correct!").should("exist");
      cy.get(".question-correction").invoke("height").should("be.greaterThan", 47);
    });

    it("should allow multiple blank spaces in front of the actual test", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-9' />);

      cy.contains("Should not break with a lot of white-spaces.").should("exist");
    });

    it("should render markdown list if the first item is a gap", () => {
      cy.mount(<RenderQuestionWithRouter moduleID='gap_text' questionID='gt-10' />);

      // Assert that the list renders and there is a gap in the beginning
      cy.contains("li", "List").should("exist");
      cy.get("input#input-0").should("exist");
    });
  });
});
