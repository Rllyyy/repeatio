import { screen, render } from "@testing-library/react";
import user from "@testing-library/user-event";
import CreateModule from "./CreateModule.jsx";

//Mocks
const mockHandleModalClose = jest.fn();

describe("<CreateModule />", () => {
  it("should render component", () => {
    render(<CreateModule handleModalClose={mockHandleModalClose} />);
    const title = screen.getByText("Create new Module");
    expect(title).toBeInTheDocument();
  });

  it("should render component with empty values", () => {
    render(<CreateModule handleModalClose={mockHandleModalClose} />);

    //Module id textbox
    const idInput = screen.getByLabelText("ID");

    //Module name textbox
    const nameInput = screen.getByLabelText("Name");

    expect(idInput.value).toBe("");
    expect(nameInput.value).toBe("");
  });

  it("should update the input values onChange event", () => {
    render(<CreateModule handleModalClose={mockHandleModalClose} />);

    //Module id textbox
    const idInput = screen.getByLabelText("ID");
    user.type(idInput, "test1");

    //Module name textbox
    const nameInput = screen.getByLabelText("Name");
    user.type(nameInput, "Test");

    //Module compatibility textbox
    const compatibilityInput = screen.getByLabelText("Compatibility Version");

    expect(idInput.value).toBe("test1");
    expect(nameInput.value).toBe("Test");
    expect(compatibilityInput.value.length).toBeGreaterThan(0);
  });

  //TODO test if uploaded to localStorage
  //This has to be done in the home component (because of the window.dispatchEvent)
});
