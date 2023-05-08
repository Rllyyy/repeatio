/// <reference types="cypress" />

import { ExtendedMatchEditor } from "./ExtendedMatchEditor";

//Css
import "../../../../index.css";
import "../../QuestionEditor.css";
import "../AnswerOptionsEditor.css";

//Mocha / Chai for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
//declare const expect: Chai.ExpectStatic;

const MockExtendedMatchEditor = () => {
  return (
    <div className='question-editor-form' style={{ padding: 10 }}>
      <ExtendedMatchEditor />
    </div>
  );
};

describe("ExtendedMatchEditor", () => {
  it("should render empty component with two add buttons", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add right element']").should("exist");
    cy.get("button[aria-label='Add left element']").should("exist");
  });

  it("should add elements when clicking on the add element button", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("div[aria-label='Element left-0']").should("exist");

    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("div[aria-label='Element right-0']").should("exist");
    cy.get("div[aria-label='Element right-1']").should("exist");
  });

  it("should keep the width of the add element buttons", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button#add-left-element").should("have.css", "width", "175.71875px");
    cy.get("button#add-right-element").should("have.css", "width", "175.71875px").click();

    cy.get("button#add-right-element").should("have.css", "width", "175.71875px");
    cy.get("button#add-left-element").should("have.css", "width", "175.71875px").click();

    cy.get("button#add-right-element").should("have.css", "width", "175.71875px");
    cy.get("button#add-left-element").should("have.css", "width", "175.71875px");

    cy.get("textarea#textarea-left-0")
      .type("Although this is a lot of text, the width should stay the same", {
        delay: 2,
      })
      .invoke("outerHeight")
      .should("be.greaterThan", 115);

    cy.get("button#add-right-element").should("have.css", "width", "175.71875px");
    cy.get("button#add-left-element").should("have.css", "width", "175.71875px");

    cy.get("button[aria-label='Remove element right-0']").click();
    cy.get("button#add-right-element").should("have.css", "width", "175.71875px");

    cy.get("button[aria-label='Remove element left-0']").click();
    cy.get("button#add-left-element").should("have.css", "width", "175.71875px");
  });

  it("should remove an element", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Remove element left-0'").click();

    cy.get("div[aria-label='Element left-0'").should("not.exist");
  });

  it("should remove the correct element", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Remove element left-1'").click();

    cy.get("div[aria-label='Element left-0'").should("exist");
    cy.get("div[aria-label='Element left-1'").should("not.exist");
    cy.get("div[aria-label='Element left-2'").should("exist");
  });

  it("should use the correct id if adding an element after removing another element", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add right element']").click().click();

    // Remove element
    cy.get("button[aria-label='Remove element right-0'").click();
    // Add new element
    cy.get("button[aria-label='Add right element']").click();

    cy.get("div[aria-label='Element right-0'").should("exist");
    cy.get("div[aria-label^='Element right-']").should("have.length", 2);
  });

  it("should write into the textarea inside an element", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add right element']").click();

    cy.get("textarea[id='textarea-right-0']").type("First element").should("have.value", "First element");
  });

  it("add a line between two elements", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("g#left-0_right-0").should("exist");

    cy.get("g.line-container").should("have.length", 1);

    // Assert line position
    cy.get("line#left-0_right-0_line").should("have.attr", "x1", "0");
    cy.get("line#left-0_right-0_line").should("have.attr", "y1", "18.5");

    cy.get("line#left-0_right-0_line").should("have.attr", "x2", "68.578125");
    cy.get("line#left-0_right-0_line").should("have.attr", "y2", "18.5");
  });

  it("should add a diagonal line between two elements", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("g.line-container").should("have.length", 1);

    cy.get("line#left-1_right-0_line").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line").should("have.attr", "x2", "68.578125");
    cy.get("line#left-1_right-0_line").should("have.attr", "y2", "18.5");
  });

  it("should add multiple lines", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get(".line-container").should("have.length", 2);

    cy.get("line#left-0_right-0_line").should("have.attr", "y1", "18.5");
    cy.get("line#left-0_right-0_line").should("have.attr", "y2", "18.5");

    cy.get("line#left-1_right-0_line").should("have.attr", "y1", "61.5");
    cy.get("line#left-1_right-0_line").should("have.attr", "y2", "18.5");
  });

  it("should only add one line if clicking one side twice", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get(".line-container").should("have.length", 1);

    cy.get("line#left-1_right-0_line").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line").should("have.attr", "x2", "68.578125");
    cy.get("line#left-1_right-0_line").should("have.attr", "y2", "18.5");
  });

  it("should not create a line if the user just clicked on one element", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get(".line-container").should("not.exist");
  });

  it("should update the line position when adding a new  line in the textarea", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("textarea[id='textarea-right-0']")
      .type("This is a {enter}Text", { delay: 2 })
      .invoke("outerHeight")
      .should("be.greaterThan", 60);

    cy.get("line#left-1_right-0_line").should("have.attr", "x1", "0");
    cy.get("line#left-1_right-0_line").should("have.attr", "y1", "61.5");

    cy.get("line#left-1_right-0_line").should("have.attr", "x2", "68.578125");
    cy.get("line#left-1_right-0_line").should("have.attr", "y2", "32");
  });

  it("should update the line position when removing an item", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-0']").click();

    cy.get("line#left-2_right-1_line").should("have.attr", "x1", "0");
    cy.get("line#left-2_right-1_line").should("have.attr", "y1", "104.5");

    cy.get("line#left-2_right-1_line").should("have.attr", "x2", "68.578125");
    cy.get("line#left-2_right-1_line").should("have.attr", "y2", "18.5");
  });

  it("should update the line position when the element above increases its height", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-1']").click();
    cy.get("button[id='add-line-left-2']").click();

    cy.get("textarea[id='textarea-right-0']").type("{enter}");

    cy.get("line#left-2_right-1_line")
      .should("have.attr", "x1", "0")
      .and("have.attr", "y1", "104.5")
      .and("have.attr", "x2", "68.578125")
      .and("have.attr", "y2", "88.5");
  });

  it("should update the line position if the viewport width changes", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.viewport(800, 500);

    cy.get("line#left-1_right-0_line").should("have.attr", "x2", "111.421875").and("have.attr", "y2", "18.5");

    cy.get("line#left-0_right-0_line").should("have.attr", "x2", "111.421875").and("have.attr", "y2", "18.5");
  });

  it("should remove the correct line", () => {
    cy.mount(<MockExtendedMatchEditor />);

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
    cy.get("line#left-0_right-0_line").should("not.exist");
    cy.get("line#left-1_right-0_line").should("exist");
    cy.get("line#left-2_right-1_line").should("exist");
  });

  it("should remove the lines related to an element if it gets removed", () => {
    cy.mount(<MockExtendedMatchEditor />);

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
    cy.get("line#left-0_right-0_line").should("not.exist");
    cy.get("line#left-1_right-0_line").should("not.exist");
    cy.get("line#left-2_right-1_line").should("exist");
  });

  it("should grow the textarea if keys exceed on line", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("textarea[id='textarea-right-0']")
      .type("Wrap to next line !!!", { delay: 2 })
      .invoke("outerHeight")
      .should("be.greaterThan", 60);
  });

  it("should center remove line circle", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("circle").should("have.attr", "cx", "34.2890625").and("have.attr", "cy", "40");
  });

  it("should center remove line circle after another element is removed", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-left-2']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-0']").click();

    cy.get("circle").should("have.attr", "cx", "34.2890625").and("have.attr", "cy", "61.5");
  });

  it("should add a line if its the first line (left point first)", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-left-0']").click();
    cy.get("button[id='add-line-right-0']").click();

    cy.get("#left-0_right-0_line").should("exist");
  });

  it("should add a line if its the first line (right point first)", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    cy.get("#left-0_right-0_line").should("exist");
  });

  it("should add another line starting at the left point ", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    // Start first on the left
    cy.get("button[id='add-line-left-1']").click();
    cy.get("button[id='add-line-right-1']").click();

    cy.get("svg").find(".line-container").should("have.length", 2);
    cy.get("#left-0_right-0_line").should("exist");
    cy.get("#left-1_right-1_line").should("exist");
  });

  it("should add another line starting at the right point ", () => {
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click().click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button[id='add-line-left-0']").click();

    // Start first on the right
    cy.get("button[id='add-line-right-1']").click();
    cy.get("button[id='add-line-left-1']").click();

    cy.get("svg").find(".line-container").should("have.length", 2);
    cy.get("#left-0_right-0_line").should("exist");
    cy.get("#left-1_right-1_line").should("exist");
  });

  it("should highlight the circles in the opposite site (left) after clicking on an item and remove the highlight after click", () => {
    cy.mount(<MockExtendedMatchEditor />);

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
    cy.mount(<MockExtendedMatchEditor />);

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
    cy.mount(<MockExtendedMatchEditor />);

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
    cy.mount(<MockExtendedMatchEditor />);

    cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-0']").click();
    cy.get("button#remove-btn-right-0").click();

    cy.get(".highlight-editor-left-circles").should("not.exist");
    cy.get("button[id='add-line-left-0']").and("have.css", "border-color", "rgb(150, 150, 150)");
  });

  it("should reset the highlightSelectedCircle on element remove", () => {
    cy.mount(<MockExtendedMatchEditor />);

    //cy.get("button[aria-label='Add left element']").click();
    cy.get("button[aria-label='Add right element']").click().click();

    cy.get("button[id='add-line-right-1']").click();

    cy.get("button[aria-label='Remove element right-1']").click();

    cy.get("button[aria-label='Add right element']").click();

    cy.get("button[id='add-line-right-1']")
      .should("not.have.class", "editor-highlight-circle")
      .and("have.css", "border-color", "rgb(150, 150, 150)");
  });
});

// In form not submit on enter (all elements)
