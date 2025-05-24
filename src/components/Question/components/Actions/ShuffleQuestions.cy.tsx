/// <reference types="cypress" />

// Components
import { Question } from "../../Question";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";
import { CustomToastContainer } from "../../../toast/toast";

// Router
import { Route, MemoryRouter, Routes } from "react-router-dom";

// css
import "../../../../index.css";

//Interfaces
import { IParams, ISearchParams } from "../../../../utils/types";
import { IModule } from "../../../module/module";
import { parseJSON } from "../../../../utils/parseJSON";
import { TSettings } from "@hooks/useSetting";

//Mocha for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

interface IRenderWithRouter extends IParams {
  mode: NonNullable<ISearchParams["mode"]>;
  order: NonNullable<ISearchParams["order"]>;
}

// Setup Router to access context and useParams
const RenderWithRouter: React.FC<IRenderWithRouter> = ({ moduleID, questionID, mode, order }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=${mode}&order=${order}`]}>
      <main>
        <Routes>
          <Route
            path='/module/:moduleID/question/:questionID'
            element={
              <QuestionIdsProvider>
                <Question />
              </QuestionIdsProvider>
            }
          />
        </Routes>
      </main>
      <CustomToastContainer />
    </MemoryRouter>
  );
};

describe("Shuffle Questions", { viewportHeight: 800, viewportWidth: 900 }, () => {
  it("should show the shuffle button as enabled if the order is random", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='random' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("button[aria-label='Disable shuffle']").should("exist").and("have.attr", "aria-checked", "true");
  });

  it("should show the shuffle button as disabled if the order is chronological", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial chronological question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    cy.get("button[aria-label='Enable shuffle']").should("exist").and("have.attr", "aria-checked", "false");
  });

  it("should highlight/unhighlight the shuffle button on click", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial chronological question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // click the shuffle button
    cy.get("button[aria-label='Enable shuffle']").click();

    // Assert that shuffle is now enabled and click the button again to reset the shuffle
    cy.get("button[aria-label='Disable shuffle']").should("exist").and("have.attr", "aria-checked", "true").click();

    // Assert that the shuffle is now disabled
    cy.get("button[aria-label='Enable shuffle']").should("exist").and("have.attr", "aria-checked", "false");
  });

  it("should keep the shuffle state of button if navigating to the next question", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='random' />);

    // navigate to next question
    cy.get("button[aria-label='Navigate to next Question']").click();

    // Assert that the shuffle button is still in active state on new question
    cy.get("button[aria-label='Disable shuffle']").should("exist").and("have.attr", "aria-checked", "true");
  });

  it("should randomize the questions on shuffle click", { retries: 8 }, () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial chronological question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    let initialQuestionIdsOrder: string[] | undefined = [];
    const ids: string[] = [];

    cy.get("button[aria-label='Enable shuffle']")
      .click()
      .then(() => {
        // get the initial order of the ids from the local Storage
        initialQuestionIdsOrder = parseJSON<IModule>(localStorage.getItem(`repeatio-module-cypress_1`))?.questions.map(
          (question) => question.id
        );
      })
      .then(() => {
        for (let index = 0; index <= (initialQuestionIdsOrder?.length || 0) - 1; index++) {
          cy.get("p.question-id")
            .invoke("text")
            .then((text) => {
              // Remove "ID: " from the text
              ids.push(text.split(" ")[1]);
            });

          cy.get("button[aria-label='Navigate to next Question']").click();
        }
      })
      .should(() => {
        // Assert that the order of the questions is randomized
        expect(ids).not.to.deep.equal(initialQuestionIdsOrder);
      });
  });

  it("should reorder the questions to chronological order on Disable shuffle click", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-2"} mode='practice' order='random' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("button[aria-label='Disable shuffle']").click();

    let questions: string;
    const ids: string[] = [];

    cy.get(".question-progress")
      .invoke("text")
      .then((text) => {
        questions = text.split("/")[1].trim().split(" ")[0];
      })
      .then(() => {
        for (let index = 0; index < parseInt(questions); index++) {
          cy.get("p.question-id")
            .invoke("text")
            .then((text) => {
              // Remove "ID: " from the text
              ids.push(text.split(" ")[1]);
            });

          cy.get("button[aria-label='Navigate to next Question']").click();
        }
      })
      .should(() => {
        expect(ids).to.deep.equal(["qID-2", "qID-3", "qID-4", "qID-5", "qID-6", "qID-1"]);
      });
  });

  it("should reset the progress to the index (+ 1) if switching from random order to chronological", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-3"} mode='practice' order='random' />);

    // Assert that the progress is at 1
    cy.contains("1/6 Questions").should("exist");

    // Set the order to chronological
    cy.get("button[aria-label='Disable shuffle']").click();

    // Assert that the progress was reset
    cy.contains("3/6 Questions").should("exist");
  });

  it("should start the progress at 1 if clicking on shuffle questions", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-4"} mode='practice' order='chronological' />);

    // Assert that the progress is at 3
    cy.contains("4/6 Questions").should("exist");

    // Set the order to random
    cy.get("button[aria-label='Enable shuffle']").click();

    // Assert that the progress was reset
    cy.contains("1/6 Questions").should("exist");
  });

  it("should disable the shuffle button if the question is not found", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"invalid"} mode='practice' order='chronological' />);

    cy.get("button[aria-label='Enable shuffle']").should("be.disabled");
  });

  it.only("should show 'Enable Shuffle' tooltip if the user hovers over the button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    cy.get("body").realClick();

    cy.get("button[aria-label='Enable shuffle']").trigger("mouseover");

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("Enable Shuffle").should("exist");
  });

  it.only("should show 'Disable Shuffle' tooltip if the user hovers over the button", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='random' />);

    cy.get("body").realClick();

    cy.get("button[aria-label='Disable shuffle']").trigger("mouseover");

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("Disable Shuffle").should("exist");
  });

  it("should not show the tooltip if the user has the setting disabled", () => {
    const settings: TSettings = {
      expanded: false,
      addedExampleModule: true,
      moduleSort: "ID (ascending)",
      embedYoutubeVideos: true,
      showTooltips: false,
    };

    localStorage.setItem("repeatio-settings", JSON.stringify(settings, null, "\t"));

    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    // Mount Component with initial random question order
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='random' />);

    cy.get("body").realClick();

    cy.get("button[aria-label='Disable shuffle']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("not.exist");
    cy.contains("Disable Shuffle").should("not.exist");
  });
});
