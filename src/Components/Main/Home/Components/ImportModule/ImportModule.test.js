import { screen, render, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import ImportModule from "./ImportModule.jsx";

//MOCKS
//Mock handleCloseModal of the parent component
const mockHandleModalClose = jest.fn();

//Mock file that gets uploaded
const testFile = {
  id: "test1",
  name: "Test",
  compatibility: "0.3.0",
  questions: [],
};

//TEST
describe("<Import Module />", () => {
  it("should render component", () => {
    render(<ImportModule handleModalClose={mockHandleModalClose} />);
    const dropzone = screen.getByRole("presentation");
    expect(dropzone).toBeInTheDocument();
  });

  it("should add file on input add", async () => {
    render(<ImportModule handleModalClose={mockHandleModalClose} />);

    const str = JSON.stringify(testFile);
    const blob = new Blob([str]);
    const file = new File([blob], "repeatio-module-test1.json", { type: "application/json" });

    const dropzoneInput = screen.getByTestId("dropzone-input");

    await waitFor(() => {
      user.upload(dropzoneInput, file);
    });

    const uploadedFileText = screen.getByText("repeatio-module-test1.json");
    expect(uploadedFileText).toBeInTheDocument();
  });

  it("should deny upload if the same file gets uploaded", async () => {
    render(<ImportModule handleModalClose={mockHandleModalClose} />);

    const str = JSON.stringify(testFile);
    const blob = new Blob([str]);
    const file = new File([blob], "repeatio-module-test1.json", { type: "application/json" });

    const dropzoneInput = screen.getByTestId("dropzone-input");

    await waitFor(() => {
      user.upload(dropzoneInput, file);
    });

    await waitFor(() => {
      user.upload(dropzoneInput, file);
    });

    const uploadedFileText = screen.getAllByText("repeatio-module-test1.json");
    expect(uploadedFileText.length).toBe(1);
  });

  it("should remove file on remove click", async () => {
    render(<ImportModule handleModalClose={mockHandleModalClose} />);

    const str = JSON.stringify(testFile);
    const blob = new Blob([str]);
    const file = new File([blob], "repeatio-module-test1.json", { type: "application/json" });

    const dropzoneInput = screen.getByTestId("dropzone-input");

    await waitFor(() => {
      user.upload(dropzoneInput, file);
    });

    const button = screen.getByTestId("file-remove-button");
    user.click(button);

    const uploadedFileText = screen.queryByText("repeatio-module-test1.json");
    expect(uploadedFileText).not.toBeInTheDocument();
  });

  //TODO test if uploaded to localStorage
  //This has to be done in the home component (because of the window.dispatchEvent)
});
