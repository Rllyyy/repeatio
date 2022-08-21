import { screen, render, cleanup } from "@testing-library/react";
import user from "@testing-library/user-event";
import { GapText } from "./GapText.js";

//provide options
const options = {
  text: "[] two three. One [] three. One two [].",
  correctGapValues: ["One", "two", "three"],
};
//mock options, setAnswerCorrect, setShowAnswer, formDisabled and ref
const mockSetAnswerCorrect = jest.fn();
const mockSetShowAnswer = jest.fn();
const mockUseRef = jest.fn();

const MockGapText = () => {
  return <GapText options={options} formDisabled={false} ref={mockUseRef} />;
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

describe("<GapText />)", () => {
  afterAll(cleanup);

  //Expect 3 inputs
  it("should render 3 inputs", () => {
    render(<MockGapText />);
    const inputElements = screen.getAllByRole("textbox");
    expect(inputElements.length).toBe(3);
  });

  //Expect Inputs to update
  it("should update the inputs on type input", () => {
    render(<MockGapText />);

    //const inputElements = screen.getByTestId("input-2");
    const inputElements = screen.getAllByRole("textbox");

    //Type into the input elements (Don't want to setup a data-testid, so we grap the element by the index)
    user.type(inputElements[0], "One");
    user.type(inputElements[1], "two");
    user.type(inputElements[2], "three");

    expect(inputElements[0]).toHaveValue("One");
    expect(inputElements[1]).toHaveValue("two");
    expect(inputElements[2]).toHaveValue("three");
  });

  //Expect all the inputs to be disabled when the form is disabled and change input class to "input-disabled"
  it("should disable the inputs when form is disabled", () => {
    render(
      <GapText
        options={options}
        setAnswerCorrect={mockSetAnswerCorrect}
        setShowAnswer={mockSetShowAnswer}
        formDisabled={true}
        ref={mockUseRef}
      />
    );

    const inputElements = screen.getAllByRole("textbox");

    //Check disabled attribute only every input element
    const everyInputDisabled = inputElements.every((input) => input.disabled);
    expect(everyInputDisabled).toBe(true);

    //Check class (this test only covers the first input)
    expect(inputElements[0]).toBeDisabled();
  });

  //Expect all the inputs to be enabled when the form is enabled and change input class to "input-enabled"
  it("should enable all input when form is enabled", () => {
    render(<MockGapText />);
    const inputElements = screen.getAllByRole("textbox");

    //Check disabled attribute only every input element
    const everyInputDisabled = inputElements.every((input) => input.disabled);
    expect(everyInputDisabled).toBe(false);

    //Check class (this test only covers the first input)
    expect(inputElements[0]).toBeEnabled();
  });
});
