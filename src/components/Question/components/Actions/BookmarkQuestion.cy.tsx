/// <reference types="cypress" />

// Components
import { Question } from "../../Question";
import { BookmarkQuestion } from "./BookmarkQuestion";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";
import { CustomToastContainer } from "../../../toast/toast";

// Router
import { Route, MemoryRouter, Routes } from "react-router-dom";

// css
import "../../../../index.css";

// functions
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";

// Interfaces
import { IParams } from "../../../../utils/types";
import { TSettings } from "@hooks/useSetting";

//Setup mocha for Typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

function RenderBookmarkButtonWithRouter({ moduleID, questionID }: IParams) {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=practice&order=chronological`]}>
      <Routes>
        <Route
          path='/module/:moduleID/question/:questionID'
          element={
            <QuestionIdsProvider>
              <div className='question-form'>
                <div className='question-actions-navigation-wrapper'>
                  <BookmarkQuestion moduleID={moduleID} questionID={`${questionID}`} disabled={false} />
                </div>
              </div>
            </QuestionIdsProvider>
          }
        ></Route>
      </Routes>
    </MemoryRouter>
  );
}

//Setup Router to access context and useParams
const RenderQuestionWithRouter = ({ moduleID, questionID }: IParams) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=practice&order=chronological`]}>
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

describe("Bookmark a Question", () => {
  beforeEach(() => {
    /* cy.fixtureToLocalStorage("repeatio-marked-types_1.json");
    cy.mount(<RenderWithRouter moduleID={"types_1"} questionID={"qID-1"} />); */
    cy.viewport(1000, 500);
    cy.intercept("GET", "/data.json", { fixture: "../../public/data.json" }).as("getData");
  });

  it("should create localStorage item if new bookmarked item is the first in module ", () => {
    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);
    //cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    //should initially display add svg
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-add");

    //Click on the add button
    cy.get("button.bookmark-question-button")
      .click()
      .should(() => {
        const bookmarkedItem = getBookmarkedLocalStorageItem("types_1");
        expect(bookmarkedItem?.id).to.eq("types_1");
        expect(bookmarkedItem?.type).to.equal("marked");
        expect(bookmarkedItem?.compatibility).to.eq("0.6.0");
        expect(bookmarkedItem?.questions).to.include("qID-1");
      });
  });

  it("should save and add the id of a question to the localStorage if it isn't already in the localStorage but there are already items in the localStorage", () => {
    //Add bookmark fixture
    cy.fixtureToLocalStorage("repeatio-marked-types_1.json");

    //Mount component
    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-2"} />);
    //cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-2"} />) //uncomment this if you want to see the whole question component

    //should initially display svg with plus (add button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-add");

    cy.get("button.bookmark-question-button")
      .click()
      .should(() => {
        const bookmarkedItem = getBookmarkedLocalStorageItem("types_1");
        expect(bookmarkedItem?.id).to.equal("types_1");
        expect(bookmarkedItem?.type).to.equal("marked");
        expect(bookmarkedItem?.compatibility).to.equal("0.6.0");
        expect(bookmarkedItem?.questions).to.deep.equal(["qID-1", "qID-3", "qID-2"]);
      });

    //should display svg with minus (remove button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-remove");
  });

  it("should remove a question from the bookmarked localStorage if clicking on the remove button but preserve the rest of the localStorage item", () => {
    cy.fixtureToLocalStorage("repeatio-marked-types_1.json");

    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);
    //cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-1"} />); //uncomment this if you want to see the whole question component

    //should initially display svg with minus (remove button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-remove");

    cy.get("button.bookmark-question-button")
      .click()
      .should(() => {
        const bookmarkedItem = getBookmarkedLocalStorageItem("types_1");
        expect(bookmarkedItem?.id).to.equal("types_1");
        expect(bookmarkedItem?.type).to.equal("marked");
        expect(bookmarkedItem?.compatibility).to.equal("0.6.0");
        expect(bookmarkedItem?.questions).not.to.include("qID-1");
      });

    //should display svg with plus (add button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-add");
  });

  it("should rerender questionID correct after navigation to next question", () => {
    cy.fixtureToLocalStorage("repeatio-marked-types_1.json");

    cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    //should initially display svg with minus (remove button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-remove");

    //Wait for app to finish loading (Alternative: add disabled button if no context and then check for disabled button here)
    cy.wait(500);
    cy.get("button[aria-label='Navigate to next Question']").click();

    //should initially display svg with plus (add button)
    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-add");
  });

  it("should should remove localStorage item if last bookmarked question is removed", () => {
    //Setup localStorage with one item (qID-1)
    localStorage.setItem(
      "repeatio-marked-types_1",
      JSON.stringify({ id: "types_1", compatibility: "0.6.0", questions: ["qID-1"] })
    );

    //Render just the button, uncomment the below to see the question component (but takes 5x time longer)
    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);
    //cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    //Click on the remove button
    cy.get("button.bookmark-question-button")
      .click()
      .should(() => {
        const bookmarkedItem = getBookmarkedLocalStorageItem("types_1");
        expect(bookmarkedItem).to.equal(null);
      });
  });

  it("should disable bookmark question if the questionID is invalid", () => {
    cy.mount(<RenderQuestionWithRouter moduleID={"types_1"} questionID={"qID-20"} />);
    cy.get(".bookmark-question-button").should("be.disabled");
  });

  it("should show a 'Save Question' tooltip if when hovering over the bookmark button", () => {
    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    cy.get("body").realClick();

    // Hoover over the save button
    cy.get("button[aria-label='Save Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("Save Question").should("exist");
  });

  it("should show 'Unsave Question' tooltip if the question is bookmarked", () => {
    localStorage.setItem(
      "repeatio-marked-types_1",
      JSON.stringify({ id: "types_1", compatibility: "0.6.0", questions: ["qID-1"] })
    );

    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    cy.get("body").realClick();

    // Hoover over the unsave button
    cy.get("button[aria-label='Unsave Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("Unsave Question").should("exist");
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

    cy.mount(<RenderBookmarkButtonWithRouter moduleID={"types_1"} questionID={"qID-1"} />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Save Question']").realHover();

    // Assert that the tooltip does not exist
    cy.contains("Save Question").should("not.exist");
  });
});
