import { screen, render } from "@testing-library/react";

import { QuestionPoints } from "../Question.js";

//Mocks
//Message without these: "Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax"
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

//Component
describe("<QuestionPoints />", () => {
  it("Should render the QuestionPoints component)", () => {
    render(<QuestionPoints />);

    const questionPointsElement = screen.getByTestId("question-points");
    expect(questionPointsElement).toBeInTheDocument();
  });

  it('should render "? Points" if the value is undefined', () => {
    render(<QuestionPoints />);

    const pointsTextContent = screen.getByTestId("question-points").textContent;

    expect(pointsTextContent).toBe("? Points");
  });

  it('should render "? Points" if the value is null', () => {
    render(<QuestionPoints points={null} />);

    const pointsTextContent = screen.getByTestId("question-points").textContent;

    expect(pointsTextContent).toBe("? Points");
  });

  it('should render "1 Point" if the value is 1', () => {
    render(<QuestionPoints points={1} />);

    const pointsTextContent = screen.getByTestId("question-points").textContent;

    expect(pointsTextContent).toBe("1 Point");
  });

  it('should render "2 Points" if the value is 2', () => {
    render(<QuestionPoints points={2} />);

    const pointsTextContent = screen.getByTestId("question-points").textContent;

    expect(pointsTextContent).toBe("2 Points");
  });

  it('should render "2.5 Points" if the given value is 2.5', () => {
    render(<QuestionPoints points={2.5} />);

    const pointsTextContent = screen.getByTestId("question-points").textContent;

    expect(pointsTextContent).toBe("2.5 Points");
  });
});
