/// <reference types="cypress" />

import { parseJSON } from "../../src/utils/parseJSON";

// Interfaces
import { IModule } from "../../src/components/module/module";
import { getBookmarkedLocalStorageItem } from "../../src/components/Question/components/Actions/BookmarkQuestion";
import { IQuestion } from "../../src/components/Question/useQuestion";
import { IGapText } from "../../src/components/Question/QuestionTypes/GapText/GapText";

// Test
describe("Updating a question using the Question editor", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.visit("/module/cypress_1");
    cy.get("article[data-cy='Practice'").contains("button", "Start").click();
    cy.get("button[aria-label='Edit Question']").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();
  });

  it("should show 'Edit Question' when clicking on the edit button and update for the form submit", () => {
    cy.contains("h1", "Edit Question").should("exist");
    cy.contains("button", "Update").should("exist");
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

    cy.get("textarea[name='title']").clear().type(updatedQuestion.title, { delay: 2 });
    cy.get("input[name='points']").clear().type(updatedQuestion.points.toString(), { delay: 2 });
    cy.get("textarea[name='help']").clear().type(updatedQuestion.help, { delay: 2 });
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
        .type(item.text, { delay: 2 });

      if (item.isCorrect) {
        cy.get("div.editor-content").find(`[data-testid='formControlLabel-${item.id}']`).find("input").check();
      }
    });

    //click on update
    cy.contains("button", "Update").click();

    cy.get("main").scrollIntoView();

    //Check that title, points, help and all answerOptions are in the document
    cy.contains(updatedQuestion.title).should("exist");
    cy.contains(updatedQuestion.points).should("exist");
    cy.contains(updatedQuestion.help).should("exist");

    updatedQuestion.answerOptions.forEach((item) => {
      cy.contains("p", item.text).should("exist");
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
    cy.contains("Yes, that's correct!").should("exist");
  });

  it("should update id (and url)", () => {
    cy.get("input[name='id']").clear().type("updated-id-1");

    cy.contains("button", "Update").click();

    cy.get("main").scrollIntoView();

    cy.contains("updated-id-1").should("be.visible");
    cy.url().should("include", "updated-id-1");
  });

  it("should show warning if updating a question to an existing id", () => {
    cy.get("input[name='id']").clear().type("qID-2");
    cy.contains("button", "Update").click();
    cy.contains("A question with this id already exists!").should("exist");
  });

  it("should update the localStorage of the module when changing the id", () => {
    cy.get("input[name='id']").clear().type("updated-id-1");

    cy.contains("button", "Update")
      .click()
      .should(() => {
        const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-cypress_1"))?.questions;

        //Create new array with just ids
        const ids = questions?.reduce(
          (acc, { id }) => {
            acc.push(id);
            return acc;
          },
          [] as Array<IQuestion["id"]>
        );

        expect(ids).to.include("updated-id-1").and.to.have.length(6);
      });
  });

  it("should update the bookmark localStorage item if the id changes", () => {
    //Setup localStorage bookmark item
    const newBookmarkLocalStorageItem = {
      id: "cypress_1",
      type: "marked",
      compatibility: "0.6.0",
      questions: ["qID-1", "qID-6"],
    };

    localStorage.setItem("repeatio-marked-cypress_1", JSON.stringify(newBookmarkLocalStorageItem, null, "\t"));

    cy.get("input[name='id']").clear().type("qID-10");
    cy.contains("button", "Update")
      .click()
      .should(() => {
        const bookmarkLocalStorageItem = getBookmarkedLocalStorageItem("cypress_1");
        expect(bookmarkLocalStorageItem?.id).to.equal("cypress_1");
        expect(bookmarkLocalStorageItem?.questions).to.deep.eq(["qID-10", "qID-6"]);
      });

    cy.get("button.bookmark-question-button").find("svg").should("have.class", "bookmark-remove");
  });
});

//Mode random
describe("Update question using mode random", () => {
  beforeEach(() => {
    cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");

    cy.visit("/module/cypress_1");
    cy.get("article[data-cy='Practice'").contains("button", "Random").click();
    cy.get("button[aria-label='Edit Question']").click();
    cy.get("div.ReactModal__Overlay").scrollIntoView();
  });

  it("should update a question using mode random", () => {
    // Update points to 50  (by adding 0 to the end of the input which already had 5 asa value)
    cy.get("input[name='points']").type("0");
    cy.contains("button", "Update").click();
    cy.contains("50 Points").should("exist");
  });
});

