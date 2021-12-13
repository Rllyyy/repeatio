import { screen, render, fireEvent, cleanup } from "@testing-library/react";
import user from "@testing-library/user-event";
import Question from "./Question.js";
import { QuestionContext } from "../../../Context/QuestionContext";
import { Router, Route, Switch, MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from "history";

//Test Data
const data = [
  {
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
  },
  {
    modulename: "ABC12",
    questionID: "qID-2",
    questionTitle: "This is the second Question",
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
  },
];

/* Mocks */
//Mock the question component with router to allow switching pages and the provider
const MockQuestionWithRouter = ({ id }) => {
  return (
    <MemoryRouter initialEntries={[`/module/test/${id}`]}>
      <Switch>
        <QuestionContext.Provider value={data}>
          <Route exact path='/module/:moduleName/:questionID' component={Question} />
        </QuestionContext.Provider>
      </Switch>
    </MemoryRouter>
  );
};

//Override the default useSize hook
jest.mock("../../../hooks/useSize.js", () => ({
  useSize: () => ({ x: 10, y: 15, width: 517, height: 44, top: 15, right: 527, bottom: 59, left: 10 }),
}));

/* TESTING */
describe("<Question />", () => {
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  /* UNIT TESTING */
  it("should render form with questionID, questionTitle, questionPoints and questionTypeHelp", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

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

  it("should render the question with the id of qID-2 when given the correct params", () => {
    render(<MockQuestionWithRouter id='qID-2' />);

    const idElement = screen.getByText("ID: qID-2");
    expect(idElement).toBeInTheDocument();
  });

  /* INTEGRATION TESTING */
  //Expect submit button to  and lock answers
  it("should disable form after submit", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

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
  });

  //Expect the correction box (red or green) to show up after question submit
  it("should show question correction after submit", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    const questionCorrectionElement = screen.queryByTestId("question-correction");

    //Initially it should not be shown
    expect(questionCorrectionElement).not.toBeInTheDocument();

    //Show after submit
    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const questionCorrectionAfterSubmitElement = screen.getByTestId("question-correction");
    expect(questionCorrectionAfterSubmitElement).toBeInTheDocument();
  });

  //Expect the question correction to be red
  it("should show question correction as false (red)", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const correctionTitleElement = screen.getByText("No, that's false! The correct answer is:");
    expect(correctionTitleElement).toBeInTheDocument();

    const questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toHaveClass("answer-false");
  });

  //Expect the question correction to be green
  it("should show the question correction as correct (green)", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    const correctElement = screen.getByText("Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.");
    user.click(correctElement);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const correctionTitleElement = screen.getByText("Yes, that's correct!");
    expect(correctionTitleElement).toBeInTheDocument();

    const questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toHaveClass("answer-correct");
  });

  //Expect the retry button to work and interact with the form afterwards
  it("should reset the form when clicking the retry button", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

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

  //Expect the url to change to new params when checking a question
  //This test only check if the url updates
  //The UI doesn't actually update because the params don't change
  it("should update the url (useHistory hook) when clicking the next button", () => {
    //mocks
    window.HTMLElement.prototype.scrollIntoView = jest.fn(); //to make scroll into view work

    const history = createMemoryHistory();
    history.push("/module/title/qID-1");

    render(
      <Router history={history}>
        <Switch>
          <QuestionContext.Provider value={data}>
            <Route exact path='/module/:moduleName/:questionID' component={Question} />
          </QuestionContext.Provider>
        </Switch>
      </Router>
    );

    //click the check button twice
    const buttonElement = screen.getByTestId("question-check");
    user.click(buttonElement);
    user.click(buttonElement);

    expect(history.location.pathname).toBe("/module/title/qID-2");
  });

  //Expect the next question to render if the first answer is answered and next button is clicked
  it("should go to the next question when clicking the next button ", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    window.HTMLElement.prototype.scrollIntoView = jest.fn(); //to make scroll into view work

    const buttonElement = screen.getByTestId("question-check");
    user.click(buttonElement);
    user.click(buttonElement);

    const idElement = screen.getByText("ID: qID-2");
    expect(idElement).toBeInTheDocument();
  });

  //Expect the first element of the data array to render after last element is reached
  it("should render the first question after clicking next on the last question (go to first position of array)", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    let idElement = screen.getByText("ID: qID-1");
    expect(idElement).toBeInTheDocument();

    //Click the button 4 times to restart array (start at qID-1 --> qID-2 --> qID1)
    const buttonElement = screen.getByTestId("question-check");
    user.click(buttonElement);
    user.click(buttonElement);

    idElement = screen.getByText("ID: qID-2");
    expect(idElement).toBeInTheDocument();

    user.click(buttonElement);
    user.click(buttonElement);

    //check if the first question with the id of qID-1 has rendered
    idElement = screen.getByText("ID: qID-1");
    expect(idElement).toBeInTheDocument();
  });

  //Expect checkbox to change on label/checkbox click (multiple-response unit test)
  //Unit test in multiple choice that only one is checked / multiple Choice if clicking on one resets it
  //Expect reveal button to work
  //Expect Navigation (start, prev, input, next, last)
  //Test Scroll (custom hook has been called one time)
});
