// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//To enable tabbing in cypress: https://github.com/kuceb/cypress-plugin-tab
import "cypress-plugin-tab";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Add a file from the cypress fixture folder to the localStorage
       * @param fileName - The name of the file with the the file extension
       */
      fixtureToLocalStorage(fileName: string): Chainable<Element>;
    }
  }
}

//Add a fixture to the localStorage

Cypress.Commands.add("fixtureToLocalStorage", (fileName) => {
  cy.fixture(fileName).then((fileContent) => {
    //get string before "." (the file ending)
    localStorage.setItem(fileName.split(".")[0], JSON.stringify(fileContent, null, "\t"));
    //TODO if bookmarked and module json files have the property type and id change to this
    //localStorage.setItem(`repeatio-${fileContent.type}-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
  });
});
