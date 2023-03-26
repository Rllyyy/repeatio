/// <reference types="cypress" />

// Components
import { Question } from "../../Question";
import { ModuleProvider, TData } from "../../../module/moduleContext";
import { CustomToastContainer } from "../../../toast/toast";

// Functions
import { parseJSON } from "../../../../utils/parseJSON";

// Router
import { Route, MemoryRouter } from "react-router-dom";

// css
import "../../../../index.css";

// Functions
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";

//Interfaces
import { IParams } from "../../../../utils/types";
import { IModule } from "../../../module/module";

//Mocha for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

interface IRenderWithRouter extends IParams {
  mode: NonNullable<TData["mode"]>;
  order: NonNullable<TData["order"]>;
}

// Setup Router to access context and useParams
const RenderWithRouter: React.FC<IRenderWithRouter> = ({ moduleID, questionID, mode, order }) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}?mode=${mode}&order=${order}`]}>
      <main>
        <ModuleProvider>
          <Route path='/module/:moduleID/question/:questionID' component={Question} />
        </ModuleProvider>
      </main>
      <CustomToastContainer />
    </MemoryRouter>
  );
};

describe("Delete a Question", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
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

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
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

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
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
      compatibility: "0.4.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
      .click()
      .should(() => {
        /* Check that only one question was deleted from the localStorage */
        const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${"cypress_1"}`));
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
      compatibility: "0.4.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
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
      compatibility: "0.4.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
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
      compatibility: "0.4.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    // Click show navigation button that only exists on small displays
    cy.get("body").then((body) => {
      if (body.find("button[aria-label='Show Navigation']").length > 0) {
        cy.get("button[aria-label='Show Navigation']").click();
      }
    });

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
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
      compatibility: "0.4.0",
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

    // Click delete button
    cy.get("button[aria-label='Delete Question']")
      .click()
      .should(() => {
        const localStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(localStorageItem).to.equal(null);
      });
  });
});

/* //TODO
 - Add test to allow user to delete the last question in the current context 
*/
