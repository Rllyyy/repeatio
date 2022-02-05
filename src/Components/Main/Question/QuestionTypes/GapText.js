import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, createRef } from "react";
import { render } from "react-dom";
import ReactDOMServer from "react-dom/server";

//React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

//css
import "./GapText.css";

//HELP
//The code in this Component may seem a bit odd.
//The reason for this weirdness is that it mixes JSON, MarkDown, HTML and JSX so it can use Markdown for syntax like tables, strong, ...
//The Component reads gets the JSON string, exports it to Markdown and then to HTML (with ReactDOMServer)
//Because ReactDOMServer.renderToString ignores onChange handlers the input element can't be placed for now.
//But a marker is placed to know where to append the input later.
//All the output of the ReactDOMServer.renderToString is then placed inside a dangerouslySetInnerHTML.
//When the useEffect is called it inserts an input element at the marker.
//At the end I just have to say this: Is it fast? no. Is it logical? no. Does it work? YES
//Feel free to update the code but this is honestly the best I can come up with atm that supports Markdown elements (tables, styling, ...) and user set input elements.

//Component
const GapText = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [inputValues, setInputValues] = useState([]);

  //Refs
  const inputWrapperRef = useRef(options.correctGapValues.map(() => createRef()));

  /* Functions */
  //Update the input where the input index is equal to the inputValues index
  const updateInput = useCallback(
    (e, idx) => {
      const newInputValue = inputValues.map((value, index) => {
        if (index === idx) {
          return e.target.value;
        } else {
          return value;
        }
      });
      setInputValues(newInputValue);
    },
    [inputValues]
  );

  //Set the dangerouslySetInnerHTML for question-gap-text div element
  const textWithBlanks = useCallback(() => {
    /* let tableTest =
      "Sample table:\n\n| One | Two | Three |\n|-----|-----|-------|\n| []   | b   | []     | \n\n Hello this is a [] string\n\n <table><tr><th>Company</th><th>Country</th></tr><tr>    <td>Alfreds Futterkiste</td><td>Germany</td></tr><tr><td>Centro comercial Moctezuma</td>    <td>Mexico</td></tr>/table>"; */

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
            <>{line}</>
            {/* ReactDOMServer.renderToString ignores event handlers so this is a marker for where to insert the input at the useEffect */}
            <div id={`input-wrapper-${index}`} ref={inputWrapperRef.current[index]}></div>
          </>
        );
      } else {
        return ReactDOMServer.renderToString(<>{line}</>);
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

  /* UseEffects */
  //Create array with x amount of empty input values
  useEffect(() => {
    const emptyValues = options.correctGapValues.map((option) => {
      return "";
    });
    setInputValues(emptyValues);
  }, [options.correctGapValues]);

  //Inset the input elements at the corresponding input wrapper index
  useEffect(() => {
    //Guard
    if (inputValues === undefined) {
      return;
    }
    //Append a child x amount of times
    for (let index = 0; index < inputWrapperRef.current.length; index++) {
      render(
        <input
          type='text'
          className={`${formDisabled ? "input-disabled" : "input-enabled"}`}
          key={`input-${index}`}
          disabled={formDisabled}
          autoCapitalize='off'
          autoComplete='off'
          spellCheck='false'
          onChange={(e) => updateInput(e, index)}
          value={inputValues[index] || ""}
        />,
        document.getElementById(`input-wrapper-${index}`)
      );
    }
  }, [inputValues, formDisabled, updateInput]);

  //Imperative Handle so the parent can interact with this child
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
    checkAnswer() {
      //Strip the input values of any whitespace at the beginning or end and update the state
      const trimmedInputValues = inputValues.map((value) => value.trim());
      setInputValues(trimmedInputValues);

      //Check if every gap correlates with the correct value from the gap array
      //And trim the input (because the state isn't used yet)
      const answeredCorrect = options.correctGapValues.every((gapArray, index) =>
        gapArray.includes(trimmedInputValues[index])
      );

      //Show if the answer is correct in the parent component
      setShowAnswer(true);
      if (answeredCorrect) {
        setAnswerCorrect(true);
      } else {
        setAnswerCorrect(false);
      }
    },

    //Return the correct answer in JSX so it can be displayed in the parent component
    returnAnswer() {
      const splitArray = options.text.split("[]");

      const concatValues = (values) => {
        return values.join("; ");
      };

      //Map over the split array and place a input element between them.
      //But don't do it at the end if there is no such split element.
      //This is kinda ugly but the other option would be to set a dangerouslySetInnerHTML.
      const mappedArray = splitArray.map((line, index) => {
        if (index < splitArray.length - 1) {
          const concatenatedValues = concatValues(options.correctGapValues[index]);
          return (
            <span key={`line-width-input-${index}`}>
              <span key={`line-${index}`} className='line'>
                {line}
              </span>
              <input
                disabled
                key={`input-${index}`}
                type='text'
                autoCapitalize='off'
                autoComplete='off'
                spellCheck='false'
                value={concatenatedValues || ""}
                style={{ width: `${concatenatedValues.length}ch` }}
              />
            </span>
          );
        } else {
          return <span key={`line-${index}`}>{line}</span>;
        }
      });

      return <div className='correction-gap-text'>{mappedArray}</div>;
    },

    //Reset User selection
    resetSelection() {
      //return empty string for every input value in the array
      const emptyInput = inputValues.map(() => {
        return "";
      });
      setInputValues(emptyInput);
    },

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      this.resetSelection();
    },
  }));

  //JSX
  return (
    <>
      <div className='question-gap-text' dangerouslySetInnerHTML={{ __html: textWithBlanks() }} />
    </>
  );
});

export default GapText;
