/// <reference types="cypress" />

describe("Adding a question using the QuestionEditor component", () => {
  beforeEach(() => {
    cy.fixture("repeatio-module-cypress_1.json").then((value) => {
      localStorage.setItem("repeatio-module-cypress_1", JSON.stringify(value));
    });
    cy.visit("/module/cypress_1");
    cy.get("article[data-cy='Add Question']").contains("button", "Add").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();
  });

  it("should show modal when clicking on Add", () => {
    cy.contains("h1", "Add Question").should("be.visible");
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
    cy.get("textarea[name='title']").type(newQuestion.title).should("have.value", newQuestion.title);

    //Points
    cy.get("input[name='points']").type(newQuestion.points).should("have.value", newQuestion.points);

    //Help
    cy.get("textarea[name='help']").type(newQuestion.help).should("have.value", newQuestion.help);

    //Type
    cy.get("select[name='type']").select(newQuestion.type);

    newQuestion.answerOptions.forEach(() => {
      cy.get("button#editor-add-item").click();
    });

    //Add 3 new options
    // cy.get("button#editor-add-item").click().click().click();
    cy.get("div.MuiFormGroup-root").find("label.MuiFormControlLabel-root").should("have.length", 3);

    //Add text to the first item and check it
    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root")
      .first()
      .find("textarea")
      .not("[aria-hidden='true']")
      .type(newQuestion.answerOptions[0].text)
      .should("have.value", newQuestion.answerOptions[0].text);

    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root")
      .first()
      .find("input")
      .check()
      .should("be.checked");

    //Add text to second option
    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root[data-testid='option-1']")
      .find("textarea")
      .not("[aria-hidden='true']")
      .type(newQuestion.answerOptions[1].text)
      .should("have.value", newQuestion.answerOptions[1].text);

    //Add text to third option
    cy.get("div.MuiFormGroup-root")
      .find("label.MuiFormControlLabel-root")
      .last()
      .find("textarea")
      .not("[aria-hidden='true']")
      .type(newQuestion.answerOptions[2].text)
      .should("have.value", newQuestion.answerOptions[2].text);

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
    cy.get("textarea[name='title']").type("This question should be in the localStorage");
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
      .type("This is correct");

    cy.get("div.MuiFormGroup-root").find("label.MuiFormControlLabel-root").first().find("input").check();

    //Check if in localStorage
    cy.get(".ReactModal__Content")
      .contains("button", "Add")
      .click()
      .should(() => {
        const questions = JSON.parse(localStorage.getItem("repeatio-module-cypress_1")).questions;
        const addedQuestion = questions.find((question) => question.id === "ls-id-1");
        expect(addedQuestion.id).to.eq("ls-id-1");
        expect(addedQuestion.title).to.eq("This question should be in the localStorage");
        expect(addedQuestion.type).to.eq("multiple-choice");
        expect(addedQuestion.answerOptions[0].text).to.eq("This is correct");
        expect(addedQuestion.answerOptions[0].isCorrect).to.eq(true);
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
      .type("Textarea value for option-0");

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
      .type("Textarea value for option-0");

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
