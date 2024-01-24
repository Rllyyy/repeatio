/// <reference types="cypress" />
import { Tutorials } from ".";
import { TSettings } from "../../hooks/useSetting";

import "../../index.css";
import { parseJSON } from "../../utils/parseJSON";

describe("<Tutorials />", () => {
  it("should show the YouTube consent info", () => {
    cy.mount(<Tutorials />);
    cy.contains("h3", "Activate external Media").should("exist");
    cy.get("iframe[title='YouTube video player'").should("not.exist");
  });

  it("should update the localStorage if clicking on 'I understand'", () => {
    cy.mount(<Tutorials />);

    cy.contains("button", "I understand")
      .click()
      .should(() => {
        const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));
        //const localStorageItem = JSON.parse(localStorage.getItem("youtube-consent") as string);
        expect(settings?.embedYoutubeVideos).to.equal(true);
      });

    cy.get("iframe[title='YouTube video player'").should("exist");
  });

  it("should not show the 'Activate external Media' info if the consent has been given", () => {
    cy.fixtureToLocalStorage("repeatio-settings.json");

    cy.mount(<Tutorials />);

    cy.contains("h3", "Activate external Media").should("not.exist");
    cy.get("iframe[title='YouTube video player'").should("exist");
  });

  it("should show the 'Activate external Media' info if the consent has not been given", () => {
    localStorage.setItem("repeatio-settings", JSON.stringify({ embedYoutubeVideos: false }));

    cy.mount(<Tutorials />);

    cy.contains("h3", "Activate external Media").should("exist");
    cy.get("iframe[title='YouTube video player'").should("not.exist");
  });

  it("should keep the I understand button in view on mobile devices", () => {
    cy.mount(<Tutorials />);

    cy.contains("button", "I understand").should("be.visible");

    cy.get("form").parent().invoke("outerHeight").should("be.greaterThan", 390);
  });

  it("should use the 16 / 9 ratio on bigger screens", () => {
    cy.viewport(800, 800);
    cy.mount(<Tutorials />);

    cy.get("form").parent().invoke("outerHeight").should("be.greaterThan", 430);
  });
});
