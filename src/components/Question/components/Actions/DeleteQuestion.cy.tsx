/// <reference types="cypress" />

// Components
import { Question } from "../../Question";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";
import { CustomToastContainer } from "../../../toast/toast";

// Functions
import { parseJSON } from "../../../../utils/parseJSON";

// Router
import { Route, MemoryRouter, Routes } from "react-router-dom";

// css
import "../../../../index.css";

// Functions
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";

//Interfaces
import { IParams, ISearchParams } from "../../../../utils/types";
import { IModule } from "../../../module/module";
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

describe("Delete a Question", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
  });

  it("should open the DeleteConfirmationModal when clicking on the delete Button", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']").click();

    // Assert that the modal is visible
    cy.get(".ReactModal__Content--after-open").should("exist").and("be.visible");
    cy.contains("h2", "Delete Question?").should("exist");
  });

  it("should close the DeleteConfirmationModal when clicking on Cancel button", () => {
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']").click();

    cy.contains("button", "Cancel").click();

    // Assert that the modal is visible
    cy.get(".ReactModal__Content--after-open").should("not.exist");
    cy.contains("h2", "Delete Question?").should("not.exist");
  });

  it("should close the DeleteConfirmationModal after deleting the question", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question").click();

    // Assert that the modal is not visible
    cy.get(".ReactModal__Content--after-open").should("not.exist");
    cy.contains("h2", "Delete Question?").should("not.exist");
  });

  it("should delete a question and navigate to the next question (mode=practice & order=chronological)", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${"cypress_1"}`));
        expect(module?.questions.length).to.equal(5);
      });

    cy.contains("qID-2").should("exist");
  });

  it("should delete a question and navigate to next question (mode=practice & order=random)", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='random' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm the deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${"cypress_1"}`));
        expect(module?.questions.length).to.equal(5);
      });
    cy.get(".question-id").should("exist");

    // Navigate back
    cy.get("button[aria-label='Navigate to previous Question'").click();
    cy.get(".question-id").should("exist");
  });

  it("should delete Question navigate to the next question (mode=bookmarked & order=chronological)", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='bookmarked' order='chronological' />);

    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.6.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        //Check that only one question was deleted from the localStorage
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-cypress_1`));
        expect(module?.questions.length).to.equal(5);
      });

    cy.contains("ID: qID-2").should("exist");
  });

  it("should delete Question navigate to the next question (mode=bookmarked & order=chronological)", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='bookmarked' order='chronological' />);

    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.6.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        /* Check that only one question was deleted from the localStorage */
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${"cypress_1"}`));
        expect(module?.questions.length).to.equal(5);
      });

    cy.contains("ID: qID-2").should("exist");
  });

  it("should delete Question navigate to the next question (mode=bookmarked & order=random)", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='bookmarked' order='random' />);

    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.6.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        /* Check that only one question was deleted from the localStorage */
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${"cypress_1"}`));
        expect(module?.questions.length).to.equal(5);
      });

    cy.contains("ID: qID-2").should("exist");
  });

  it("should remove question from bookmarked localStorage when deleting a question with the same id", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.6.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        const localStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.questions).to.deep.equal(["qID-2"]);
      });
  });

  it("should remove the bookmarked localStorage when a question that is the last remaining bookmarked item", () => {
    // Mount Component
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      compatibility: "0.6.0",
      type: "marked",
      questions: ["qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question")
      .click()
      .should(() => {
        const localStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(localStorageItem).to.equal(null);
      });
  });

  it("should deselect the current selection if deleting a question", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.mount(
      <RenderWithRouter moduleID={"multiple_choice"} questionID={"mc-1"} mode='practice' order='chronological' />
    );

    // Select and submit question
    cy.get("input[value='option-0']").click();

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Delete Question and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question").click();

    // Assert that the radio button is not selected and is enabled
    cy.get("input[value='option-0']").should("not.be.selected").and("be.enabled");
  });

  it("should hide the question correction after deleting a question and enable the inputs", () => {
    cy.fixtureToLocalStorage("repeatio-module-multiple_choice.json");
    cy.mount(
      <RenderWithRouter moduleID={"multiple_choice"} questionID={"mc-1"} mode='practice' order='chronological' />
    );

    // Select and submit question
    cy.get("input[value='option-0']").click();

    // Check answer to trigger correction to show up
    cy.get("button[aria-label='Check Question']").click();

    // Click show navigation button that just exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Delete Question and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question").click();

    // Assert that the correction is no longer visible
    cy.get("section.question-correction").should("not.exist");

    // Assert that all radio inputs are enabled
    cy.get("input[type='radio']").first().should("not.be.disabled");

    // Assert that the radio button is not selected and is enabled
    cy.get("input[value='option-0']").should("not.be.selected").and("be.enabled");
  });

  it("should scroll back to top of question if deleting a question", () => {
    cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Scroll to the end the question
    cy.get("label.MuiFormControlLabel-root").last().scrollIntoView();

    // Delete Question and confirm deletion
    cy.get("button[aria-label='Delete Question']").click();
    cy.contains("button", "Delete Question").click();

    // Assert that the question is at the top of the page
    cy.contains("ID: qID-2").should("be.visible");
  });

  it("should show a tooltip if a user hovers over the delete button", () => {
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} mode='practice' order='chronological' />);

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Delete Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
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

    // Hoover over the delete button
    cy.get("button[aria-label='Delete Question']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("not.exist");
  });
});
