import { screen, render } from "@testing-library/react";
import user from "@testing-library/user-event";

import { GapTextDropdown } from "./GapTextDropdown";

declare var it: jest.It;
declare var describe: jest.Describe;
declare const expect: jest.Expect;

//MOCKS
//Mock provided answerOptions
const options = {
  text: "Possible values for each gap can be selected from a []-list. If the user answers 50% of the gaps correctly, he will be awarded [] of the points.",
  dropdowns: [
    {
      id: "select-0",
      options: ["Dropdown", "Pickup", "empty"],
      correct: "Dropdown",
    },
    {
      id: "select-1",
      options: ["0%", "25%", "50%", "75%", "100%"],
      correct: "50%",
    },
  ],
};

//React-markdown uses ES6 but jest uses ES5
//returning the elements in a paragraph isn't actually that bad because react-markdown does the same
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

jest.mock("rehype-external-links", () => (props: IProps) => {
  return <p className='rehype-external-links-mock'>{props.children}</p>;
});

//Mock Component
const MockGapTextDropdown = ({ disabled }: { disabled: boolean }) => {
  return <GapTextDropdown options={options} formDisabled={disabled} ref={jest.fn()} />;
};

//Test Component
describe("<GapTextDropdown />", () => {
  it("should render 2 dropdown elements", () => {
    render(<MockGapTextDropdown disabled={false} />);
    const selectElements = screen.getAllByRole("combobox");
    expect(selectElements).toHaveLength(2);
  });

  it("should have 10 options (8 from the provided options + 2 empty ones)", () => {
    render(<MockGapTextDropdown disabled={false} />);
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(10);
  });

  it("should handle change event if form isn't disabled", () => {
    render(<MockGapTextDropdown disabled={false} />);

    //const comboboxElement = screen.getByTestId("select-0") as HTMLSelectElement;
    const comboboxElement = screen.getAllByRole("combobox")[0] as HTMLSelectElement;
    const comboboxOption = screen.getByRole("option", { name: "Dropdown" }) as HTMLOptionElement;

    user.selectOptions(comboboxElement, comboboxOption);

    expect(comboboxOption.selected).toBe(true);
    expect(comboboxElement.value).toBe("Dropdown");
  });

  it("should not allow change event if form is disabled", () => {
    render(<MockGapTextDropdown disabled={true} />);

    const comboboxElement = screen.getAllByRole("combobox")[0] as HTMLSelectElement;
    const comboboxOption = screen.getByRole("option", { name: "Dropdown" }) as HTMLOptionElement;

    user.selectOptions(comboboxElement, comboboxOption);

    expect(comboboxElement).toBeDisabled();
    expect(comboboxOption.selected).toBe(false);
    expect(comboboxElement.value).toBe("");
  });
});
