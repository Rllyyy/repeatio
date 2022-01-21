import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import "./GapText.css";

const GapText = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  const [inputValues, setInputValues] = useState([]);

  //Create array with x amount of empty input values
  useEffect(() => {
    const emptyValues = options.correctGapValues.map((option) => {
      return "";
    });
    setInputValues(emptyValues);
  }, [options.correctGapValues]);

  //Update the input where the input index is equal to the inputValues index
  //TODO Callback this
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

  const textWithBlanks = useCallback(() => {
    //Split the string
    const splitArray = options.text.split("[]");

    //Map over the split array and place a input element between them.
    //But don't do it at the end if there is no such split element.
    //This is kinda ugly but the other option would be to set a dangerouslySetInnerHTML.
    const mappedArray = splitArray.map((line, index) => {
      if (index < splitArray.length - 1) {
        return (
          <span key={`line-width-input-${index}`}>
            <span key={`line-${index}`}>{line}</span>
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
            />
          </span>
        );
      } else {
        return <span key={`line-${index}`}>{line}</span>;
      }
    });

    return mappedArray;
  }, [inputValues, updateInput, options.text, formDisabled]);

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
  return <div className='question-gap-text'>{textWithBlanks()}</div>;
});

export default GapText;
