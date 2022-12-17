/// <reference types="cypress" />

// Components
import { Question } from "../../Question";
import { ModuleProvider } from "../../../module/moduleContext";
import { CustomToastContainer } from "../../../toast/toast";

// Router
import { Route, MemoryRouter } from "react-router-dom";

// css
import "../../../../index.css";

// Functions
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";

//Interfaces
import { IParams } from "../../../../utils/types";

//Mocha for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

// Setup Router to access context and useParams
const RenderWithRouter = ({ moduleID, questionID }: IParams) => {
  return (
    <MemoryRouter initialEntries={[`/module/${moduleID}/question/${questionID}`]}>
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
    cy.viewport(500, 500);
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.mount(<RenderWithRouter moduleID={"cypress_1"} questionID={"qID-1"} />);
  });

  it("should delete a question and navigate to the next question", () => {
    cy.get("button.show-question-nav").click();
    cy.get("button[aria-label='Delete Question']").click();

    cy.contains("qID-2").should("exist");
  });

  it("should remove question from bookmarked localStorage when deleting a question with the same id", () => {
    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      type: "bookmark",
      compatibility: "0.4.0",
      questions: ["qID-2", "qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    //Delete question
    cy.get("button.show-question-nav").click();
    cy.get("button[aria-label='Delete Question']")
      .click()
      .should(() => {
        const localStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(localStorageItem?.id).to.equal("cypress_1");
        expect(localStorageItem?.questions).to.deep.equal(["qID-2"]);
      });
  });

  it("should remove the bookmarked localStorage when a question that is the last remaining bookmarked item", () => {
    //Setup localStorage
    const localStorageItem = {
      id: "cypress_1",
      compatibility: "0.4.0",
      type: "bookmark",
      questions: ["qID-1"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(localStorageItem, null, "\t"));

    //Delete question
    cy.get("button.show-question-nav").click();
    cy.get("button[aria-label='Delete Question']")
      .click()
      .should(() => {
        const localStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(localStorageItem).to.equal(null);
      });
  });
});
