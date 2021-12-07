import { screen, render, fireEvent } from "@testing-library/react";
import user from "@testing-library/user-event";
import Question from "./Question.js";

/* Future question Test
const question = {
  modulename: "ABC12",
  questionID: "qID-1",
  questionTitle:
    "What is often too long for one line so has to wrap to the next line, but not enough on large monitors so one has to add useless information to a placeholder question?",
  questionPoints: 5,
  type: "multiple-response",
  questionTypeHelp: "Choose the correct answer(s).",
  answerOptions: [
    { id: "option-1", text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.", isCorrect: true },
    { id: "option-2", text: "Lorem ipsum dolor sit amet consectetur adipisicing.", isCorrect: false },
    {
      id: "option-3",
      text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita nemo unde blanditiis dolorem necessitatibus consequatur omnis, reiciendis doloremque recusandae? Soluta ex sit illum doloremque cum non sunt nesciunt, accusantium dolorem.",
      isCorrect: false,
    },
  ],
}; */

describe("<Question />", () => {
  /* UNIT TESTING */
  it("should render form with questionID, questionTitle, questionPoints and questionTypeHelp", () => {
    //TODO pass mock question (see above)
    render(<Question />);

    //Expect questionID
    const questionIDElement = screen.getByTestId("question-id");
    expect(questionIDElement.textContent.length).toBeGreaterThan(0);
    expect(questionIDElement).toHaveTextContent(/ID: /i);

    //Expect questionTitle
    const questionTitleElement = screen.getByRole("heading", { class: "question-title" });
    expect(questionTitleElement.textContent.length).toBeGreaterThan(0);

    //Expect questionPoints (requires exact Points from mock question)
    const questionPointsElement = screen.getByText(/5 Points/i);
    expect(questionPointsElement).toBeInTheDocument();

    //Expect questionTypeHelp (requires phrase from mock question)
    const questionTypeHelpElement = screen.getByText("Choose the correct answer(s).");
    expect(questionTypeHelpElement).toBeInTheDocument();
  });

  /* INTEGRATION TESTING */
  //Expect submit button to  and lock answers
  it("should disable form after submit", () => {
    render(<Question />);
    window.HTMLElement.prototype.scrollIntoView = jest.fn(); //to make scroll into view work

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    //Just check if one checkbox is disabled. There is no need to write test for all elements as the disabled prop is handled by the formControl not the element (but react.screen can't grab the formControl, which internally passes the prop as classnames to some children)
    const checkBoxElement = screen.getByText(
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita nemo unde blanditiis dolorem necessitatibus consequatur omnis, reiciendis doloremque recusandae? Soluta ex sit illum doloremque cum non sunt nesciunt, accusantium dolorem."
    );

    //Check if the p is disabled
    expect(checkBoxElement).toHaveClass("label-disabled");

    //Check if the parent (the label in the dom)
    expect(checkBoxElement.parentElement).toHaveClass("Mui-disabled");

    //Check if the checkbox
    expect(checkBoxElement.parentElement.firstChild).toHaveAttribute("aria-disabled");

    // expect(formControlElement).toBeInTheDocument();
  });

  it("should show question correction after submit", () => {
    render(<Question />);
    const questionCorrectionElement = screen.queryByTestId("question-correction");

    //Initially it should not be shown
    expect(questionCorrectionElement).not.toBeInTheDocument();

    //Show after submit
    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const questionCorrectionAfterSubmitElement = screen.getByTestId("question-correction");
    expect(questionCorrectionAfterSubmitElement).toBeInTheDocument();
  });

  it("should show question correction as false (red)", () => {
    render(<Question />);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const correctionTitleElement = screen.getByText("No, that's false! The correct answer is:");
    expect(correctionTitleElement).toBeInTheDocument();

    const questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toHaveClass("answer-false");
  });

  it("should show the question correction as correct (green)", () => {
    render(<Question />);

    const correctElement = screen.getByText("Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.");
    user.click(correctElement);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const correctionTitleElement = screen.getByText("Yes, that's correct!");
    expect(correctionTitleElement).toBeInTheDocument();

    const questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toHaveClass("answer-correct");
  });

  it("should reset the form when clicking the retry button", () => {
    render(<Question />);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const retryButton = screen.getByTestId("question-retry");
    user.click(retryButton);

    //Correction element should disappear after retry button is clicked
    const questionCorrectionElement = screen.queryByTestId("question-correction");
    expect(questionCorrectionElement).not.toBeInTheDocument();

    //Checked that the form can be interacted with
    const correctElement = screen.getByText("Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.");
    expect(correctElement).toHaveClass("label-enabled");
    user.click(correctElement);

    //Get all checkbox elements and check if they are checked
    const checkBoxElements = screen.getAllByTestId(/formControlLabel-checkbox-./);
    const checkedArray = checkBoxElements.map((item) => {
      return item.firstChild.checked;
    });
    expect(checkedArray).toContain(true);
  });

  //Expect checkbox to change on label/checkbox click (multiple-response unit test)
  //Unit test in multiple choice that only one is checked / multiple Choice if clicking on one resets it

  //Expect reveal button to work
  //Expect Navigation
  //Test Scroll (custom hook has been called one time)
});
