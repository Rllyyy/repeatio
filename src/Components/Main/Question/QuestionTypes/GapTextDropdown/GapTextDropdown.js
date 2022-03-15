import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { render } from "react-dom";
import ReactDOMServer from "react-dom/server";

//React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

//css
import "./GapTextDropdown.css";

//Components
import AnswerCorrection from "./Components/AnswerCorrection";
import ReturnOptions from "./Components/ReturnOptions";

//Component
const GapTextDropdown = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [selectedValues, setSelectedValues] = useState([]);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

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
      <ReactMarkdown children={options.text} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} />
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
      .replaceAll('data-reactroot=""', "");

    //Export to dangerouslySetInnerHTML
    //TODO: Sanitize the html with https://github.com/cure53/DOMPurify
    return exportHTMl;
  }, [options.text]);

  //Inset the select elements at the corresponding select wrapper index,
  //because ReactDOMServer.renderToString ignores onChange handlers
  useEffect(() => {
    //Guards
    //Has to be selected with query because ReactDOMServer.renderToString ignores refs
    const selectWrapperLength = document.querySelectorAll(".question-gap-text-with-dropdown .select-wrapper").length;

    if (selectedValues === undefined || selectWrapperLength === 0 || selectedValues.length <= 0) {
      return;
    }

    //Append a child to the wrapper x amount of times
    for (let index = 0; index < selectWrapperLength; index++) {
      //! IDS!!
      render(
        <select
          className={`${formDisabled ? "select-disabled" : "select-enabled"}`}
          key={`select-${index}`}
          disabled={formDisabled}
          onChange={(e) => handleChange(e, index)}
          value={selectedValues[index].value || ""}
        >
          <ReturnOptions selectIndex={index} options={options} shuffleTrigger={shuffleTrigger} />
        </select>,
        document.getElementById(`select-wrapper-${index}`)
      );
    }
  }, [selectedValues, formDisabled, handleChange, options, shuffleTrigger]);

  //Setup selected empty values
  useEffect(() => {
    const emptyValues = options.dropdowns.map((dropdown) => {
      return { id: dropdown.id, value: "" };
    });

    setSelectedValues([...emptyValues]);

    return () => {
      setSelectedValues([]);
    };
  }, [options.dropdowns]);

  //Imperative handle allows the parent to interact with this child
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct
    checkAnswer() {
      //Show if the answer is correct in the parent component
      //Every value selected by the user must equal the corresponding value in the original data
      const answeredCorrect = selectedValues.every((selected) => {
        const { id, value } = selected;
        //find corresponding correct item
        const provided = options.dropdowns.find((dropdown) => dropdown.id === id);
        if (value === provided.correct) {
          return true;
        } else {
          return false;
        }
      });

      //Show if the answer is correct in the parent component
      setShowAnswer(true);
      if (answeredCorrect) {
        setAnswerCorrect(true);
      } else {
        setAnswerCorrect(false);
      }
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

    //Reset selection and shuffle the options
    //Triggered when the user clicks question-retry button after form submit
    resetAndShuffleOptions() {
      this.resetSelection();
      //Trigger a rerender for the dropdown options and therefor randomize them
      setShuffleTrigger((prev) => prev + 1);
    },
  }));

  //JSX
  return (
    <>
      <p className='question-gap-text-with-dropdown' dangerouslySetInnerHTML={{ __html: textWithBlanks() }} />
    </>
  );
});

export default GapTextDropdown;
