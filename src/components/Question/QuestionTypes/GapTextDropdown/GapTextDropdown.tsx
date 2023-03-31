import { useState, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { render } from "react-dom";
import ReactDOMServer from "react-dom/server";
import DOMPurify from "dompurify";
import { forbiddenTags, forbiddenAttributes } from "../blockedTagsAttributes";

// React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// css
import "./GapTextDropdown.css";

// Components
import { AnswerCorrection } from "./AnswerCorrection";
import { ReturnOptions } from "./ReturnOptions";

// Functions
import { shuffleArray } from "../../../../utils/shuffleArray";

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

    const memoedText = useMemo(() => textWithBlanks(options.text, "question"), [options.text]);

    //Update the selected input
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectValue = selectedValues.map((selectedValue) => {
          if (selectedValue.id === e.target.id) {
            return { ...selectedValue, value: e.target.value };
          } else {
            return selectedValue;
          }
        });
        setSelectedValues([...newSelectValue]);
      },
      [selectedValues]
    );

    // Customize border color when user submits question
    const customStyle = useCallback(
      (index: number) => {
        if (!formDisabled) return;

        if (options.dropdowns?.[index]?.correct === selectedValues[index].value) {
          return { borderColor: "green" };
        } else {
          return { borderColor: "red" };
        }
      },
      [formDisabled, selectedValues, options.dropdowns]
    );

    //Inset the select elements at the corresponding select wrapper index,
    //because ReactDOMServer.renderToString ignores onChange handlers
    useLayoutEffect(() => {
      //Has to be selected with query because ReactDOMServer.renderToString ignores refs
      const selectWrapperLength = document.querySelectorAll(".question-gap-text-with-dropdown .select-wrapper").length;

      //Guards
      if (
        selectedValues === undefined ||
        selectWrapperLength === 0 ||
        selectedValues.length <= 0 ||
        selectWrapperLength !== selectedValues.length
      ) {
        return;
      }

      //Append a child to the wrapper x amount of times
      for (let index = 0; index < selectWrapperLength; index++) {
        //! IDS!!
        render(
          <select
            key={`select-${index}`}
            id={`select-${index}`}
            disabled={formDisabled}
            onChange={handleChange}
            value={selectedValues[index].value || ""}
            style={customStyle(index)}
            data-testid={`select-${index}`}
          >
            <ReturnOptions dropdownItems={shuffledDropdownOptions[index]} />
          </select>,
          document.getElementById(`select-wrapper-${index}`)
        );
      }
    }, [selectedValues, formDisabled, handleChange, options.dropdowns, shuffledDropdownOptions, customStyle]);

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
          if (value === provided?.correct) {
            return true;
          } else {
            return false;
          }
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
    return (
      <>
        <p className='question-gap-text-with-dropdown' dangerouslySetInnerHTML={{ __html: memoedText }} />
      </>
    );
  }
);

export function textWithBlanks(text: string, type: "question"): string;
export function textWithBlanks(text: string, type: "correction", dropdowns: IGapTextDropdown["dropdowns"]): string;
export function textWithBlanks(
  text: string,
  type: "question" | "correction",
  dropdowns?: IGapTextDropdown["dropdowns"]
): string {
  //Render the json string in markdown and return html nodes
  //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
  //remarkGfm draws markdown tables
  const htmlString = ReactDOMServer.renderToString(
    <ReactMarkdown children={text} rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]} />
  );

  //Split the html notes where the input should be inserted
  const htmlStringSplit = htmlString.split("[]");

  //Insert the input marker between the array elements but not at the end
  const mappedArray = htmlStringSplit.map((line, index) => {
    if (index < htmlStringSplit.length - 1) {
      return ReactDOMServer.renderToString(
        <>
          <p>{line}</p>
          {/* ReactDOMServer.renderToString ignores event handlers so this is a marker for where to insert the input at the useLayoutEffect. This is not needed for the correction. */}
          {type === "question" ? (
            <div className={"select-wrapper"} id={`select-wrapper-${index}`}></div>
          ) : (
            <p className='correct-dropdown-value'>{dropdowns?.[index].correct}</p>
          )}
        </>
      );
    } else {
      return ReactDOMServer.renderToString(<p>{line}</p>);
    }
  });

  //Combine the array to one string again
  const joinedElements = mappedArray.join("");

  //Remove jsx specific html syntax
  const exportHTML = joinedElements
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll('data-reactroot=""', "");

  // Sanitize the result
  return DOMPurify.sanitize(exportHTML, {
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: forbiddenAttributes,
  });
}
