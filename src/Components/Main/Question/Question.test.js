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
  useSize: () => ({ x: 10, y: 15, width: 917, height: 44, top: 15, right: 527, bottom: 59, left: 10 }),
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

  //Expect question reveal no to be visible
  it("should not render question correction element when clicking on next question button", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    //Click the question check button twice to trigger a false answer and the question correction to be visible
    const buttonElement = screen.getByTestId("question-check");
    user.click(buttonElement);

    let questionRevealElement;
    questionRevealElement = screen.getByTestId("question-correction");
    expect(questionRevealElement).toBeInTheDocument();

    user.click(buttonElement);

    //Reveal element should not be in the document
    questionRevealElement = screen.queryByTestId("question-correction");
    expect(questionRevealElement).not.toBeInTheDocument();
  });

  //Expect highlight selection to go away when going to next question
  it("should deselect selection when going to next question but a answer was selected (clicked)", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    //select an element
    const selectedElement = screen.getByText("Lorem ipsum dolor sit amet consectetur adipisicing.");
    user.click(selectedElement);

    //click next question arrow in the navigation
    const nextQuestionButton = screen.getByTestId("next-question-button");
    user.click(nextQuestionButton);

    //Get all elements with the regex match
    const answerElements = screen.getAllByTestId(/formControlLabel-checkbox-./);

    //Every element should be unchecked and the following array.every should return true
    //It would return false if one ore more elements is checked
    const allUnchecked = answerElements.every((element) => element.firstChild.checked === false);

    expect(allUnchecked).toBeTruthy();
  });

  //Expect highlight selection to go away when going to next question
  it("should deselect selection when going to next question after submitting answer and clicking next", () => {
    render(<MockQuestionWithRouter id='qID-1' />);

    //select an element
    const selectedElement = screen.getByText("Lorem ipsum dolor sit amet consectetur adipisicing.");
    user.click(selectedElement);

    //Click the question check button twice to check the question and go to next question
    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);
    user.click(checkButtonElement);

    //Get all elements with the regex match
    const answerElements = screen.getAllByTestId(/formControlLabel-checkbox-./);

    //Every element should be unchecked and the following array.every should return true
    //It would return false if one ore more elements is checked
    const allUnchecked = answerElements.every((element) => element.firstChild.checked === false);

    expect(allUnchecked).toBeTruthy();
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

  //Expect the url to change to previous element in array
  it("should go to previous url when clicking the previous question button", () => {
    //to make scroll into view work
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const history = createMemoryHistory();
    history.push("/module/title/qID-2");

    render(
      <Router history={history}>
        <Switch>
          <QuestionContext.Provider value={data}>
            <Route exact path='/module/:moduleName/:questionID' component={Question} />
          </QuestionContext.Provider>
        </Switch>
      </Router>
    );

    //click the previous check button twice
    const buttonElement = screen.getByTestId("previous-question-button");
    user.click(buttonElement);

    expect(history.location.pathname).toBe("/module/title/qID-1");
  });

  //Expect the array to restart at the last element when clicking the previous question button when on the first element on the array (only test the url not UI)
  it("should restart the array when clicking previous question on the first element in the array", () => {
    //to make scroll into view work
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

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

    //click the previous question button
    const buttonElement = screen.getByTestId("previous-question-button");
    user.click(buttonElement);

    expect(history.location.pathname).toBe("/module/title/qID-2");
  });

  //Expect the url to change to first element in array when clicking the to first Question Button
  it("should go to the first url in array when clicking the to first Question Button", () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const history = createMemoryHistory();
    history.push("/module/title/qID-2");

    render(
      <Router history={history}>
        <Switch>
          <QuestionContext.Provider value={data}>
            <Route exact path='/module/:moduleName/:questionID' component={Question} />
          </QuestionContext.Provider>
        </Switch>
      </Router>
    );

    //Click the to first Question Button
    const toFirstQuestionButton = screen.getByTestId("first-question-button");
    user.click(toFirstQuestionButton);

    expect(history.location.pathname).toBe("/module/title/qID-1");
  });

  //Expect the url to change to the last element in array when clicking the to last Question Button
  it("should go to the last url in array when clicking the to last Question Button", () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

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

    //Click the to last Question Button
    const toLastQuestionButton = screen.getByTestId("last-question-button");
    user.click(toLastQuestionButton);

    expect(history.location.pathname).toBe("/module/title/qID-2");
  });

  //Expect Navigation (input)

  //Unit test in multiple choice that only one is checked / multiple Choice if clicking on one resets it
  //Expect reveal button to work
  //Expect the (navigation) arrow to be not visible
  //Test Scroll (custom hook has been called one time)
});
