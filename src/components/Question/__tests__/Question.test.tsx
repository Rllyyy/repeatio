import { screen, render, cleanup } from "@testing-library/react";
import user from "@testing-library/user-event";
import { Question } from "../Question";
import { IQuestionIdsContext, QuestionIdsContext } from "../../module/questionIdsContext";
import { Route, MemoryRouter, Routes } from "react-router-dom";
import { IQuestion } from "../useQuestion";
import { IModule } from "../../module/module";
import { ISearchParams } from "../../../utils/types";

//Question test data
const mockFilteredQuestions: IModule["questions"] = [
  {
    id: "qID-1",
    title: "This is a question for the test suite",
    points: 5,
    type: "multiple-choice",
    help: "Choose the correct answer(s) please.",
    answerOptions: [
      {
        id: "option-1",
        text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
        isCorrect: true,
      },
      { id: "option-2", text: "Lorem ipsum dolor sit amet consectetur adipisicing.", isCorrect: false },
      {
        id: "option-3",
        text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita nemo unde blanditiis dolorem necessitatibus consequatur omnis, reiciendis doloremque recusandae? Soluta ex sit illum doloremque cum non sunt nesciunt, accusantium dolorem.",
        isCorrect: false,
      },
    ],
  },
  {
    id: "qID-2",
    title: "This is the second question for the test suite",
    points: 5,
    type: "multiple-response",
    help: "Choose the correct answer(s).",
    answerOptions: [
      {
        id: "option-1",
        text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.",
        isCorrect: true,
      },
      { id: "option-2", text: "Lorem ipsum dolor sit amet consectetur adipisicing.", isCorrect: false },
      {
        id: "option-3",
        text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita nemo unde blanditiis dolorem necessitatibus consequatur omnis, reiciendis doloremque recusandae? Soluta ex sit illum doloremque cum non sunt nesciunt, accusantium dolorem.",
        isCorrect: false,
      },
    ],
  },
  {
    id: "qID-3",
    title: "This is a question provided by the public folder",
    points: 5,
    type: "gap-text",
    help: "Fill in the blanks.",
    answerOptions: {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One", "one"], ["two"], ["three"]],
    },
  },
];

//Module test data
const data: IModule = {
  id: "Test-1",
  name: "TestModule",
  type: "module",
  lang: "lat",
  compatibility: "0.5.0",
  questions: mockFilteredQuestions,
};

const mockSetQuestionIds = jest.fn();

/* Mocks */
//Mock the question component with router to allow switching pages and the provider
interface IMockQuestionWithRouter {
  qID: IQuestion["id"];
  mode: NonNullable<ISearchParams["mode"]>;
  order: NonNullable<ISearchParams["order"]>;
}

