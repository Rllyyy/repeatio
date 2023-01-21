import { IQuestionBottom, Question, QuestionBottom } from "../Question";
import { MemoryRouter, Route } from "react-router-dom";
import { IParams } from "../../../utils/types";
import { ModuleProvider } from "../../module/moduleContext";

import "../../../index.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;

interface IRenderComponentWithRouter extends Required<IParams> {
  component: React.FC<IQuestionBottom>;
}

const RenderComponentWithRouter = ({ component, moduleID, questionID }: IRenderComponentWithRouter) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}`]}>
      <main style={{ marginTop: 0, padding: 0 }}>
        <ModuleProvider>
          <Route path='/module/:moduleID/question/:questionID' component={component} />
        </ModuleProvider>
      </main>
    </MemoryRouter>
  );
};

describe("Question Bottom Component", () => {
  // Add localStorage item before each test
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
  });

  it("should render QuestionBottom component", () => {
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);

    // Assert that the component inside the Question exists
    cy.get("div.question-bottom").should("exist");
  });

  it("should disable the buttons if the question isn't found", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.mount(<RenderComponentWithRouter component={Question} moduleID='invalid' questionID='invalid' />);

    // Assert that the buttons are disabled
    cy.get("div.question-bottom").find("button.question-check-next").should("be.disabled");
    cy.get("div.question-bottom").find("button.question-retry").should("be.disabled");
  });

  it("should not render the question actions and navigation and have class collapsed on component widths <= 800", () => {
    cy.viewport(800, 720);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);

    // Assert that question-bottom has class collapsed
    cy.get("div.question-bottom").should("have.class", "collapsed");

    // Assert that the actions and navigation aren't visible
    cy.get(".question-actions-navigation-wrapper").should("not.exist");
  });

  it("should render the question actions and navigation and have class expanded on a component widths >= 801", () => {
    cy.viewport(900, 720);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);

    // Assert that the question-bottom has class expanded
    cy.get("div.question-bottom").should("have.class", "expanded");

    // Assert that the actions and navigation exists
    cy.get(".question-actions-navigation-wrapper").should("exist");
  });

  it("should collapse the bottom if resizing the viewport", () => {
    cy.viewport(900, 720);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);
    cy.viewport(800, 720);

    // Assert that question-bottom has class collapsed
    cy.get("div.question-bottom").should("have.class", "collapsed");

    // Assert that the actions and navigation aren't visible
    cy.get(".question-actions-navigation-wrapper").should("not.exist");
  });

  it("should show the question navigation and question actions on show navigation button click ", () => {
    cy.viewport(500, 500);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);
    cy.get("button[aria-label='Show Navigation']").click();
    cy.get(".question-actions-navigation-wrapper").should("exist");
  });

  it("should not render the show navigation button if the width of the question-bottom component is greater than 800", () => {
    cy.viewport(900, 720);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);
    cy.get("button[aria-label='Show Navigation']").should("not.exist");
  });

  it("should not render the show navigation button if resizing from a small viewport to a viewport greater than 800 and back", () => {
    cy.viewport(500, 500);
    cy.mount(<RenderComponentWithRouter component={QuestionBottom} moduleID='cypress_1' questionID='qID-1' />);

    // Assert that the button exists
    cy.get("button[aria-label='Show Navigation']").should("exist");

    // Resize to a bigger viewport and assert that the navigation no longer exists
    cy.viewport(900, 500);
    cy.get("button[aria-label='Show Navigation']").should("not.exist");

    // Resize back to smaller viewport and assert that the navigation exists again
    cy.viewport(500, 500);
    cy.get("button[aria-label='Show Navigation']").should("exist");
  });
});
