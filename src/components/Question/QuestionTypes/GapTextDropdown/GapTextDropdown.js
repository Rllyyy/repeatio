import { useState, useCallback, forwardRef, useImperativeHandle, useLayoutEffect } from "react";
import { render } from "react-dom";
import ReactDOMServer from "react-dom/server";

//React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

//css
import "./GapTextDropdown.css";

//Components
import { AnswerCorrection } from "./AnswerCorrection";
import { ReturnOptions } from "./ReturnOptions";

//Functions
import { shuffleArray } from "../../../../utils/shuffleArray";

//Component
export const GapTextDropdown = forwardRef(({ options, formDisabled }, ref) => {
  //States
  const [selectedValues, setSelectedValues] = useState([]);
  const [shuffledDropdownOptions, setShuffledDropdownOptions] = useState([]);

  //Update the selected input
  const handleChange = useCallback(
    (e, index) => {
      const newSelectValue = selectedValues.map((selectedValue) => {
        if (selectedValue.id === `select-${index}`) {
          return { ...selectedValue, value: e.target.value };
        } else {
          return selectedValue;
        }
      });
      setSelectedValues([...newSelectValue]);
    },
    [selectedValues]
  );

  const textWithBlanks = useCallback(() => {
    //Render the json string in markdown and return html nodes
    //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
    //remarkGfm draws markdown tables
    const htmlString = ReactDOMServer.renderToString(
      <ReactMarkdown
        children={options.text}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
      />
    );

    //Split the html notes where the input should be inserted
    const htmlStringSplit = htmlString.split("[]");

    //Insert the input marker between the array elements but not at the end
    const mappedArray = htmlStringSplit.map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        return ReactDOMServer.renderToString(
          <>
            <span>{line}</span>
            {/* ReactDOMServer.renderToString ignores event handlers so this is a marker for where to insert the input at the useEffect */}
            <div className={"select-wrapper"} id={`select-wrapper-${index}`}></div>
          </>
        );
      } else {
        return ReactDOMServer.renderToString(<span>{line}</span>);
      }
    });

    //Combine the array to one string again
    const joinedElements = mappedArray.join("");

    //Remove jsx specific html syntax
    const exportHTMl = joinedElements
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll('data-reactroot=""', "");

    //Export to dangerouslySetInnerHTML
    //TODO: Sanitize the html with https://github.com/cure53/DOMPurify
    return exportHTMl;
  }, [options.text]);

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
          disabled={formDisabled}
          onChange={(e) => handleChange(e, index)}
          value={selectedValues[index].value || ""}
          data-testid={`select-${index}`}
        >
          <ReturnOptions selectIndex={index} dropdowns={shuffledDropdownOptions[index]} />
        </select>,
        document.getElementById(`select-wrapper-${index}`)
      );
    }
  }, [selectedValues, formDisabled, handleChange, options.dropdowns, shuffledDropdownOptions]);

  //Setup selected empty values
  useLayoutEffect(() => {
    const emptyValues = options.dropdowns.map((dropdown) => {
      return { id: dropdown.id, value: "" };
    });

    setSelectedValues([...emptyValues]);

    setShuffledDropdownOptions(options.dropdowns.map((dropdown) => shuffleArray(dropdown.options)));

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
        const provided = options.dropdowns.find((dropdown) => dropdown.id === id);
        if (value === provided.correct) {
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
      setShuffledDropdownOptions(options.dropdowns.map((dropdown) => shuffleArray(dropdown.options)));
    },
  }));

  //JSX
  return (
    <>
      <p className='question-gap-text-with-dropdown' dangerouslySetInnerHTML={{ __html: textWithBlanks() }} />
    </>
  );
});
