/// <reference types="cypress" />
import { Suspense } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Settings } from ".";
import { ISettings } from "../../hooks/useSetting";

import "../../index.css";
import { parseJSON } from "../../utils/parseJSON";
import { Sidebar } from "../Sidebar/Sidebar";
import { CircularTailSpinner } from "../Spinner";

//Mocha / Chai for typescript
declare var it: Mocha.TestFunction;
declare var describe: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

const MockSettingsWithRouter = () => {
  return (
    <div id='root'>
      <MemoryRouter initialEntries={[`/settings`]}>
        <Sidebar />
        <main>
          <Routes>
            <Route
              path='/settings'
              element={
                <Suspense fallback={<CircularTailSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
          </Routes>
        </main>
      </MemoryRouter>
    </div>
  );
};

describe("<Settings />", () => {
  context("Settings", () => {
    it("should change the value of the switch on change", () => {
      cy.mount(<Settings />);
      cy.get("input#switch-embedYoutubeVideos").parent().click();
      cy.get("input#switch-embedYoutubeVideos").should("be.checked");
    });

    it("should update the localStorage on switch change", () => {
      cy.mount(<Settings />);
      cy.get("input#switch-embedYoutubeVideos")
        .parent()
        .click()
        .should(() => {
          const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
          expect(localStorageItem?.embedYoutubeVideos).to.equal(true);
        });
    });

    it("should render the default settings", () => {
      cy.mount(<Settings />);
      cy.get("input#switch-expanded").should("be.checked");
      cy.get("input#switch-embedYoutubeVideos").should("not.be.checked");
    });

    it("should use the settings defined in the localStorage", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");
      cy.mount(<Settings />);
      cy.get("input#switch-expanded").should("not.be.checked");
    });

    it("should update the settings defined in the localStorage", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");
      cy.mount(<Settings />);
      cy.get("input#switch-expanded").parent().click();

      cy.get("input#switch-expanded").should("be.checked");
    });

    it("should expand the sidebar on desktop viewport", () => {
      cy.viewport(800, 500);
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<MockSettingsWithRouter />);
      cy.get("input#switch-expanded").parent().click();
      cy.get("nav").should("have.class", "sidebar-expanded");
      cy.get("button.hamburger").click();
      cy.get("input#switch-expanded").should("not.be.checked");
    });

    it("should not modify the other settings if updating a value", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);

      cy.get("input#switch-embedYoutubeVideos")
        .parent()
        .click()
        .should(() => {
          const localStorageItem = parseJSON<ISettings>(localStorage.getItem("repeatio-settings"));
          expect(localStorageItem).to.deep.eq({
            addedExampleModule: true,
            expanded: false,
            moduleSort: "ID (ascending)",
            embedYoutubeVideos: false,
          });
        });
    });
  });

  context("Export", () => {
    const downloadsFolder = Cypress.config("downloadsFolder");

    //Delete cypress/downloads folder before each test
    before(() => {
      cy.task("deleteFolder", downloadsFolder);
    });

    it("should export all files", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.mount(<Settings />);

      cy.get("button[aria-label='Export all files']").click();

      cy.readFile("cypress/downloads/repeatio.zip", "binary").then((fileContent) => {
        expect(fileContent).to.have.length.above(0);
      });
    });

    it("should export all modules", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.mount(<Settings />);

      cy.contains("label", "Include bookmarked question files").click();

      cy.get("input[type='checkbox'][id='export-modules-include-bookmarked']").should("not.be.checked");

      cy.get("button[aria-label='Export modules']").click();

      cy.readFile("cypress/downloads/repeatio.zip", "binary").then((fileContent) => {
        expect(fileContent).to.have.length.above(0);
      });
    });

    it("should export all modules + bookmarked files", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.mount(<Settings />);

      cy.get("button[aria-label='Export modules and bookmarked files']").click();

      cy.readFile("cypress/downloads/repeatio.zip", "binary").then((fileContent) => {
        expect(fileContent).to.have.length.above(0);
      });
    });

    it("should export settings", () => {
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);
      cy.get("button[aria-label='Export settings']").click();

      cy.readFile("cypress/downloads/repeatio-settings.json").then((settings) => {
        expect(settings).to.deep.equal({
          expanded: false,
          addedExampleModule: true,
          moduleSort: "ID (ascending)",
          embedYoutubeVideos: true,
        });
      });
    });
  });

  context("Danger Zone", () => {
    /* Danger Zone */
    it("should delete all files", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);
      cy.get("button[aria-label='Delete all files']")
        .click()
        .should(() => {
          //Delete from localStorage
          expect(localStorage.getItem("repeatio-module-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-marked-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-settings")).to.equal(null);
        });
    });

    it("should delete all modules and bookmarked files", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);
      cy.get("button[aria-label='Delete all modules and bookmarked files']")
        .click()
        .should(() => {
          //Delete from localStorage
          expect(localStorage.getItem("repeatio-module-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-marked-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-settings")).not.to.equal(null);
        });
    });

    it("should delete all modules but not the bookmarked files", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);

      // Uncheck
      cy.contains("label", "Delete bookmarked questions file").click();

      cy.get("input[type='checkbox'][id='deleteBookmarkedFilesWithModules']").should("not.be.checked");

      cy.get("button[aria-label='Delete all modules']")
        .click()
        .should(() => {
          //Delete from localStorage
          expect(localStorage.getItem("repeatio-module-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-marked-cypress_1")).not.to.equal(null);
          expect(localStorage.getItem("repeatio-settings")).not.to.equal(null);
        });
    });

    it("should show the loading symbol if deleting the modules", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);

      cy.get("button[aria-label='Delete all modules and bookmarked files']").click();

      cy.get("button[name='delete-all-modules']").find("svg").should("exist");
      cy.get("button[name='delete-all-modules']").find("span").should("have.css", "color", "rgb(168, 6, 6)");
      cy.get("button[name='delete-all-modules']").find("svg").should("not.exist");
    });

    it("should delete all bookmarked files", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);

      cy.get("button[aria-label='Delete all bookmarked files']")
        .click()
        .should(() => {
          //Delete from localStorage
          expect(localStorage.getItem("repeatio-module-cypress_1")).not.to.equal(null);
          expect(localStorage.getItem("repeatio-marked-cypress_1")).to.equal(null);
          expect(localStorage.getItem("repeatio-settings")).not.to.equal(null);
        });
    });

    it("should delete settings", () => {
      cy.fixtureToLocalStorage("repeatio-module-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-marked-cypress_1.json");
      cy.fixtureToLocalStorage("repeatio-settings.json");

      cy.mount(<Settings />);
      cy.get("button[aria-label='Delete settings']")
        .click()
        .should(() => {
          //Delete from localStorage
          expect(localStorage.getItem("repeatio-module-cypress_1")).not.to.equal(null);
          expect(localStorage.getItem("repeatio-marked-cypress_1")).not.equal(null);
          expect(localStorage.getItem("repeatio-settings")).to.equal(null);
        });
    });
  });

  context("Version", () => {
    it("should display the current version", () => {
      cy.mount(<Settings />);

      cy.contains("Version: 0.5.0").should("exist");
    });
  });
});
