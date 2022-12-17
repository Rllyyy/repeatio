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

// React 16, 17
import { mount } from "cypress/react";

type Fixtures =
  | "repeatio-module-gap_text.json"
  | "repeatio-module-empty-questions.json"
  | "repeatio-module-cypress_1.json"
  | "repeatio-marked-types_1.json"
  | (string & {});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Add a file from the cypress fixture folder to the localStorage
       * @param fileName - The name of the file with the the file extension
       */
      //| Object | HTMLElement |Selection
      fixtureToLocalStorage(fileName: Fixtures): Chainable<Element>;
      mount: typeof mount;
      setSelection: (subject?: any, query?: any, endQuery?: any) => Chainable<Element>;
      selection: (subject?: any, fn?: Function) => any;
      setCursor: (subject?: any, query?: any, atStart?: any) => Chainable<Element>;
      setCursorBefore: (subject?: any, query?: any) => Chainable<Element>;
      setCursorAfter: (subject?: any, query?: any) => Chainable<Element>;
    }
  }
}

Cypress.Commands.add("mount", (component, options) => {
  // Wrap any parent components needed
  // ie: return mount(<MyProvider>{component}</MyProvider>, options)
  return mount(component, options);
});

//Add a fixture to the localStorage
Cypress.Commands.add("fixtureToLocalStorage", (fileName) => {
  cy.fixture(fileName).then((fileContent) => {
    //get string before "." (the file ending)
    localStorage.setItem(fileName.split(".")[0], JSON.stringify(fileContent, null, "\t"));
    //TODO if bookmarked and module json files have the property type and id change to this
    //localStorage.setItem(`repeatio-${fileContent.type}-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
  });
});

/**
 * Add support for selection and cursor
 *
 * Credits
 * @Bkucera: https://github.com/cypress-io/cypress/issues/2839#issuecomment-447012818
 * @Phrogz: https://stackoverflow.com/a/10730777/1556245
 * @Samtsai: https://gist.github.com/samtsai/5cf901ba61fd8d44c8dd7eaa728cac49
 *
 * Usage
 * ```
 * Types "foo" and then selects "fo"
 * cy.get('input')
 *   .type('foo')
 *   .setSelection('fo')
 *
 * Types "foo", "bar", "baz", and "qux" on separate lines, then selects "foo", "bar", and "baz"
 * cy.get('textarea')
 *   .type('foo{enter}bar{enter}baz{enter}qux{enter}')
 *   .setSelection('foo', 'baz')
 *
 * Types "foo" and then sets the cursor before the last letter
 * cy.get('input')
 *   .type('foo')
 *   .setCursorAfter('fo')
 *
 * Types "foo" and then sets the cursor at the beginning of the word
 * cy.get('input')
 *   .type('foo')
 *   .setCursorBefore('foo')
 *
 * `setSelection` can alternatively target starting and ending nodes using query strings,
 * plus specific offsets. The queries are processed via `Element.querySelector`.
 * cy.get('body')
 *   .setSelection({
 *     anchorQuery: 'ul > li > p', // required
 *     anchorOffset: 2 // default: 0
 *     focusQuery: 'ul > li > p:last-child', // default: anchorQuery
 *     focusOffset: 0 // default: 0
 *    })
 */

// Low level command reused by `setSelection` and low level command `setCursor`
Cypress.Commands.add("selection", { prevSubject: true }, (subject, fn) => {
  cy.wrap(subject).trigger("mousedown", { force: true }).then(fn).trigger("mouseup", { force: true });

  cy.document().trigger("selectionchange");
  return cy.wrap(subject);
});

Cypress.Commands.add("setSelection", { prevSubject: true }, (subject, query, endQuery) => {
  return cy.wrap(subject).selection(($el: any) => {
    const el = $el[0];
    if (isInputOrTextArea(el)) {
      const text = $el.text();
      const start = text.indexOf(query);
      const end = endQuery ? text.indexOf(endQuery) + endQuery.length : start + query.length;

      $el[0].setSelectionRange(start, end);
    } else if (typeof query === "string") {
      const anchorNode = getTextNode(el, query);
      const focusNode = endQuery ? getTextNode(el, endQuery) : anchorNode;
      const anchorOffset = anchorNode?.wholeText.indexOf(query);
      const focusOffset = endQuery
        ? focusNode?.wholeText.indexOf(endQuery) + endQuery.length
        : anchorOffset + query.length;
      setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    } else if (typeof query === "object") {
      const anchorNode = getTextNode(el.querySelector(query.anchorQuery));
      const anchorOffset = query.anchorOffset || 0;
      const focusNode = query.focusQuery ? getTextNode(el.querySelector(query.focusQuery)) : anchorNode;
      const focusOffset = query.focusOffset || 0;
      setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    }
  });
});

// Low level command reused by `setCursorBefore` and `setCursorAfter`, equal to `setCursorAfter`
//If this doesn't work try: https://github.com/netlify/netlify-cms/blob/a4b7481a99f58b9abe85ab5712d27593cde20096/cypress/support/commands.js
Cypress.Commands.add("setCursor", { prevSubject: true }, (subject, query, atStart) => {
  return cy.wrap(subject).selection(($el: any) => {
    const el = $el[0];

    if (isInputOrTextArea(el)) {
      const text = $el.text();
      const position = text.indexOf(query) + (atStart ? 0 : query.length);
      $el[0].setSelectionRange(position, position);
    } else {
      const node = getTextNode(el, query);
      const offset = node?.wholeText.indexOf(query) + (atStart ? 0 : query.length);
      const document = node?.ownerDocument;
      document?.getSelection()?.removeAllRanges();
      document?.getSelection()?.collapse(node!, offset);
    }
  });
  // Depending on what you're testing, you may need to chain a `.click()` here to ensure
  // further commands are picked up by whatever you're testing (this was required for Slate, for example).
});

Cypress.Commands.add("setCursorBefore", { prevSubject: true }, (subject, query) => {
  cy.wrap(subject).setCursor(query, true);
});

Cypress.Commands.add("setCursorAfter", { prevSubject: true }, (subject, query) => {
  cy.wrap(subject).setCursor(query);
});

// Helper functions
function getTextNode(el?: any, match?: any) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  if (!match) {
    return walk.nextNode();
  }

  let node: any;
  while ((node = walk.nextNode())) {
    if (node.wholeText.includes(match)) {
      return node;
    }
  }
}

function setBaseAndExtent(...args: any[]) {
  const node = args[0];
  const document = node.ownerDocument;
  const selection = document.getSelection();
  selection.setBaseAndExtent(...args);
}

function isInputOrTextArea(el?: any) {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el.nodeName === "TEXTAREA" ||
    el.nodeName === "INPUT"
  );
}
