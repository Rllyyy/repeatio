/// <reference types="cypress" />

import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./Sidebar";

import { parseJSON } from "../../utils/parseJSON";
import { ISettings } from "../../hooks/useSetting";

import "../../index.css";

declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

const MockSidebarWithRouter = () => {
  return (
    <div id='root'>
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    </div>
  );
};

describe("<Sidebar />", () => {
  it("should display the categories on click on mobile", () => {
    cy.mount(<MockSidebarWithRouter />);
    cy.get("button.hamburger").click();
    cy.contains("a", "Home").should("exist").and("be.visible");
  });

  it("should expand the categories on large viewports", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);
    cy.get("button.hamburger").click();
    cy.contains("a", "Home").should("exist").and("be.visible");
  });

  it("should grow the navbar if the height of the viewport increases", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);
    cy.viewport(750, 1000);
    cy.get("nav").invoke("outerHeight").should("equal", 1000);
  });

  it("should close the navbar on mobile on item click", () => {
    cy.mount(<MockSidebarWithRouter />);
    cy.get("button.hamburger").click();
    cy.contains("a", "Tutorials").click();
    cy.contains("a", "Home").should("not.be.visible");
  });

  it("should render an x-mark on mobile as an icon to minimize the navbar", () => {
    cy.mount(<MockSidebarWithRouter />);

    // initially render the hamburger icon
    cy.get("#hamburger-icon").should("exist");

    // Expand the navbar
    cy.get("button.hamburger").click();

    // Assert that the icon changed to the x-mark
    cy.get("#x-mark-icon").should("exist");

    // Minimize the navbar
    cy.get("button.hamburger").click();

    // Assert that the x-mark is no longer visible
    cy.get("#x-mark-icon").should("not.exist");
  });

  it("should never render the x-mark icon on desktop", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);

    // Assert that the x-mark isn't visible
    cy.get("#x-mark-icon").should("not.exist");

    // Expand the navbar
    cy.get("button.hamburger").click();

    // Assert that the x-mark isn't visible
    cy.get("#x-mark-icon").should("not.exist");
  });

  it("should minimize the expanded navbar if the viewport width increases", () => {
    cy.mount(<MockSidebarWithRouter />);
    cy.get("button.hamburger").click();
    cy.viewport(750, 600);

    // Assert the width to be between 202 and 203
    cy.get("nav").invoke("outerWidth").should("be.greaterThan", 202).and("be.lessThan", 203);
  });

  it("should save the open state of the navbar to the localStorage on desktop", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);

    // Close the navbar
    cy.get("button.hamburger")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.expanded).to.equal(false);
      });

    // Open the navbar again
    cy.get("button.hamburger")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
        expect(localStorageItem).not.to.equal(null);
        expect(localStorageItem?.expanded).to.equal(true);
      });
  });

  it("should expand the navbar on desktop by default", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);
    cy.get("nav").invoke("outerWidth").should("be.greaterThan", 202);
  });

  it("should minimize the navbar on initial mount if the user has this settings configured on desktop", () => {
    const settings: ISettings = {
      expanded: true,
    };

    localStorage.setItem("repeatio-settings", JSON.stringify(settings, null, "\t"));

    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);
    cy.get("nav").invoke("outerWidth").should("be.greaterThan", 202).and("be.lessThan", 203);
  });

  it("should not write the navbar settings to the localStorage settings on mobile", () => {
    cy.mount(<MockSidebarWithRouter />);

    // Maximize the navbar
    cy.get("button.hamburger")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
        expect(localStorageItem).to.equal(null);
      });

    // minimize the navbar again
    cy.get("button.hamburger")
      .click()
      .should(() => {
        const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
        expect(localStorageItem).to.equal(null);
      });
  });

  it("should update the highlight if clicking on navbar item", () => {
    cy.viewport(750, 600);
    cy.mount(<MockSidebarWithRouter />);
    cy.contains("a", "Tutorials")
      .click()
      .should("have.class", "currentView")
      .and("have.css", "backgroundColor", "rgb(40, 38, 61)");
  });
});
