import { useState, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import DOMPurify from "dompurify";
import { forbiddenAttributes, forbiddenTags } from "../blockedTagsAttributes";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

// React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

// css
import "./GapText.css";

// Components
import { AnswerCorrection } from "./AnswerCorrection";

// Interfaces/Types
import { IForwardRefFunctions, IQuestionTypeComponent } from "../types";

// Define Interfaces
export interface IGapText {
  text: string;
  correctGapValues?: Array<Array<string>>;
}

interface IGapTextProps extends IQuestionTypeComponent {
  options: IGapText;
}

//HELP
//The code in this Component may seem a bit odd.
//The reason for this weirdness is that it mixes JSON, MarkDown, HTML and JSX so it can use Markdown for syntax like tables, strong, ...
//The Component gets the JSON string, exports it to Markdown and then to HTML (with ReactDOMServer)
//Then an input element gets inserted into where the gaps "[]" are.
//Because ReactDOMServer.renderToString ignores onChange handlers these events have to be added by the useLayoutEffect
//At the end I just have to say this: Is it fast? no. Is it logical? no. Does it work? YES
//Feel free to update the code but this is honestly the best I can come up with atm that supports Markdown elements (tables, styling, ...) and user set input elements.

//Component
export const GapText = forwardRef<IForwardRefFunctions, IGapTextProps>(({ options, formDisabled }, ref) => {
  //States
  const [inputValues, setInputValues] = useState<string[]>([]);

  //Memo text so it hopefully doesn't get recalculated on every render
  const memoedText = useMemo(() => textWithBlanks(options.text), [options.text]);

  /* Functions */
  //Update the input where the input index is equal to the inputValues index
  const updateInput = useCallback(
    (e: Event) => {
      const newInputValue = inputValues.map((value, index) => {
        // Update the value of the array if the index of the id is equal to the index to the inputValues array element
        if (index === parseInt((e.target as HTMLInputElement)?.getAttribute("id")!.split("-")[1])) {
          return (e.target as HTMLInputElement).value;
        } else {
          return value;
        }
      });

      // Update the state
      setInputValues([...newInputValue]);
    },
    [inputValues]
  );

  //Prevent the form submission when entering "Enter" on an input element
  const onKeyDownPreventSubmit = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  /* UseLayoutEffects */
  //Create array with x amount of empty input values and reset
  useLayoutEffect(() => {
    setInputValues(Array(options?.correctGapValues?.length).fill(""));

    return () => {
      setInputValues([]);
    };
  }, [options.correctGapValues]);

  //Attack events to the inputs
  useLayoutEffect(() => {
    // Get the number of of gaps
    const inputElements = document.getElementsByClassName("gap") as HTMLCollectionOf<HTMLInputElement>;

    // Return from function if there are no elements found
    if (inputElements === undefined || inputElements.length === 0) return;

    // Loop through
    for (let index = 0; index < inputElements.length; index++) {
      const input = inputElements[index];

      if (!input) return;

      // Set the value of the input
      input.setAttribute("value", inputValues[index] || "");

      // attach handleChange function
      // One could change this to eventListener "input", but don't forget to also remove this event in the return function!
      input.addEventListener("change", updateInput);

      // attach function to prevent form submission on enter click
      input.addEventListener("keydown", onKeyDownPreventSubmit);

      if (formDisabled) {
        // disable the input
        input.disabled = true;

        //  Add green or red border if the form was submitted (and is therefor disabled)
        if (options.correctGapValues?.[index]?.includes(inputValues[index])) {
          input.style.borderColor = "green";
        } else {
          input.style.borderColor = "red";
        }
      } else {
        // enable the input
        input.disabled = false;
      }
    }

    return () => {
      // Get the number of of gaps
      const inputElements = document.getElementsByClassName("gap") as HTMLCollectionOf<HTMLInputElement>;

      // Guards if there are no elements
      if (inputElements === undefined || inputElements.length === 0) {
        return;
      }

      // Remove event listeners from each gap
      for (let index = 0; index < inputElements.length; index++) {
        const input = inputElements[index];

        if (!input) return;

        // Remove event listeners
        input.removeEventListener("change", updateInput);
        input.removeEventListener("keydown", onKeyDownPreventSubmit);
        input.removeAttribute("style");
        input.disabled = false;
      }
    };
  }, [inputValues, updateInput, options.correctGapValues, onKeyDownPreventSubmit, formDisabled]);

  //Imperative Handle so the parent can interact with this child
  useImperativeHandle(
    ref,
    (): IForwardRefFunctions => ({
      //Check if the answer is correct.
      checkAnswer() {
        //Strip the input values of any whitespace at the beginning or end and update the state (which will be updated after the function has completely finished)
        const trimmedInputValues = inputValues.map((value) => value.trim());

        setInputValues(trimmedInputValues);

        //Check if every gap correlates with the correct value from the gap array and return true/false to question form
        return (
          options.correctGapValues?.every((gapArray: string[], index: number) =>
            gapArray?.includes(trimmedInputValues[index])
          ) ?? true
        );
      },

      //Return the correct answer in JSX so it can be displayed in the parent component
      returnAnswer() {
        return <AnswerCorrection text={options.text} correctGapValues={options?.correctGapValues} />;
      },

      //Reset User selection
      resetSelection() {
        //return empty string for every input value in the array
        setInputValues(Array(inputValues.length).fill(""));

        const inputElements = document.getElementsByClassName("gap") as HTMLCollectionOf<HTMLInputElement>;

        for (let index = 0; index < inputElements.length; index++) {
          const input = inputElements[index];

          if (!input) return;

          input.value = "";

          // Remove the style from the html to reset to the border color that is set by css
          input.removeAttribute("style");
        }
      },

      //Trigger a useEffect (rerender) by increasing a state value
      resetAndShuffleOptions() {
        this.resetSelection();
      },
    })
  );

  //JSX
  return <div className='question-gap-text' dangerouslySetInnerHTML={{ __html: memoedText }} />;
});

/**
 * @summary Render the json string in markdown and return html nodes with a marker where the input should be inserted
 */
function textWithBlanks(text: string): string {
  //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
  //remarkGfm draws markdown tables
  const htmlString = ReactDOMServer.renderToString(
    <ReactMarkdown
      children={text}
      urlTransform={normalizeLinkUri}
      rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
      remarkPlugins={[remarkMath, remarkGfm]}
    />
  );

  //Split the html notes where the input should be inserted
  const htmlStringSplit = htmlString.split("[]");

  //Insert the input marker between the array elements but not at the end
  const htmlWithGaps = htmlStringSplit
    .map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        return line.concat(
          `<input class='gap' id='input-${index}' key='input-${index}' type='text' autocapitalize='off' autocomplete='off' spellcheck='false' />`
        );
      } else {
        return line;
      }
    })
    .join("");

  //return htmlWithGaps;

  // Sanitize the result
  return DOMPurify.sanitize(htmlWithGaps, {
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: forbiddenAttributes,
  });
}
