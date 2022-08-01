import { screen, render } from "@testing-library/react";
import { QuestionBottom } from "../Question.js";
import { useSize } from "../../../../hooks/useSize.js";
import user from "@testing-library/user-event";

//MOCKS
//Mock function
const mockHandleResetRetryQuestion = jest.fn();

//Mock router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    questionID: "qID-1-bottom",
  }),
  useLocation: () => ({
    search: "?mode=chronological",
  }),
}));

//Mock size hook
//Override the default useSize hook
jest.mock("../../../../hooks/useSize.js", () => ({
  useSize: jest.fn(),
}));

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

describe("<QuestionBottom />", () => {
  it("should render QuestionBottom component", () => {
    render(<QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} />);

    expect(screen.getByTestId("question-bottom")).toBeInTheDocument();
  });

  it("should disable buttons in QuestionBottom if passed disabled prop", () => {
    render(
      <QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} disabled={true} showAnswer={false} />
    );

    expect(screen.getByTestId("question-check")).toBeDisabled();
    expect(screen.getByTestId("question-retry")).toBeDisabled();
  });

  it("should render QuestionBottom with class collapsed", () => {
    render(<QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} />);

    expect(screen.getByTestId("question-bottom")).toBeInTheDocument();
  });

  it("should render Question Bottom with class collapsed with width of 800", () => {
    useSize.mockReturnValueOnce({ width: 800 });
    render(
      <QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} disabled={false} showAnswer={false} />
    );

    expect(screen.getByTestId("question-bottom")).toHaveClass("collapsed");
  });

  it("should render Question Bottom with class expanded with width of 801", () => {
    useSize.mockReturnValueOnce({ width: 801 });
    render(
      <QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} disabled={false} showAnswer={false} />
    );

    expect(screen.getByTestId("question-bottom")).toHaveClass("expanded");
  });

  it("should render <QuestionNavigation /> after click on <ShowQuestionNavButton /> with size of 800", () => {
    useSize.mockReturnValueOnce({ width: 800 });
    render(
      <QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} disabled={false} showAnswer={false} />
    );

    //Click on the show nav button
    user.click(screen.getByLabelText("Show Navigation"));

    //Expect the wrapper to show up
    expect(screen.getByTestId("question-actions-navigation-wrapper")).toBeInTheDocument();
  });

  it("should always render <QuestionNavigation /> with size of 801 and not show <ShowQuestionNavButton />w", () => {
    useSize.mockReturnValueOnce({ width: 801 });
    render(
      <QuestionBottom handleResetRetryQuestion={mockHandleResetRetryQuestion} disabled={false} showAnswer={false} />
    );

    //Expect the wrapper to show up
    expect(screen.getByTestId("question-actions-navigation-wrapper")).toBeInTheDocument();
    expect(screen.queryByLabelText("Show Navigation")).not.toBeInTheDocument();
  });
});
