/// <reference types="cypress" />
import { TSettings } from "@hooks/useSetting";
import "../../../index.css";

import { ComponentWithTooltip } from "./index";

const Component = () => {
  return (
    <main>
      <ComponentWithTooltip id='test' tooltipText='test' childClassName='inline-block'>
        <button aria-label='Test Button'>Hello</button>
      </ComponentWithTooltip>
    </main>
  );
};

describe("ComponentWithTooltip", () => {
  it("should show the tooltip if the user has no settings", () => {
    cy.mount(<Component />);

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Test Button']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("test").should("exist");
  });

  it("should show the tooltip if the user has showTooltips enabled", () => {
    cy.fixtureToLocalStorage("repeatio-settings.json");
    cy.mount(<Component />);

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Test Button']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("test").should("exist");
  });

  it("should show the tooltip if if the user has not set showTooltip in settings ", () => {
    const settings: TSettings = {
      expanded: true,
      moduleSort: "ID (ascending)",
    };

    localStorage.setItem("repeatio-settings", JSON.stringify(settings));

    cy.mount(<Component />);

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Test Button']").realHover();

    // Assert that the tooltip is visible
    cy.get(".react-tooltip").should("be.visible");
    cy.contains("test").should("exist");
  });

  it("should not show the tooltip if the user has the setting disabled", () => {
    const settings: TSettings = {
      expanded: true,
      moduleSort: "ID (ascending)",
      showTooltips: false,
    };

    localStorage.setItem("repeatio-settings", JSON.stringify(settings));

    cy.mount(<Component />);

    cy.get("body").realClick();

    // Hoover over the delete button
    cy.get("button[aria-label='Test Button']").realHover();

    // Assert that the tooltip is not visible
    cy.contains("test").should("not.exist");
  });
});
