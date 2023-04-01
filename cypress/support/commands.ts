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
  | "repeatio-module-gap_text_dropdown.json"
  | "repeatio-module-multiple_choice.json"
  | "repeatio-module-multiple_response.json"
  | "repeatio-module-empty-questions.json"
  | "repeatio-module-cypress_1.json"
  | "repeatio-marked-types_1.json"
  | "repeatio-marked-cypress_1.json"
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
      setSelection: (
        query: string | { anchorQuery: string; anchorOffset?: number; focusQuery?: string; focusOffset?: number },
        endQuery?: string
      ) => Chainable<HTMLElement>;
      // Can't get this to work without subject and Chainable<JQuery<HTMLElement>>
      selection: (subject?: any, fn?: (element: JQuery<HTMLElement>) => void) => any;
      setCursor: (query: string, atStart?: boolean) => Chainable<Element>;
      setCursorBefore: (query: string) => Chainable<Element>;
      setCursorAfter: (query: string) => Chainable<Element>;
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
    //Build localStorage name from the type (module/marked) and the id
    localStorage.setItem(`repeatio-${fileContent.type}-${fileContent.id}`, JSON.stringify(fileContent, null, "\t"));
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
Cypress.Commands.add(
  "selection",
  { prevSubject: true },
  (subject: HTMLElement, fn: (element: JQuery<HTMLElement>) => void) => {
    cy.wrap(subject).trigger("mousedown", { force: true }).then(fn).trigger("mouseup", { force: true });

    cy.document().trigger("selectionchange");
    return cy.wrap(subject);
  }
);

Cypress.Commands.add(
  "setSelection",
  { prevSubject: true },
  (
    subject: HTMLElement,
    query: string | { anchorQuery: string; anchorOffset?: number; focusQuery?: string; focusOffset?: number },
    endQuery?: string
  ) => {
    return cy.wrap(subject).selection(($el: JQuery<HTMLElement>) => {
      const el = $el[0];
      if (isInputOrTextArea(el)) {
        const text = $el.text();

        let start;
        if (typeof query === "string") {
          start = text.indexOf(query) || 0;
          // rest of the code for query as string
        } else if (typeof query === "object") {
          start = text.indexOf(query.anchorQuery) || 0;
        } else {
          start = 0;
        }

        let qLength: number;
        if (typeof query === "string") {
          qLength = query.length || 0;
        } else if (typeof query === "object") {
          qLength = query.anchorQuery?.length || 0;
        } else {
          qLength = 0;
        }

        //const start = text.indexOf(query);
        const end = endQuery ? text.indexOf(endQuery) + endQuery.length : start + qLength;

        ($el[0] as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(start, end);
      } else if (typeof query === "string") {
        const anchorNode = getTextNode(el, query);
        const focusNode = endQuery ? getTextNode(el, endQuery) : anchorNode;
        const anchorOffset = anchorNode?.wholeText.indexOf(query);
        const focusOffset = endQuery
          ? (focusNode?.wholeText.indexOf(endQuery) || 0) + endQuery.length
          : (anchorOffset || 0) + query.length;
        const textNode = getTextNode(el, query);
        if (textNode && focusNode) setBaseAndExtent(textNode!, anchorOffset || 0, focusNode, focusOffset);
      } else if (typeof query === "object") {
        const anchorNode = getTextNode(el.querySelector(query.anchorQuery));
        const anchorOffset = query.anchorOffset || 0;
        const focusNode = query.focusQuery ? getTextNode(el.querySelector(query.focusQuery)) : anchorNode;
        const focusOffset = query.focusOffset || 0;

        const textNode = getTextNode(el, query.anchorQuery);
        if (textNode && focusNode) setBaseAndExtent(textNode!, anchorOffset || 0, focusNode, focusOffset);
      }
    });
  }
);

// Low level command reused by `setCursorBefore` and `setCursorAfter`, equal to `setCursorAfter`
//If this doesn't work try: https://github.com/netlify/netlify-cms/blob/a4b7481a99f58b9abe85ab5712d27593cde20096/cypress/support/commands.js
Cypress.Commands.add("setCursor", { prevSubject: "element" }, (subject, query, atStart) => {
  return cy.wrap(subject).selection(($el: JQuery<HTMLElement>) => {
    const el = $el[0];

    if (isInputOrTextArea(el)) {
      const text = $el.text();
      const position = text.indexOf(query) + (atStart ? 0 : query.length);
      ($el[0] as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(position, position);
    } else {
      const node = getTextNode(el, query);
      const offset = (node?.wholeText.indexOf(query) || 0) + (atStart ? 0 : query.length);
      const document = node?.ownerDocument;
      document?.getSelection()?.removeAllRanges();
      document?.getSelection()?.collapse(node!, offset);
    }
  });
  // Depending on what you're testing, you may need to chain a `.click()` here to ensure
  // further commands are picked up by whatever you're testing (this was required for Slate, for example).
});

Cypress.Commands.add("setCursorBefore", { prevSubject: true }, (subject: HTMLElement, query: string) => {
  cy.wrap(subject).setCursor(query, true);
});

Cypress.Commands.add("setCursorAfter", { prevSubject: true }, (subject: HTMLElement, query: string) => {
  cy.wrap(subject).setCursor(query);
});

// Helper functions
function getTextNode(el?: Element | null, match?: string | null): Text | null {
  if (!el) return null;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  if (!match) {
    return walk.nextNode() as Text;
  }

  let node: Node | null;
  while ((node = walk.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && (node as Text).wholeText.includes(match)) {
      return node as Text;
    }
  }
  return null;
}

function setBaseAndExtent(...args: [Node, number, Node?, number?]) {
  const node = args[0];
  const document = node.ownerDocument;
  const selection = document?.getSelection();
  if (selection) selection.setBaseAndExtent(args[0]!, args[1], args[2]!, args[3] ?? 0);
}

function isInputOrTextArea(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el.nodeName === "TEXTAREA" ||
    el.nodeName === "INPUT"
  );
}