const MockQuestionWithRouter: React.FC<IMockQuestionWithRouter> = ({ qID, mode, order }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${data.id}/question/${qID}?mode=${mode}&order=${order}`]}>
      <Routes>
        <Route
          path='/module/:moduleID/question/:questionID'
          element={
            <QuestionIdsContext.Provider
              value={
                {
                  questionIds: data.questions.map((question) => question.id),
                  setQuestionIds: mockSetQuestionIds,
                } as IQuestionIdsContext
              }
            >
              <Question />
            </QuestionIdsContext.Provider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

//React-markdown uses ES6 but jest uses ES5
//There are more options but this is the easiest one
//https://github.com/remarkjs/react-markdown/issues/635#issuecomment-956158474
//Returning the elements in a paragraph isn't actually that bad because react-markdown does the same
interface IProps {
  children: React.ReactNode;
}

jest.mock("react-markdown", () => (props: IProps) => {
  return <p className='react-markdown-mock'>{props.children}</p>;
});

jest.mock("rehype-raw", () => (props: IProps) => {
  return <p className='rehype-raw-mock'>{props.children}</p>;
});

jest.mock("remark-gfm", () => (props: IProps) => {
  return <p className='remark-gfm-mock'>{props.children}</p>;
});

jest.mock("remark-math", () => (props: IProps) => {
  return <p className='remark-math-mock'>{props.children}</p>;
});

jest.mock("rehype-katex", () => (props: IProps) => {
  return <p className='rehype-katex-mock'>{props.children}</p>;
});

//Override the default useSize hook
jest.mock("../../../hooks/useSize.ts", () => ({
  useSize: () => ({ x: 10, y: 15, width: 917, height: 44, top: 15, right: 527, bottom: 59, left: 10 }),
}));

/* Mock localStorage, taken from https://robertmarshall.dev/blog/how-to-mock-local-storage-in-jest-tests/ */
interface LocalStorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
  removeItem: (key: string) => void;
  getAll: () => Record<string, string>;
}

const localStorageMock: LocalStorageMock = (function () {
  let store: Record<string, string> = {};

  return {
    getItem(key) {
      return store[key];
    },

    setItem(key, value) {
      store[key] = value;
    },

    clear() {
      store = {};
    },

    removeItem(key) {
      delete store[key];
    },

    getAll() {
      return store;
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

/* TESTING */
describe("<Question />", () => {
  beforeEach(() => {
    window.localStorage.clear();

    //mock scroll functions
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollTo = jest.fn();

    // Setup localStorage
    window.localStorage.setItem("repeatio-module-Test-1", JSON.stringify(data));
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  /* UNIT TESTING */
  it("should render form with questionID, questionTitle, questionPoints and questionTypeHelp", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //Expect questionID
    const questionIDElement = screen.getByTestId("question-id");
    expect(questionIDElement.textContent?.length).toBeGreaterThan(0);
    expect(questionIDElement).toHaveTextContent(/ID: /i);

    //Expect questionTitle
    const questionTitleElement = screen.getByText("This is a question for the test suite");
    expect(questionTitleElement).toBeInTheDocument();

    //Expect questionPoints (requires exact Points from mock question)
    const questionPointsElement = screen.getByText(/5 Points/i);
    expect(questionPointsElement).toBeInTheDocument();

    //Expect questionTypeHelp (requires phrase from mock question)
    const questionTypeHelpElement = screen.getByText("Choose the correct answer(s) please.");
    expect(questionTypeHelpElement).toBeInTheDocument();
  });

  it("should render the question with the id of qID-2 when given the correct params", () => {
    render(<MockQuestionWithRouter qID='qID-2' mode='practice' order='chronological' />);

    const idElement = screen.getByText("ID: qID-2");
    expect(idElement).toBeInTheDocument();
  });

  /* INTEGRATION TESTING */
  //Expect submit button to submit and lock answers
  it("should disable form after submit", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    let checkOptionElement = screen.getByTestId("question-check");
    user.click(checkOptionElement);

    expect(screen.getByTestId("formControlLabel-radio-option-1")).toHaveAttribute("aria-disabled");
  });

  //Expect the correction box (red or green) to show up after question submit
  it("should show question correction after submit", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

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
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const correctionTitleElement = screen.getByText("No, that's false! The correct answer is:");
    expect(correctionTitleElement).toBeInTheDocument();

    const questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toHaveClass("answer-false");
  });

  //Expect the question correction to be green
  it("should show the question correction as correct (green)", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    const correctElement = screen.getByText(
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam."
    );
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
    //render element
    render(<MockQuestionWithRouter qID='qID-2' mode='practice' order='chronological' />);

    const checkButtonElement = screen.getByTestId("question-check");
    user.click(checkButtonElement);

    const retryButton = screen.getByTestId("question-retry");
    user.click(retryButton);

    //Correction element should disappear after retry button is clicked
    const questionCorrectionElement = screen.queryByTestId("question-correction");
    expect(questionCorrectionElement).not.toBeInTheDocument();

    //Checked that the form can be interacted with
    const correctElementMarkdown = screen.getByText(
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam."
    );

    //Should remove the attribute Mui-disabled when retrying question
    expect(screen.getByTestId("formControlLabel-option-1")).not.toHaveClass("Mui-disabled");

    //Interact with the question
    user.click(correctElementMarkdown);

    //Get all checkbox elements and check if they are checked
    const checkBoxElements = screen.getAllByTestId(/formControlLabel-checkbox-./);
    const checkedArray = checkBoxElements.map((item) => {
      return (item.firstChild as HTMLInputElement).checked || false;
    });
    expect(checkedArray).toContain(true);
  });

  //Expect the next question to render if the first answer is answered and next button is clicked
  it("should go to the next question when clicking the next button and practice mode is chronological", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //Check Question
    const checkQuestionButton = screen.getByTestId("question-check");
    user.click(checkQuestionButton);

    //Navigate to next question
    const nextQuestionButton = screen.getByTestId("question-next");
    user.click(nextQuestionButton);

    const idElement = screen.getByText("ID: qID-2");
    expect(idElement).toBeInTheDocument();
  });

  it("should go to a new random question when clicking the next button and practice mode is random", () => {
    //render element
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //Check Question
    const checkQuestionButton = screen.getByTestId("question-check");
    user.click(checkQuestionButton);

    //Navigate to next question
    const nextQuestionButton = screen.getByTestId("question-next");
    user.click(nextQuestionButton);

    //Expect ID: qID-1 not to be in the document (instead it should be something random from the data test array)
    const idElement = screen.queryByText("ID: qID-1");
    expect(idElement).not.toBeInTheDocument();
  });

  //Expect the first element of the data array to render after last element is reached
  it("should render the first question after clicking next on the last question (go to first position of array)", () => {
    const idOfLastElementInTestArray = data.questions[data.questions.length - 1].id;
    render(<MockQuestionWithRouter qID={idOfLastElementInTestArray} mode='practice' order='chronological' />);

    let idElement = screen.getByText(`ID: ${idOfLastElementInTestArray}`);
    expect(idElement).toBeInTheDocument();

    //Check Question
    const checkQuestionButton = screen.getByTestId("question-check");
    user.click(checkQuestionButton);

    //Navigate to next question to restart the array
    const nextQuestionButton = screen.getByTestId("question-next");
    user.click(nextQuestionButton);

    //check if the first question with the id of qID-1 has rendered
    const idOfFirstElementInTestArray = data.questions[0].id;
    idElement = screen.getByText(`ID: ${idOfFirstElementInTestArray}`);
    expect(idElement).toBeInTheDocument();
  });

  //Expect the last element of the data array to render after previous button is clicked on first element
  it("should render the last question after clicking previous on the first question (go to last position in array)", () => {
    const idOfFirstElementInTestArray = data.questions[0].id;
    render(<MockQuestionWithRouter qID={idOfFirstElementInTestArray} mode='practice' order='chronological' />);

    let idElement = screen.getByText(`ID: ${idOfFirstElementInTestArray}`);
    expect(idElement).toBeInTheDocument();

    const prevButton = screen.getByTestId("previous-question-button");
    user.click(prevButton);

    const idOfLastElementInTestArray = data.questions[data.questions.length - 1].id;
    idElement = screen.getByText(`ID: ${idOfLastElementInTestArray}`);
    expect(idElement).toBeInTheDocument();
  });

  //Expect question reveal no to be visible
  it("should not render question correction element when clicking on next question button", () => {
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //Click check button to reveal question navigation
    const buttonElement = screen.getByTestId("question-check");
    user.click(buttonElement);

    let questionRevealElement;
    questionRevealElement = screen.getByTestId("question-correction");
    expect(questionRevealElement).toBeInTheDocument();

    //Navigate to next question
    user.click(screen.getByTestId("question-next"));

    //Reveal element should not be in the document
    questionRevealElement = screen.queryByTestId("question-correction");
    expect(questionRevealElement).not.toBeInTheDocument();
  });

  it("should not render question correction element when clicking on next button in question navigation", () => {
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //Click check button to reveal question navigation
    const checkQuestionButton = screen.getByTestId("question-check");
    user.click(checkQuestionButton);

    //Navigate to next question no by using the <CheckNextButton /> but instead with the navigation
    const nextQuestionButtonNavigation = screen.getByTestId("nav-next-question-button");
    user.click(nextQuestionButtonNavigation);

    const questionRevealElement = screen.queryByTestId("question-correction");
    expect(questionRevealElement).not.toBeInTheDocument();
  });

  //Expect highlight selection to go away when going to next question
  it("should deselect selection when going to next question but a answer was selected (clicked)", () => {
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //select an element
    const selectedElement = screen.getByText("Lorem ipsum dolor sit amet consectetur adipisicing.");
    user.click(selectedElement);

    //click next question arrow in the navigation
    const nextQuestionButton = screen.getByTestId("nav-next-question-button");
    user.click(nextQuestionButton);

    //Get all elements with the regex match
    const answerElements = screen.getAllByTestId(/formControlLabel-checkbox-./);

    //Every element should be unchecked and the following array.every should return true
    //It would return false if one ore more elements is checked
    const allUnchecked = answerElements.every((element) => (element.firstChild as HTMLInputElement).checked === false);

    expect(allUnchecked).toBeTruthy();
  });

  //Expect highlight selection to go away when going to next question
  it("should deselect selection when going to next question after submitting answer and clicking next", () => {
    render(<MockQuestionWithRouter qID='qID-1' mode='practice' order='chronological' />);

    //select an element
    const selectedElement = screen.getByText("Lorem ipsum dolor sit amet consectetur adipisicing.");
    user.click(selectedElement);

    //Check Question
    const checkQuestionButton = screen.getByTestId("question-check");
    user.click(checkQuestionButton);

    //Navigate to next question
    const nextQuestionButton = screen.getByTestId("question-next");
    user.click(nextQuestionButton);

    //Get all elements with the regex match
    const answerElements = screen.getAllByTestId(/formControlLabel-checkbox-./);

    //Every element should be unchecked and the following array.every should return true
    //It would return false if one ore more elements is checked
    const allUnchecked = answerElements.every((element) => (element.firstChild as HTMLInputElement).checked === false);

    expect(allUnchecked).toBeTruthy();
  });

  //Expect to render gap text question
  it("should render gap text question", () => {
    render(<MockQuestionWithRouter qID='qID-3' mode='practice' order='chronological' />);

    expect(screen.getByTestId("question-id")).toHaveTextContent("ID: qID-3");
    expect(screen.getByText("Fill in the blanks.")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  //Expect the gap inputs to clear when clicking the reset button (before form submit)
  it("should reset the inputs in gap text to empty when clicking the reset button", () => {
    render(<MockQuestionWithRouter qID='qID-3' mode='practice' order='chronological' />);

    //Type into the input elements
    let inputElements = screen.getAllByRole("textbox") as HTMLInputElement[];
    user.type(inputElements[0], "One"); //"One" and "one" could both be correct
    user.type(inputElements[1], "two");
    user.type(inputElements[2], "three");

    //Click reset button
    user.click(screen.getByTestId("question-retry"));

    expect(inputElements.every((input) => input.value === "")).toBeTruthy();
  });

  //Expect the gap inputs to clear when clicking the reset button (after form submit)
  it("should reset the inputs in gap text to empty when clicking the reset button after form submit", () => {
    render(<MockQuestionWithRouter qID='qID-3' mode='practice' order='chronological' />);

    //Type into the input elements
    let inputElements = screen.getAllByRole("textbox") as HTMLInputElement[];
    user.type(inputElements[0], "One"); //"One" and "one" could both be correct
    user.type(inputElements[1], "two");
    user.type(inputElements[2], "three");

    //Click check button
    user.click(screen.getByTestId("question-check"));

    //Click reset button
    user.click(screen.getByTestId("question-retry"));

    expect(inputElements.every((input) => input.value === "")).toBeTruthy();
  });

  //Expect gap text to accept different correct values
  it("should render question correct when providing two different values to gap text which both could be correct", () => {
    render(<MockQuestionWithRouter qID='qID-3' mode='practice' order='chronological' />);

    //Type into the input elements (Don't want to setup a data-testid, so we grap the element by the index)
    let inputElements = screen.getAllByRole("textbox");
    user.type(inputElements[0], "One"); //"One" and "one" could both be correct
    user.type(inputElements[1], "two");
    user.type(inputElements[2], "three");

    //Click button to see if inputs are correct
    user.click(screen.getByTestId("question-check"));

    //Expect to render isCorrect
    let questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toBeInTheDocument();

    //Reset form
    user.click(screen.getByTestId("question-retry"));

    //Provide values again but this time with "one" instead of "One"
    inputElements = screen.getAllByRole("textbox");
    user.type(inputElements[0], "one"); //"One" and "one" could both be correct
    user.type(inputElements[1], "two");
    user.type(inputElements[2], "three");

    //Click button to see if inputs are correct
    user.click(screen.getByTestId("question-check"));

    //Expect to render isCorrect
    questionCorrectionElement = screen.getByTestId("question-correction");
    expect(questionCorrectionElement).toBeInTheDocument();
  });

  it("should render QuestionNotFound Component if the provided ID isn't found", () => {
    render(<MockQuestionWithRouter qID='id-not-found' mode='practice' order='chronological' />);

    const questionNotFoundTitle = screen.getByText("Question not found!");
    expect(questionNotFoundTitle).toBeInTheDocument();
  });

  it("should disable buttons when Question isn't found", () => {
    render(<MockQuestionWithRouter qID='id-not-found' mode='practice' order='chronological' />);

    const questionNotFoundTitle = screen.getByText("Question not found!");
    expect(questionNotFoundTitle).toBeInTheDocument();
  });
});
