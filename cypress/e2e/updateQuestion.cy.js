describe("Updating a Question using the Question editor", () => {
  beforeEach(() => {
    cy.fixture("repeatio-module-cypress_1.json").then((value) => {
      localStorage.setItem("repeatio-module-cypress_1", JSON.stringify(value));
    });
    cy.visit("/module/cypress_1");
    cy.get("article[data-cy='Practice'").contains("button", "Start").click();
    cy.get("button[aria-label='Edit Question']").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();
  });

  it("should show 'Edit Question' when clicking on the edit button", () => {
    cy.contains("h1", "Edit Question");
  });

  it("should have the values as inputs from the question", () => {
    //ID
    cy.get("input[name='id']").should("have.value", "qID-1");

    //Title
    cy.get("textarea[name='title']").should(
      "have.value",
      "This question is of the type Multiple-Choice. Exactly _**one**_ correct answer must be selected. A circle in front of each option can help to identify this kind of question. How many options can be correct?"
    );

    //Points
    cy.get("input[name='points']").should("have.value", "5");

    //Help
    cy.get("textarea[name='help']").should("have.value", "Please choose the correct answer.");

    //Type
    cy.get("select").should("have.value", "multiple-choice");

    cy.get("div.editor-content").scrollIntoView();

    //Check if radios and the text are correct
    cy.get("div.editor-content").find("input[type='radio']").should("have.length", 4);
    cy.get("div.editor-content").find("textarea").not("[aria-hidden='true']").should("have.length", 4);
    cy.get("label[data-testid='option-3']").find("input").should("be.checked");
  });

  it("should update the question when changing the title, points, help, type and answerOptions ", () => {
    //Define new Question ()
    const updatedQuestion = {
      title: "This question was updated with cypress",
      points: 10,
      help: "The help field was updated with cypress",
      type: "multiple-response",
      answerOptions: [
        {
          id: "option-0",
          text: "This answer is correct",
          isCorrect: true,
        },
        {
          id: "option-1",
          text: "This answer is false",
          isCorrect: false,
        },
        {
          id: "option-2",
          text: "This answer is also correct",
          isCorrect: true,
        },
      ],
    };

    cy.get("textarea[name='title']").clear().type(updatedQuestion.title);
    cy.get("input[name='points']").clear().type(updatedQuestion.points);
    cy.get("textarea[name='help']").clear().type(updatedQuestion.help);
    cy.get("select[name='type']").select(updatedQuestion.type);

    updatedQuestion.answerOptions.forEach(() => {
      cy.get("button#editor-add-item").click();
    });

    updatedQuestion.answerOptions.forEach((item) => {
      //Update text
      cy.get("div.editor-content")
        .find(`[data-testid='formControlLabel-${item.id}']`)
        .find("textarea")
        .not("[aria-hidden = 'true']")
        .type(item.text);

      if (item.isCorrect) {
        cy.get("div.editor-content").find(`[data-testid='formControlLabel-${item.id}']`).find("input").check();
      }
    });

    //click on update
    cy.contains("button", "Update").click();

    cy.get("main").scrollIntoView();

    //Check that title, points, help and all answerOptions are in the document
    cy.contains(updatedQuestion.title).should("be.visible");
    cy.contains(updatedQuestion.points).should("be.visible");
    cy.contains(updatedQuestion.help).should("be.visible");

    updatedQuestion.answerOptions.forEach((item) => {
      cy.contains("p", item.text).should("be.visible");
    });

    cy.get("input[type='checkbox']").should("have.length", updatedQuestion.answerOptions.length);

    //check the correct answers
    updatedQuestion.answerOptions.forEach((item) => {
      if (item.isCorrect) {
        cy.get("section.question-user-response").contains(item.text).click();
      }
    });

    //Submit question
    cy.get("button[type='submit']").click();
    cy.contains("Yes, that's correct!").should("be.visible");
  });

  it("should update id (and url)", () => {
    cy.get("input[name='id']").clear().type("updated-id-1");

    cy.contains("button", "Update").click();

    cy.get("main").scrollIntoView();

    cy.contains("updated-id-1").should("be.visible");
    cy.url().should("include", "updated-id-1");
  });

  it("should update the localStorage when changing the id", () => {
    cy.get("input[name='id']").clear().type("updated-id-1");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const questions = JSON.parse(localStorage.getItem("repeatio-module-cypress_1")).questions;
        const updatedQuestion = questions.find((question) => question.id === "updated-id-1");
        expect(updatedQuestion.id).to.eq("updated-id-1");
      });
  });
});
