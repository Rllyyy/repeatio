/// <reference types="cypress" />

import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QuestionIdsProvider } from "@components/module/questionIdsContext";
import { Question } from "@components/Question/Question";

// types
import { IParams, ISearchParams } from "src/utils/types";
import { TSettings } from "@hooks/useSetting";

// css
import "../../../../index.css";

/**
 * More test are defined in ModuleEditor.cy.tsx
 */

interface IRenderWithRouter extends IParams {
  mode: NonNullable<ISearchParams["mode"]>;
  order: NonNullable<ISearchParams["order"]>;
}

// Setup Router to access context and useParams
const RenderWithRouter: React.FC<IRenderWithRouter> = ({ moduleID, questionID, mode, order }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=${mode}&order=${order}`]}>
      <main className='px-2 p-0'>
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
    </MemoryRouter>
  );
};

describe("Edit Question", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
  });

  it("should open modal when clicking on the edit button", () => {
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("button[aria-label='Edit Question']").click();

    cy.get(".ReactModal__Overlay").should("be.visible");
    cy.get(".ReactModal__Overlay").should("exist");
  });

  it("should show a tooltip if the user hovers over the edit button", () => {
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("body").realClick();

    // Hoover over the edit button
    cy.get("button[aria-label='Edit Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("Edit Question").should("exist");
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

    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("body").realClick();

    // Hoover over the edit button
    cy.get("button[aria-label='Edit Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("not.exist");
  });
});
