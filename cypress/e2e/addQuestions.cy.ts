/// <reference types="cypress" />

import { IModule } from "../../src/components/module/module";
import { IGapText } from "../../src/components/Question/QuestionTypes/GapText/GapText";
import { IMultipleChoice } from "../../src/components/Question/QuestionTypes/MultipleChoice/MultipleChoice";
import { parseJSON } from "../../src/utils/parseJSON";

describe("Adding a question using the QuestionEditor component", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.visit("/module/cypress_1");
    cy.get("article[data-cy='Add Question']").contains("button", "Add").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();
  });

  it("should show modal when clicking on Add", () => {
    cy.contains("h1", "Add Question").should("be.visible");
  });

  it("should show the modal on small desktop screens in view when clicking on Add", () => {
    cy.viewport(800, 400);

    cy.contains("h1", "Add Question").should("be.visible");
    cy.get("label[for='modal-question-id-input']").should("be.visible");

    cy.get("div.ReactModal__Content--after-open").invoke("height").should("eq", 360);
  });

  it("should fill the height of the parent on big screens", () => {
    cy.viewport(800, 1200);

    cy.contains("h1", "Add Question").should("be.visible");
    cy.get("div.ReactModal__Content--after-open").invoke("height").should("eq", 1080);
  });

  it("should show the modal on mobile phones", () => {
    cy.viewport(600, 500);

    cy.contains("h1", "Add Question").should("be.visible");

    // Assert the first label to be in view
    cy.get("label[for='modal-question-id-input']").should("be.visible");

    // Assert the height of the modal
    cy.get("div.ReactModal__Content--after-open").invoke("height").should("eq", 432);
  });

  it("should close the modal if clicking on the close button of the modal", () => {
    cy.get("button.modal-close-btn").click();

    // Assert that be modal doesn't exist anymore
    cy.get("div.ReactModal__Content--after-open").should("not.exist");
  });

  it("should add new Question", () => {
    const newQuestion = {
      id: "qID-7",
      title: "This question was added with cypress",
      points: 5,
      help: "This help is provided with cypress",
      type: "Multiple Choice",
      answerOptions: [
        {
          text: "This answer is correct",
          isCorrect: true,
        },
        {
          text: "This answer is false",
          isCorrect: false,
        },
        {
          text: "This answer is also false",
          isCorrect: false,
        },
      ],
    };

    //ID
    cy.get("input[name='id']").type(newQuestion.id).should("have.value", newQuestion.id);

    //Title
    cy.get("textarea[name='title']").type(newQuestion.title, { delay: 2 }).should("have.value", newQuestion.title);

    //Points
    cy.get("input[name='points']").type(newQuestion.points.toString()).should("have.value", newQuestion.points);

    //Help
    cy.get("textarea[name='help']").type(newQuestion.help, { delay: 2 }).should("have.value", newQuestion.help);

    //Type
    cy.get("select[name='type']").select(newQuestion.type);

    //Add 3 new options
    newQuestion.answerOptions.forEach(() => {
      cy.get("button#editor-add-item").click();
    });

    cy.get("div.MuiFormGroup-root").find("label.MuiFormControlLabel-root").should("have.length", 3);

    //Add the three answer options
    newQuestion.answerOptions.forEach((option, index) => {
      cy.get("div.MuiFormGroup-root")
        .find(`label.MuiFormControlLabel-root[data-testid='option-${index}']`)
        .find("textarea")
        .not("[aria-hidden='true']")
        .type(option.text, { delay: 2 })
        .should("have.value", option.text);
    });

    //Check first option
    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root")
      .first()
      .find("input")
      .check()
      .should("be.checked");

    //Click add button
    cy.get(".ReactModal__Content").contains("button", "Add").click();

    //Navigate to correct question by using to last button after clicking start
    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.get("button[aria-label='Navigate to last Question'").click();

    //Check that id, title, points and help are in the document
    Object.values(newQuestion).forEach((item) => {
      //Ignore answerOptions (array) and don't look for the text Multiple choice
      if (!Array.isArray(item) && item !== "Multiple Choice") {
        cy.contains(item);
      }
    });

    //Check answerOptions item and question type (by using type radio)
    newQuestion.answerOptions.forEach((item) => {
      cy.contains(item.text);
    });
    cy.get("input[type='radio']").should("have.length", 3);

    //Select answer and check
    cy.contains("This answer is correct").click();
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("be.visible");
  });

  it("should add new Question to localStorage", () => {
    //ID
    cy.get("input[name='id'").type("ls-id-1");
    //Title
    cy.get("textarea[name='title']").type("This question should be in the localStorage", { delay: 2 });
    //Type
    cy.get("select[name='type']").select("multiple-choice");

    //Add multiple choice item
    cy.get("button#editor-add-item").click();

    //Add text to the first item and check it
    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root")
      .first()
      .find("textarea")
      .not("[aria-hidden='true']")
      .type("This is correct", { delay: 2 });

    cy.get("div.MuiFormGroup-root").find("label.MuiFormControlLabel-root").first().find("input").check();

    //Check if in localStorage
    cy.get(".ReactModal__Content")
      .contains("button", "Add")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"))?.questions;
        const addedQuestion = questions?.find((question) => question.id === "ls-id-1");
        expect(addedQuestion?.id).to.eq("ls-id-1");
        expect(addedQuestion?.title).to.eq("This question should be in the localStorage");
        expect(addedQuestion?.type).to.eq("multiple-choice");
        expect((addedQuestion?.answerOptions as IMultipleChoice[])[0].text).to.eq("This is correct");
        expect((addedQuestion?.answerOptions as IMultipleChoice[])[0].isCorrect).to.eq(true);
      });
  });

  it("should show error in form if the id already exists", () => {
    cy.get("input[name='id']").type("qID-1");
    cy.get("select[name='type']").select("multiple-choice");
    cy.get("button#editor-add-item").click();
    cy.get(".editor-content").find("input[type='radio']").click();
    cy.get(".editor-content")
      .find("label[data-testid='option-0']")
      .find("textarea")
      .first()
      .type("Textarea value for option-0", { delay: 2 });

    cy.get("form button[type='submit']").click();

    cy.contains("A question with this id already exists!").should("exist");
    //Expect the submit button to not work
    cy.get("button[type='submit']").should("have.attr", "aria-disabled", "true").click();

    //Visit link in error message
    cy.contains("a", "View: qID-1").click();
    cy.url().should("include", "question/qID-1");
  });

  it("should clear existing id error if changing it", () => {
    cy.get("input[name='id']").type("qID-1");
    cy.get("select[name='type']").select("multiple-choice");

    cy.get("button#editor-add-item").click();
    cy.get(".editor-content").find("input[type='radio']").click();
    cy.get(".editor-content")
      .find("label[data-testid='option-0']")
      .find("textarea")
      .first()
      .type("Textarea value for option-0", { delay: 2 });

    cy.get("form button[type='submit']").click();

    cy.contains("A question with this id already exists!").should("exist");
    cy.get("input[name='id']").clear().type("new-id");
    cy.contains("A question with this id already exists!").should("not.exist");
    cy.get("button[type='submit']").should("have.attr", "aria-disabled", "false").click();

    //Visit new Question
    cy.get("article[data-cy='Practice']").contains("button", "Start").click();
    cy.get("button[aria-label='Navigate to last Question']").click();
    cy.contains("ID: new-id");

    cy.contains("Textarea value for option-0").click();
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!");
  });
});

