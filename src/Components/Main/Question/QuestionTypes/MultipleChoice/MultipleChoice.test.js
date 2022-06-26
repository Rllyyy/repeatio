import { screen, render, cleanup } from "@testing-library/react";
import user from "@testing-library/user-event";
import MultipleChoice from "./MultipleChoice.js";

const mockOptions = [
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
    text: "this is another false multiple choice value",
    isCorrect: true,
  },
];

//mock options, setAnswerCorrect, setShowAnswer, formDisabled and ref
const mockSetAnswerCorrect = jest.fn();
const mockSetShowAnswer = jest.fn();
const mockUseRef = jest.fn();

const MockMultipleChoice = () => {
  return (
    <MultipleChoice
      options={mockOptions}
      setAnswerCorrect={mockSetAnswerCorrect}
      setShowAnswer={mockSetShowAnswer}
      formDisabled={false}
      ref={mockUseRef}
    />
  );
};

//React-markdown uses ES6 but jest uses ES5
//returning the elements in a paragraph isn't actually that bad because react-markdown does the same
jest.mock("react-markdown", () => (props) => {
  return <p className='react-markdown-mock'>{props.children}</p>;
});

jest.mock("rehype-raw", () => (props) => {
  return <p className='rehype-raw-mock'>{props.children}</p>;
});

jest.mock("remark-gfm", () => (props) => {
  return <p className='remark-gfm-mock'>{props.children}</p>;
});

jest.mock("remark-math", () => (props) => {
  return <p className='remark-math-mock'>{props.children}</p>;
});

jest.mock("rehype-katex", () => (props) => {
  return <p className='rehype-katex-mock'>{props.children}</p>;
});

describe("<MultipleChoice />", () => {
  afterAll(cleanup);

  it("should render multiple choice component", () => {
    render(<MockMultipleChoice />);

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toBeInTheDocument();

    const multipleChoiceRootElements = screen.getAllByTestId(/option-/i);
    expect(multipleChoiceRootElements).toHaveLength(3);
  });

  it("should select on click", () => {
    render(<MockMultipleChoice />);

    const firstOption = screen.getByTestId("option-0");
    user.click(firstOption);

    //First child is the circle
    expect(firstOption.firstChild).toHaveClass("Mui-checked");
  });

  it("should update the selected value on click", () => {
    render(<MockMultipleChoice />);

    const firstOption = screen.getByTestId("option-0");
    user.click(firstOption);

    const secondOption = screen.getByTestId("option-1");
    user.click(secondOption);

    expect(secondOption.firstChild).toHaveClass("Mui-checked");
  });

  it("should be disabled if form is disabled", () => {
    render(
      <MultipleChoice
        options={mockOptions}
        setAnswerCorrect={mockSetAnswerCorrect}
        setShowAnswer={mockSetShowAnswer}
        formDisabled={true}
        ref={mockUseRef}
      />
    );
    const disabledSpan = screen.getByTestId("option-0").firstChild;

    expect(disabledSpan).toHaveAttribute("aria-disabled");
  });
});
