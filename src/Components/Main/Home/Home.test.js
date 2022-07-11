import { screen, render } from "@testing-library/react";
import Home from "./Home.js";

jest.mock("d3-ease", () => () => {
  return <p>Mock d3</p>;
});

//! Although it is possible to to mock parts of the localStorage (getItem, setItem, etc.), mocking the full storage object seems not to.
//! This is a problem as the component needs to access it
//! A option could be to use a hook for the localStorage and mock it for this test
//TODO do the above in cypress
describe("<Home />", () => {
  it("should render component", () => {
    render(<Home />);

    const heading = screen.getByText("Module Overview");
    expect(heading).toBeInTheDocument();
  });
});