describe("Adding a question of type gap-text", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-empty-questions.json");

    cy.visit("/module/empty-questions");
    cy.contains("button", "Add").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();

    cy.get("input[name='id']").type("test-id");
    cy.get("select[name='type']").select("gap-text");
  });

  it("should add gap text with one gap", () => {
    cy.get("textarea#editor-gap-text-textarea").type("This is a simple [test]");
    cy.get("button[type='submit']").click();

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("section.question-user-response").find("input").type("test");
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
  });

  it("should add gap-text with multiple gaps", () => {
    cy.get("textarea#editor-gap-text-textarea").type("[This] is a [complex] [test]", { force: true });
    cy.get("button[type='submit']").click();

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("section.question-user-response").find("input").first().type("This");
    cy.get("section.question-user-response").find("input").eq(1).type("complex");
    cy.get("section.question-user-response").find("input").last().type("test");
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
  });

  it("should add gap-text with multiple correct values for one gap", () => {
    cy.get("textarea#editor-gap-text-textarea").type("This text supports [multiple; more than one] correct values");
    cy.get("button[type='submit']").click();

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("section.question-user-response").find("input").type("more than one");
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
    cy.contains("This text supports multiple; more than one correct values").should("exist");

    cy.get("button[aria-label='Retry Question']").click();
    cy.get("section.question-user-response").find("input").type("multiple");
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
  });

  it("should add gap-text with multiple correct values for one gap even if not using blanks", () => {
    cy.get("textarea#editor-gap-text-textarea").type("This text supports[multiple;more than one]correct values", {
      force: true,
    });
    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-empty-questions"))?.questions;
        const addedQuestion = questions?.find((question) => question.id === "test-id");
        expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq("This text supports[]correct values");

        const correctGapValues = [["multiple", "more than one"]];
        expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq(correctGapValues);
      });
  });

  it("should save multiline gap text", () => {
    cy.get("textarea#editor-gap-text-textarea").type("This text is [split] into{enter}two[lines]");
    cy.get("button[type='submit']").click();

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("div.question-gap-text").invoke("height").should("be.greaterThan", 45);
    cy.get("section.question-user-response").find("input").should("have.length", 2);
  });

  it("should create markdown table wrapped in a div", () => {
    cy.get("textarea#editor-gap-text-textarea").type(
      "<div style='white-space: normal'>{enter}{enter}| Tables   |      Are      |  [nice] |{enter}|----------|:-------------:|------:|{enter}| col 1 is |  left-aligned | $1600 |{enter}{enter}</div>",
      { delay: 2 }
    );
    cy.get("button[type='submit']").click();

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("table").should("exist").and("be.visible");
  });

  it("should not interpreted markdown links as gaps", () => {
    cy.get("textarea#editor-gap-text-textarea").type(
      `[This] is a [link](https://github.com/Rllyyy/repeatio) and here is a [gap; hole] with [another link](www.github.com)`,
      { delay: 2 }
    );

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-empty-questions"))?.questions;
        const addedQuestion = questions?.find((question: { id: string }) => question.id === "test-id");
        expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
          "[] is a [link](https://github.com/Rllyyy/repeatio) and here is a [] with [another link](www.github.com)"
        );

        expect((addedQuestion?.answerOptions as IGapText).correctGapValues).to.deep.eq([["This"], ["gap", "hole"]]);
      });

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.contains("a", "link").should("exist");
    cy.contains("a", "another link").should("exist");
    cy.get("section.question-user-response").find("input").first().type("This");
    cy.get("section.question-user-response").find("input").last().type("gap");

    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("exist");
    cy.get("span.correct-gap-value").first().should("have.text", "This");
    cy.get("span.correct-gap-value").last().should("have.text", "gap; hole");
    cy.get(".question-correction").contains("a", "link").should("exist");
    cy.get(".question-correction").contains("a", "another link").should("exist");
  });

  it("should not interpreted markdown images as gaps", () => {
    cy.get("textarea#editor-gap-text-textarea").type(
      "This is an image: ![icon](https://raw.githubusercontent.com/Rllyyy/repeatio/main/public/icon.ico) and here is a [gap; hole].",
      {
        delay: 2,
      }
    );

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-empty-questions"))?.questions;
        const addedQuestion = questions?.find((question: { id: string }) => question.id === "test-id");
        expect((addedQuestion?.answerOptions as IGapText).text).to.eq(
          "This is an image: ![icon](https://raw.githubusercontent.com/Rllyyy/repeatio/main/public/icon.ico) and here is a []."
        );

        expect((addedQuestion?.answerOptions as IGapText).correctGapValues).to.deep.eq([["gap", "hole"]]);
      });

    cy.visit("/module/empty-questions/question/test-id?mode=practice&order=chronological");
    cy.get("img").invoke("height").should("equal", 256);
    cy.get("section.question-user-response").find("input").should("have.length", 1);
  });

  it("should replace double quotes only outside of html tags in gap-text text", () => {
    cy.get("textarea#editor-gap-text-textarea").type(
      `Here is a "quote"\nBut quotes inside html should work <p style="color: green">fine</p>.\nBut there is no need to replace quotes inside ["gaps"]`,
      { delay: 2 }
    );

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-empty-questions"))?.questions;
        const addedQuestion = questions?.find((question: { id: string }) => question.id === "test-id");
        expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
          `Here is a „quote“\nBut quotes inside html should work <p style="color: green">fine</p>.\nBut there is no need to replace quotes inside []`
        );

        expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq([[`"gaps"`]]);
      });
  });

  it("should replace apostrophe with ‘ that are outside of html", () => {
    cy.get("textarea#editor-gap-text-textarea").type(
      `Here is a 'apostrophe' that should be replaced. But apostrophe inside html is <p style='color: green'>fine</p>. But there is no need to replace quotes inside ['apostrophe']`,
      { delay: 2 }
    );

    cy.get("button[type='submit']")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-empty-questions"))?.questions;
        const addedQuestion = questions?.find((question: { id: string }) => question.id === "test-id");
        expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
          `Here is a ‘apostrophe‘ that should be replaced. But apostrophe inside html is <p style='color: green'>fine</p>. But there is no need to replace quotes inside []`
        );

        expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq([[`'apostrophe'`]]);
      });
  });
});

export {};
