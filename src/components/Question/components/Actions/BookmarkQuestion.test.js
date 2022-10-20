import { screen, render } from "@testing-library/react";
import user from "@testing-library/user-event";
import { BookmarkQuestion } from "./BookmarkQuestion.jsx";

//Mock useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    moduleID: "bookmark-test-1",
  }),
}));

//Mock localStorage
//How to test localStorage: https://www.codeblocq.com/2021/01/Jest-Mock-Local-Storage/
let store;
const localStorageMock = (function () {
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

describe("<Bookmark />", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
  });

  //Reset the localStorage to have one entry before each test
  beforeEach(() => {
    store = {
      "repeatio-marked-bookmark-test-1": '["question-id-2"]',
    };
  });

  //* Tests */
  it("should render Component", () => {
    render(<BookmarkQuestion questionID='question-id-1' />);

    //Expect the button
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toBeInTheDocument();
  });

  it("should add questionID to localStorage on click", () => {
    render(<BookmarkQuestion questionID='question-id-1' />);

    const buttonElement = screen.getByRole("button");
    user.click(buttonElement);

    //Parse JSON localStorage object to js object
    const localStorageArray = JSON.parse(window.localStorage.getItem("repeatio-marked-bookmark-test-1"));

    expect(localStorageArray).toContain("question-id-1");
  });

  it("should remove questionID from localStorage on Click when already in localStorage", () => {
    render(<BookmarkQuestion questionID='question-id-2' />);

    const buttonElement = screen.getByRole("button");
    user.click(buttonElement);

    //Parse JSON localStorage object to js object
    const localStorageArray = JSON.parse(window.localStorage.getItem("repeatio-marked-bookmark-test-1"));

    //localStorage should be empty
    expect(localStorageArray).toBe(null);
  });

  it("should initially render the add svg if the item is not in the localStorage", () => {
    render(<BookmarkQuestion questionID='question-id-1' />);

    const bookmarkAddSvg = screen.getByTestId("bookmark-add");

    expect(bookmarkAddSvg).toBeInTheDocument();
  });

  it("should initially render remove svg if the item is already in the localStorage", () => {
    render(<BookmarkQuestion questionID='question-id-2' />);

    const bookmarkRemoveSvg = screen.getByTestId("bookmark-remove");

    expect(bookmarkRemoveSvg).toBeInTheDocument();
  });

  it("should disable the button if passed disabled prop", () => {
    render(<BookmarkQuestion questionID='question-id-1' disabled={true} />);

    const bookmarkQuestionButton = screen.getByRole("button");
    expect(bookmarkQuestionButton).toBeDisabled();
  });
});
