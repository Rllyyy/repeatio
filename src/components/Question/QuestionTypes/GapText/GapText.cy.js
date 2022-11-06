/// <reference types="cypress" />
import { GapText } from "./GapText";
import "../../../../index.css";
import "../../Question.css";

describe("GapText", () => {
  it("should render 3 gap text elements", () => {
    const options = {
      text: "[] two **three**. One [] three. One two []",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 3);
    cy.contains("strong", "three").should("exist");
  });

  it("should render multiple gaps and display input", () => {
    const options = {
      text: "[][][]",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 3);

    cy.get("input").eq(1).type("two").should("have.value", "two");
    cy.get("input").last().type("three").should("have.value", "three");
    cy.get("input").first().type("One").should("have.value", "One");
  });

  it("should tab through inputs", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("body").tab().focused().type("One").should("have.value", "One");
    cy.get("input[value='One']").tab().focused().type("two").should("have.value", "two");
  });

  it("should render links instead of gaps", () => {
    const options = {
      text: "[]()This line should [not](www.google.com) include any links. []()\nBut this one can have a [].",
      correctGapValues: [["gap"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").should("have.length", 1);
    cy.get("a").should("have.length", 3);
  });

  it("should render image instead of gaps", () => {
    const options = {
      text: "![]() This line should have ![]() an image ![cypress](https://raw.githubusercontent.com/cypress-io/cypress/develop/assets/cypress-logo-light.png) and no gap!\n But this one should have a []",
      correctGapValues: [["gap"]],
    };

    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("input").should("have.length", 1);
    cy.get("img").should("have.length", 3);
    cy.get("img").last().invoke("height").should("be.greaterThan", 150);
  });

  it("should render table with a gap if there is text before", () => {
    const options = {
      text: "Text before\n| test | this |\n|------|------|\n| is   | []   |",
      correctGapValues: [["gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.contains("Text before").should("be.visible");
    cy.get("table").should("exist").and("be.visible");
    cy.get("input").should("exist").type("value").should("have.value", "value");
  });

  it("should render markdown table with a gap inside div with whitespace", () => {
    const options = {
      text: `This table<div style=" white-space: normal;">\n | test | this |\n|------|------|\n| is   | []   | \n </div>\n\n **Bold**`,
      correctGapValues: [["gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("table").should("exist").and("be.visible");
    cy.contains("strong", "Bold").should("exist");
    cy.get("input").should("exist").type("value").should("have.value", "value");
  });

  it("should render list with a gap and gap above list", () => {
    const options = {
      text: `[]\n - [] \n - there`,
      correctGapValues: [["List", "gap"]],
    };

    //needs parent because of css
    cy.mount(
      <div className='question-form'>
        <GapText options={options} formDisabled={false} />
      </div>
    );

    cy.get("input").should("have.length", 2);
    cy.get("li").should("have.length", 2);
    cy.contains("li", "there").should("exist");
  });

  it("should update the input elements on input change", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.get("input").first().type("One").should("have.value", "One");
    cy.get("input").eq(1).type("two").should("have.value", "two");
    cy.get("input").last().type("three").should("have.value", "three");
  });

  it("should disable inputs if disabled is passed from the parent", () => {
    const options = {
      text: "[] two three. One [] three. One two [].",
      correctGapValues: [["One"], ["two"], ["three"]],
    };

    cy.mount(<GapText options={options} formDisabled={true} />);

    cy.get("input").each(($el) => expect($el).to.be.disabled);
  });

  it("should render markdown element in first line", () => {
    const options = {
      text: "1. List [] \n 2. Another item",
      correctGapValues: [["item"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.get("ol").find("li").should("have.length", 2);
    cy.get("input").should("have.length", 1).and("be.visible");
  });

  it("should render markdown list if the first item is a gap", () => {
    const options = {
      text: "[]\n 1. List [] \n 2. Another item",
      correctGapValues: [["The List", "Item"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.contains("li", "List").should("exist");
    cy.get("input").should("have.length", 2);
  });

  //This might break if using a parser
  it("should continue formatting if gap is in-between", () => {
    const options = {
      text: `**This [] should be bold**`,
      correctGapValues: [["line"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);

    cy.contains("strong", "This").should("exist");
    cy.contains("strong", "should be bold").should("exist");

    cy.get("input").should("have.length", 1);
  });

  it("should support html elements at the beginning", () => {
    const options = {
      text: "<h1>Heading</h1>\n\n **Bold** \n [] [] Test []",
      correctGapValues: [["One"], ["Two"], ["."]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.contains("h1", "Heading").should("exist");
    cy.contains("strong", "Bold").should("exist");
    cy.get("input").should("have.length", 3);
  });

  it("should render markdown after gap", () => {
    const options = {
      text: "This is a:\n [] **test**",
      correctGapValues: [["new"]],
    };

    cy.mount(<GapText options={options} formDisabled={false} />);
    cy.contains("strong", "test");
    cy.get("input").should("exist");
  });
});
