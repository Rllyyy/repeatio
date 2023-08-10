/// <reference types="cypress" />
import { Form } from "../../QuestionEditor";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QuestionIdsProvider } from "../../../module/questionIdsContext";

//Css
import "../../../../index.css";
import { parseJSON } from "../../../../utils/parseJSON";
import { IModule } from "../../../module/module";
import { IExtendedMatch } from "../../../Question/QuestionTypes/ExtendedMatch/ExtendedMatch";

//Mocha / Chai for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

describe("ExtendedMatchEditor", () => {
  beforeEach(() => {
    const handleModalCloseSpy = cy.spy().as("handleModalCloseSpy");

    cy.mount(
      <MemoryRouter initialEntries={["/module/cypress_1"]}>
        <Routes>
          <Route
            path='/module/:moduleID'
            element={
              <QuestionIdsProvider>
                <Form handleModalClose={handleModalCloseSpy} mode={"create"} />
              </QuestionIdsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    cy.get("select[name='type']").select("Extended Match");
  });

  it("should render empty component with two add buttons", () => {
    cy.get("button[aria-label='Add right element']").should("exist");
    cy.get("button[aria-label='Add left element']").should("exist");
  });

  it("should add elements when clicking on the add element button", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("div[aria-label='Element left-0']").should("exist");

    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("div[aria-label='Element right-0']").should("exist");
    cy.get("div[aria-label='Element right-1']").should("exist");
  });

  it("should keep the width of the add element buttons", () => {
    cy.get("button#add-left-element").should("have.css", "width", "154.28125px");
    cy.get("button#add-right-element").should("have.css", "width", "154.28125px").click();

    cy.get("button#add-right-element").should("have.css", "width", "154.28125px");
    cy.get("button#add-left-element").should("have.css", "width", "154.28125px").click();

    cy.get("button#add-right-element").should("have.css", "width", "154.28125px");
    cy.get("button#add-left-element").should("have.css", "width", "154.28125px");

    cy.get("textarea#textarea-left-0")
      .type("Although this is a lot of text, the width should stay the same", {
        delay: 2,
      })
      .invoke("outerHeight")
      .should("be.greaterThan", 115);

    cy.get("button#add-right-element").should("have.css", "width", "154.28125px");
    cy.get("button#add-left-element").should("have.css", "width", "154.28125px");

    cy.get("button[aria-label='Remove element right-0']").click();
    cy.get("button#add-right-element").should("have.css", "width", "154.28125px");

    cy.get("button[aria-label='Remove element left-0']").click();
    cy.get("button#add-left-element").should("have.css", "width", "154.28125px");
  });

  it("should remove an element onClick", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Remove element left-0'").click();

    cy.get("div[aria-label='Element left-0'").should("not.exist");
  });

  it("should remove the correct element", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Remove element left-1'").click();

    cy.get("div[aria-label='Element left-0'").should("exist");
    cy.get("div[aria-label='Element left-1'").should("not.exist");
    cy.get("div[aria-label='Element left-2'").should("exist");
  });

  it("should use the correct id if adding an element after removing another element", () => {
    cy.get("button[aria-label='Add right element']").click().click();

    // Remove element
    cy.get("button[aria-label='Remove element right-0'").click();
    // Add new element
    cy.get("button[aria-label='Add right element']").click();

    cy.get("div[aria-label='Element right-0'").should("exist");
    cy.get("div[aria-label^='Element right-']").should("have.length", 2);
  });

  it("should write into the textarea inside an element", () => {
    cy.get("button[aria-label='Add right element']").click();

    cy.get("textarea[id='textarea-right-0']").type("First element").should("have.value", "First element");
  });

  it("add a line between two elements and update the module", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.get("input[name='id']").type("simple-extended-match", { delay: 2 });

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("textarea#textarea-left-0").type("left");
    cy.get("textarea#textarea-right-0").type("right");

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("g#left-0_right-0").should("exist");

    cy.get("g.line-container").should("have.length", 1);

    // Assert line position
    cy.get("line#left-0_right-0_line-editor").should("have.attr", "x1", "0");
    cy.get("line#left-0_right-0_line-editor").should("have.attr", "y1", "18.5");

    cy.get("line#left-0_right-0_line-editor").should("have.attr", "x2", "61.421875");
    cy.get("line#left-0_right-0_line-editor").should("have.attr", "y2", "18.5");

    cy.contains("button", "Add")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        const answerOptions = localStorageItem?.questions?.[localStorageItem?.questions?.length - 1]
          .answerOptions as IExtendedMatch;

        expect(answerOptions).to.deep.equal({
          correctMatches: [
            {
              left: "left-0",
              right: "right-0",
            },
          ],
          leftSide: [
            {
              id: "left-0",
              text: "left",
            },
          ],
          rightSide: [
            {
              id: "right-0",
              text: "right",
            },
          ],
        });
      });
  });

  it("should add a diagonal line between two elements", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("g.line-container").should("have.length", 1);

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x2", "61.421875");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y2", "18.5");
  });

  it("should add multiple lines and add the question to the localStorage", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
    cy.get("input[name='id']").type("simple-extended-match", { delay: 2 });

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("textarea#textarea-left-0").type("left 0");
    cy.get("textarea#textarea-left-1").type("left 1");
    cy.get("textarea#textarea-right-0").type("right 0");
    cy.get("textarea#textarea-right-1").type("right 1");

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get(".line-container").should("have.length", 2);

    cy.get("line#left-0_right-0_line-editor").should("have.attr", "y1", "18.5");
    cy.get("line#left-0_right-0_line-editor").should("have.attr", "y2", "18.5");

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y1", "61.5");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y2", "18.5");

    cy.contains("button", "Add")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        const answerOptions = localStorageItem?.questions?.[localStorageItem?.questions?.length - 1]
          .answerOptions as IExtendedMatch;

        expect(answerOptions).to.deep.equal({
          correctMatches: [
            {
              left: "left-1",
              right: "right-0",
            },
            {
              left: "left-0",
              right: "right-0",
            },
          ],
          leftSide: [
            {
              id: "left-0",
              text: "left 0",
            },
            {
              id: "left-1",
              text: "left 1",
            },
          ],
          rightSide: [
            {
              id: "right-0",
              text: "right 0",
            },
            {
              id: "right-1",
              text: "right 1",
            },
          ],
        });
      });
  });

  it("should only add one line if clicking one side twice", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get(".line-container").should("have.length", 1);

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x2", "61.421875");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y2", "18.5");
  });

  it("should not create a line if the user just clicked on one element", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get(".line-container").should("not.exist");
  });

  it("should update the line position when adding a new  line in the textarea", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("textarea[id='textarea-right-0']")
      .type("This is a {enter}Text", { delay: 2 })
      .invoke("outerHeight")
      .should("be.greaterThan", 60);

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x2", "61.421875");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y2", "32");
  });

  it("should update the line position when removing an item", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-0']").click();

    cy.get("line#left-2_right-1_line-editor").should("have.attr", "x1", "0");
    cy.get("line#left-2_right-1_line-editor").should("have.attr", "y1", "104.5");

    cy.get("line#left-2_right-1_line-editor").should("have.attr", "x2", "61.421875");
    cy.get("line#left-2_right-1_line-editor").should("have.attr", "y2", "18.5");
  });

  it("should update the line position when the element above increases its height", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-1']").click();
    cy.get("button[id='add-line-left-2']").click();

    cy.get("textarea[id='textarea-right-0']").type("{enter}");

    cy.get("line#left-2_right-1_line-editor")
      .should("have.attr", "x1", "0")
      .and("have.attr", "y1", "104.5")
      .and("have.attr", "x2", "61.421875")
      .and("have.attr", "y2", "88.5");
  });

  it("should update the line position if the viewport width changes", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.viewport(800, 500);

    cy.get("line#left-1_right-0_line-editor").should("have.attr", "x2", "102.578125").and("have.attr", "y2", "18.5");

    cy.get("line#left-0_right-0_line-editor").should("have.attr", "x2", "102.578125").and("have.attr", "y2", "18.5");
  });

  it("should remove the correct line onClick", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("circle#left-0_right-0_circle").click();

    cy.get(".line-container").should("have.length", 2);
    cy.get("line#left-0_right-0_line-editor").should("not.exist");
    cy.get("line#left-1_right-0_line-editor").should("exist");
    cy.get("line#left-2_right-1_line-editor").should("exist");
  });

  it("should remove a line onEnter key press", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.realPress(["Shift", "Tab"]);
    cy.realPress("Enter");

    cy.get(".line-container").should("have.length", 0);
    cy.get("line#left-0_right-0_line-editor").should("not.exist");
  });

  it("should remove the lines related to an element if it gets removed", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-0']").click();

    cy.get(".line-container").should("have.length", 1);
    cy.get("line#left-0_right-0_line-editor").should("not.exist");
    cy.get("line#left-1_right-0_line-editor").should("not.exist");
    cy.get("line#left-2_right-1_line-editor").should("exist");
  });

  it("should grow the textarea if keys exceed on line", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("textarea[id='textarea-right-0']")
      .type("Wrap to next line !!!", { delay: 2 })
      .invoke("outerHeight")
      .should("be.greaterThan", 60);
  });

  it("should center remove line circle", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("circle").should("have.attr", "cx", "30.7109375").and("have.attr", "cy", "40");
  });

  it("should center remove line circle after another element is removed", () => {
    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-0']").click();

    cy.get("circle").should("have.attr", "cx", "30.7109375").and("have.attr", "cy", "61.5");
  });

  it("should add a line if its the first line (left point first)", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("#left-0_right-0_line-editor").should("exist");
  });

  it("should add a line if its the first line (right point first)", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("#left-0_right-0_line-editor").should("exist");
  });

  it("should add another line starting at the left point ", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    // Start first on the left
    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("svg").find(".line-container").should("have.length", 2);
    cy.get("#left-0_right-0_line-editor").should("exist");
    cy.get("#left-1_right-1_line-editor").should("exist");
  });

  it("should add another line starting at the right point ", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    // Start first on the right
    cy.get("button[id='add-line-right-1']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("svg").find(".line-container").should("have.length", 2);
    cy.get("#left-0_right-0_line-editor").should("exist");
    cy.get("#left-1_right-1_line-editor").should("exist");
  });

  it("should highlight the circles in the opposite site (left) after clicking on an item and remove the highlight after click", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();

    cy.get(".highlight-editor-left-circles").should("exist");
    cy.get("button[id^='add-line-left-']").should("have.css", "border-color", "rgb(122, 122, 245)");

    cy.get("button[id='add-line-left-1']").click();

    // Assert that the highlight went away
    cy.get(".highlight-editor-left-circles").should("not.exist");
    cy.get("button[id^='add-line-left-']").should("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should highlight the circles in the opposite site (right) after clicking on an item and clear the highlight after click", () => {
    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-0']").click();

    cy.get(".highlight-editor-right-circles").should("exist");

    cy.get("button[id^='add-line-right-']").should("have.css", "border-color", "rgb(122, 122, 245)");

    cy.get("button[id='add-line-right-1']").click();

    // Assert that the highlight went away
    cy.get(".highlight-editor-right-circles").should("not.exist");
    cy.get("button[id^='add-line-right-']").should("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should highlight the selected circle on click and remove highlight on click", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']")
      .click()
      .should("have.class", "editor-highlight-circle")
      .and("have.css", "border-color", "rgb(122, 122, 245)");

    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-0']")
      .should("not.have.class", "editor-highlight-circle")
      .and("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should remove the highlight from the opposite site if removing the selected item", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button#remove-element-right-0").click();

    cy.get(".highlight-editor-left-circles").should("not.exist");
    cy.get("button[id='add-line-left-0']").and("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should reset the highlightSelectedCircle on element remove", () => {
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-1']").click();

    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-1']")
      .should("not.have.class", "editor-highlight-circle")
      .and("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should show an error if there is no line on submit", () => {
    cy.get("input[name='id']").type("1");
    cy.get("button[aria-label='Add right element']").click();
    cy.get("button[aria-label='Add left element']").click();

    cy.get("textarea#textarea-left-0").type("1");
    cy.get("textarea#textarea-right-0").type("1");

    cy.contains("button", "Add").click();

    cy.contains("Add at least one line!").should("exist");

    // clear error if a line is added
    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.contains("Add at least one line!").should("not.exist");
  });

  it("should show an error if there is only one point of a single line on submit", () => {
    cy.get("input[name='id']").type("1");
    cy.get("button[aria-label='Add right element']").click();
    cy.get("button[aria-label='Add left element']").click();

    cy.get("textarea#textarea-left-0").type("1");
    cy.get("textarea#textarea-right-0").type("1");

    cy.get("button[id='add-line-right-0']").click();

    cy.contains("button", "Add").click();

    cy.contains("Add at least one line!").should("exist");

    // clear error if a line is added
    cy.get("button[id='add-line-left-0']").click();

    cy.contains("Add at least one line!").should("not.exist");
  });

  it("should filter out incomplete lines on submit", () => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.get("input[name='id']").type("filter-incomplete", { delay: 2 });

    cy.get("button[aria-label='Add right element']").click().click();
    cy.get("button[aria-label='Add left element']").click();

    cy.get("textarea#textarea-left-0").type("1", { delay: 2 });
    cy.get("textarea#textarea-right-0").type("1", { delay: 2 });
    cy.get("textarea#textarea-right-1").type("2", { delay: 2 });

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("button[id='add-line-right-1']").click();

    cy.contains("button", "Add")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"));

        const matches = (
          localStorageItem?.questions?.[localStorageItem?.questions?.length - 1].answerOptions as IExtendedMatch
        )?.correctMatches;

        expect(matches).to.deep.equal([
          {
            left: "left-0",
            right: "right-0",
          },
        ]);
      });
  });

  it("should not add duplicate line (left second point)", () => {
    cy.get("button[aria-label='Add right element']").click();
    cy.get("button[aria-label='Add left element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("g.line-container").should("have.length", 1);

    // Add new line
    cy.get("button[id='add-line-left-1']").click();
    cy.get("g.line-container").should("have.length", 1);

    cy.get("button[id='add-line-right-0']").click();
    cy.get("g.line-container").should("have.length", 2);
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y1", "61.5");
    cy.get("line#left-1_right-0_line-editor").should("have.attr", "y2", "18.5");
  });

  it("should not add duplicate line (right second point)", () => {
    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("g.line-container").should("have.length", 1);

    // Add new line
    cy.get("button[id='add-line-right-1']").click();
    cy.get("g.line-container").should("have.length", 1);

    cy.get("button[id='add-line-left-0']").click();
    cy.get("g.line-container").should("have.length", 2);

    cy.get("line#left-0_right-1_line-editor").should("have.attr", "y1", "18.5");
    cy.get("line#left-0_right-1_line-editor").should("have.attr", "y2", "61.5");
  });

  it("should not submit the question if using enter on the elements", () => {
    cy.get("button#add-left-element").click().realPress("Enter");
    cy.get("#textarea-left-1").type("{enter}");
    cy.realPress("Tab").realPress("Enter");
    cy.realPress(["Shift", "Tab"]).realPress(["Shift", "Tab"]).realPress("Enter");

    cy.get("button#add-right-element").click();

    cy.get("button#add-line-right-0").click();
    cy.get("button#add-line-left-0").click();

    cy.get("#left-0_right-0_circle").realPress("Enter");

    cy.realPress("Tab").realPress("Tab").realPress("Enter");

    cy.get("@handleModalCloseSpy").should("not.have.been.called");
  });

  it("should support editing with only keyboard events (tab+enter)", () => {
    cy.get(".editor-content ").click();
    cy.realPress("Tab");

    cy.realPress("Enter");

    // Assert that a new element was created
    cy.get("div[aria-label='Element left-0']").should("exist");

    // Add left point
    cy.realPress(["Shift", "Tab"]);
    cy.realPress("Enter");
    cy.get("button#add-line-left-0").should("have.class", "editor-highlight-circle");

    // Add right element
    cy.realPress("Tab").realPress("Tab");
    cy.realPress("Enter");

    cy.get(".editor-ext-match-right").should("have.class", "highlight-editor-right-circles");

    // Add right point to complete line
    cy.realPress(["Shift", "Tab"]).realPress(["Shift", "Tab"]).realPress(["Shift", "Tab"]);
    cy.realPress("Enter");
    cy.get("line#left-0_right-0_line-editor").should("exist");

    // remove line with enter
    cy.realPress(["Shift", "Tab"]);
    cy.realPress("Enter");
    cy.get("line#left-0_right-0_line-editor").should("not.exist");

    // remove element
    cy.realPress("Tab").realPress("Tab").realPress("Tab");
    cy.realPress("Enter");
    cy.get("button[aria-label='Remove element right-0']").should("not.exist");
  });
});
