import { useState, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import DOMPurify from "dompurify";
import { forbiddenTags, forbiddenAttributes } from "../blockedTagsAttributes";

// React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

// css
import "./GapTextDropdown.css";

// Components
import { AnswerCorrection } from "./AnswerCorrection";

// Functions
import { shuffleArray } from "../../../../utils/shuffleArray";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

// Import Interfaces
import { IForwardRefFunctions, IQuestionTypeComponent } from "../types";

// Interfaces
export interface IDropdownElement {
  id: string;
  options: string[];
  correct: string;
}

export interface IGapTextDropdown {
  text: string;
  dropdowns?: IDropdownElement[];
}

interface GapTextDropdownComponentProps extends IQuestionTypeComponent {
  options: IGapTextDropdown;
}

interface ISelectedValue {
  id: string;
  value: string;
}

//Component
export const GapTextDropdown = forwardRef<IForwardRefFunctions, GapTextDropdownComponentProps>(
  ({ options, formDisabled }, ref) => {
    //States
    const [selectedValues, setSelectedValues] = useState<ISelectedValue[]>([]);
    const [shuffledDropdownOptions, setShuffledDropdownOptions] = useState<IDropdownElement["options"][]>([]);

    const memoedText = useMemo(
      () => textWithBlanks(options.text, shuffledDropdownOptions),
      [options.text, shuffledDropdownOptions]
    );

    //Update the selected input
    const handleChange = useCallback(
      (e: Event) => {
        const newSelectValue = selectedValues.map((selectedValue) => {
          if (selectedValue.id === (e.target as HTMLOptionElement)?.id) {
            return { ...selectedValue, value: (e.target as HTMLOptionElement)?.value };
          } else {
            return selectedValue;
          }
        });
        setSelectedValues(newSelectValue);
      },
      [selectedValues]
    );

    //Inset the select elements at the corresponding select wrapper index,
    //because ReactDOMServer.renderToString ignores onChange handlers
    useLayoutEffect(() => {
      //Get all select elements by class
      const selectElements = document.getElementsByClassName("select") as HTMLCollectionOf<HTMLSelectElement>;

      //Guards
      if (
        selectedValues === undefined ||
        selectElements.length === 0 ||
        selectedValues.length <= 0 ||
        selectElements.length !== selectedValues.length
      ) {
        return;
      }

      //Append a child to the wrapper x amount of times
      for (let index = 0; index < selectElements.length; index++) {
        const select = selectElements[index];

        if (!select) return;

        // setup the value
        select.setAttribute("value", selectedValues[index].value || "");

        // attach handle Change function
        select.addEventListener("change", handleChange);

        if (formDisabled) {
          select.disabled = true;
          if (options.dropdowns?.[index]?.correct === selectedValues[index]?.value) {
            select.style.borderColor = "green";
          } else {
            select.style.borderColor = "red";
          }
        } else {
          select.disabled = false;
        }
      }

      return () => {
        const selectElements = document.getElementsByClassName("select") as HTMLCollectionOf<HTMLSelectElement>;

        //Guards
        if (
          selectedValues === undefined ||
          selectElements.length === 0 ||
          selectedValues.length <= 0 ||
          selectElements.length !== selectedValues.length
        ) {
          return;
        }

        // Remove event listeners to each gap
        for (let index = 0; index < selectElements.length; index++) {
          const select = selectElements[index];

          if (!select) return;

          // Remove event listeners
          select.removeEventListener("change", handleChange);
          select.removeAttribute("style");
        }
      };
    }, [selectedValues, formDisabled, handleChange, options.dropdowns]);

    //Setup selected empty values
    useLayoutEffect(() => {
      const emptyValues = options.dropdowns?.map((dropdown) => {
        return { id: dropdown.id, value: "" };
      });

      // Setup array of object
      if (emptyValues) {
        setSelectedValues([...emptyValues]);
      }

      if (options.dropdowns) {
        setShuffledDropdownOptions(options.dropdowns?.map((dropdown) => shuffleArray(dropdown?.options)));
      }

      return () => {
        setSelectedValues([]);
        setShuffledDropdownOptions([]);
      };
    }, [options.dropdowns]);

    //Imperative handle allows the parent to interact with this child
    useImperativeHandle(ref, () => ({
      //Check if the answer is correct
      checkAnswer() {
        //Show if the answer is correct in the parent component by return true/false
        //Every value selected by the user must equal the corresponding value in the original data
        return selectedValues.every((selected) => {
          const { id, value } = selected;
          //find corresponding correct item
          const provided = options.dropdowns?.find((dropdown) => dropdown.id === id);

          // Return true if the value matches correct value
          return value === provided?.correct;
        });
      },

      //Return the correct answer as jsx
      returnAnswer() {
        return <AnswerCorrection text={options.text} dropdowns={options.dropdowns} />;
      },

      //Reset the users selection
      //Triggered when the user clicks question-retry button before form submit
      resetSelection() {
        const emptySelected = selectedValues.map((item) => {
          return { ...item, value: "" };
        });
        setSelectedValues([...emptySelected]);

        const selectElements = document.getElementsByClassName("select") as HTMLCollectionOf<HTMLSelectElement>;

        for (let index = 0; index < selectElements.length; index++) {
          const select = selectElements[index];

          if (!select) return;

          select.value = "";

          // Remove the style from the html to reset to the border color that is set by css
          select.removeAttribute("style");
        }
      },

      //Reset selection and reshuffle the dropdown options
      resetAndShuffleOptions() {
        this.resetSelection();
        if (options.dropdowns) {
          setShuffledDropdownOptions(options.dropdowns.map((dropdown) => shuffleArray(dropdown.options)));
        }
      },
    }));

    //JSX
    return <div className='question-gap-text-with-dropdown' dangerouslySetInnerHTML={{ __html: memoedText }} />;
  }
);

function textWithBlanks(text: string, shuffledDropdowns: string[][]): string {
  //Render the json string in markdown and return a string of html
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

  //Split the html notes where the select should be inserted
  const htmlStringSplit = htmlString.split("[]");

  //Insert the input marker between the array elements but not at the end
  const htmlWithSelects = htmlStringSplit
    .map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        return line.concat(
          `<select class='select' id='select-${index}' key='select-${index}'>
            <option value=''></option>
            ${shuffledDropdowns[index]?.map((text) => {
              return `<option value='${text}'>${text}</option>`;
            })}
          </select>`
        );

        /* ReactDOMServer.renderToString ignores event handlers so this is a marker for where to insert the input at the useLayoutEffect. This is not needed for the correction. */
      } else {
        return line;
      }
    })
    .join("");

  // Sanitize the result
  return DOMPurify.sanitize(htmlWithSelects, {
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: forbiddenAttributes,
  });
}
