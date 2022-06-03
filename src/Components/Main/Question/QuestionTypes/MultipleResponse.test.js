import { screen, render, cleanup } from "@testing-library/react";
import MultipleResponse from "./MultipleResponse.js";
import user from "@testing-library/user-event";

//Mocks
const options = [
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
];

const mockSetAnswerCorrect = jest.fn();
const mockSetShowAnswer = jest.fn();
const mockUseRef = jest.fn(); //Might not be allowed for a ref but for now the ref isn't being tested

//React-markdown and rehype-raw use ES6 but jest uses ES5
//There are more options but this is the easiest one
//https://github.com/remarkjs/react-markdown/issues/635#issuecomment-956158474
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

//Tests
describe("<MultipleResponse />", () => {
  afterAll(cleanup);

  //UNIT TESTING
  it("should change checkbox to checked and back to unchecked if checkbox gets clicked", () => {
    render(
      <MultipleResponse
        options={options}
        setAnswerCorrect={mockSetAnswerCorrect}
        setShowAnswer={mockSetShowAnswer}
        formDisabled={false}
        ref={mockUseRef}
      />
    );

    const checkBoxElement = screen.getByTestId("formControlLabel-checkbox-0");
    user.click(checkBoxElement);
    expect(checkBoxElement.firstChild).toBeChecked(); //The checkbox itself is the first child (input)

    /*Test second part of test*/
    user.click(checkBoxElement);
    expect(checkBoxElement.firstChild).not.toBeChecked();
  });

  it("should change checkbox to checked and back to unchecked if label (p tag) gets clicked", () => {
    render(
      <MultipleResponse
        options={options}
        setAnswerCorrect={mockSetAnswerCorrect}
        setShowAnswer={mockSetShowAnswer}
        formDisabled={false}
        ref={mockUseRef}
      />
    );

    //get the checkbox
    const checkBoxElement = screen.getByTestId("formControlLabel-checkbox-0");

    //get the corresponding p tag and click it
    const paragraphElement = checkBoxElement.parentElement.children[1];
    user.click(paragraphElement);

    //Expect the checkbox to be checked
    expect(checkBoxElement.firstChild).toBeChecked();

    /*Test second part of test*/
    //click the element again to simulate a uncheck
    user.click(paragraphElement);

    //Expect checkbox not to be checked
    expect(checkBoxElement.firstChild).not.toBeChecked();
  });
});