//Gap-Text
describe("Updating a question of type gap-text", () => {
  context("Use gap-text fixture", () => {
    beforeEach(() => {
      cy.fixtureToLocalStorage("repeatio-module-gap_text.json");
    });

    it("should show correct value when editing the question and update value", () => {
      cy.visit("/module/gap_text/question/gt-1?mode=practice&order=chronological");
      cy.get("button[aria-label='Edit Question']").click();
      cy.get("textarea#editor-gap-text-textarea")
        .should("have.text", "This is the [first] question")
        .and("have.value", "This is the [first] question")
        .setSelection("first")
        .type("updated");

      cy.contains("button", "Update")
        .click()
        .should(() => {
          const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-gap_text"))?.questions;
          const addedQuestion = questions?.find((question) => question.id === "gt-1");
          expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq("This is the [] question");

          const correctGapValues = [["updated"]];
          expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq(correctGapValues);
        });

      cy.get("section.question-user-response").find("input").type("updated");
      cy.get("body").click();
      cy.get("button[type='submit']").click();
      cy.contains("p", "Yes, that's correct!").should("exist");
      cy.contains("This is the updated question").should("exist");
    });

    it("should show correct textarea value if gap text contains multiple gaps and multiple correct values", () => {
      cy.visit("/module/gap_text/question/gt-3?mode=practice&order=chronological");
      cy.get("button[aria-label='Edit Question']").click();

      cy.get("textarea#editor-gap-text-textarea")
        .scrollIntoView()
        .should(
          "have.value",
          "This is the [third] question. It [contains] multiple gaps. Even gaps that have more than [one; 1] correct answer."
        )
        .setSelection("[contains]")
        .type("[contains; includes]", { force: true });

      //Update
      cy.contains("button", "Update")
        .click({ force: true })
        .should(() => {
          const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-gap_text"))?.questions;
          const addedQuestion = questions?.find((question) => question.id === "gt-3");
          expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
            "This is the [] question. It [] multiple gaps. Even gaps that have more than [] correct answer."
          );

          const correctGapValues = [["third"], ["contains", "includes"], ["one", "1"]];
          expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq(correctGapValues);
        });
    });

    it("should remove gap from gap-text", () => {
      cy.visit("/module/gap_text/question/gt-3?mode=practice&order=chronological");
      cy.get("button[aria-label='Edit Question'").click();

      cy.get("textarea#editor-gap-text-textarea").setSelection("[contains]").type("{del}").type("{del}");

      cy.contains("button", "Update")
        .click()
        .should(() => {
          const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-gap_text"))?.questions;
          const addedQuestion = questions?.find((question) => question.id === "gt-3");
          expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
            "This is the [] question. It multiple gaps. Even gaps that have more than [] correct answer."
          );

          const correctGapValues = [["third"], ["one", "1"]];
          expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq(correctGapValues);
        });
    });

    it("should load and update the correct gap-text to edit", () => {
      cy.visit("/module/gap_text/question/gt-2?mode=practice&order=chronological");

      cy.get("button[aria-label='Navigate to next Question'").click();
      cy.get("button[aria-label='Edit Question'").click();
      cy.get("div.ReactModal__Overlay").scrollIntoView();

      cy.get("textarea#editor-gap-text-textarea")
        .should(
          "have.value",
          "This is the [third] question. It [contains] multiple gaps. Even gaps that have more than [one; 1] correct answer."
        )
        .setSelection("[contains]")
        .type("[contains; includes]");

      cy.contains("button", "Update")
        .click()
        .should(() => {
          const questions = parseJSON<IModule>(localStorage.getItem("repeatio-module-gap_text"))?.questions;
          const addedQuestion = questions?.find((question) => question.id === "gt-3");
          expect((addedQuestion?.answerOptions as IGapText)?.text).to.eq(
            "This is the [] question. It [] multiple gaps. Even gaps that have more than [] correct answer."
          );

          const correctGapValues = [["third"], ["contains", "includes"], ["one", "1"]];
          expect((addedQuestion?.answerOptions as IGapText)?.correctGapValues).to.deep.eq(correctGapValues);
        });
    });
  });
});
