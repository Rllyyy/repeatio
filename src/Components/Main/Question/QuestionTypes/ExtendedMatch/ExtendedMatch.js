import React, { forwardRef, useRef, useEffect, useState, createRef, useImperativeHandle, useCallback } from "react";

//Import ReactMarkdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

//Import Components
import Canvas from "./Components/Canvas.js";
import AnswerCorrection from "./Components/AnswerCorrection.js";

//Import css
import "./ExtendedMatch.css";

//Import functions
import { isEqual } from "lodash";
import shuffleArray from "../../../../../functions/shuffleArray.js";

//Component
const ExtendedMatch = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [lines, setLines] = useState([]);
  const [shuffledLeftOptions, setShuffledLeftOptions] = useState([]);
  const [shuffledRightOptions, setShuffledRightOptions] = useState([]);
  const [triggerShuffle, setTriggerShuffle] = useState(0);
  const [highlightRight, setHighlightRight] = useState(false);
  const [highlightLeft, setHighlightLeft] = useState(false);
  const [highlightSelectedCircle, setHighlightSelectedCircle] = useState();

  //Refs
  const left = useRef();
  const right = useRef();

  //Reset the ref options changes
  useEffect(() => {
    //Remove all lines
    setLines([]);

    //Randomize the values.
    //Other question types (multiple-response /-choice) check if the new shuffled array is equal to the old one
    //and get a new one until they aren't but I personally think this is not worth the performance
    const leftShuffle = shuffleArray(options.leftSide);
    const rightShuffle = shuffleArray(options.rightSide);

    //Set current refs
    left.current = leftShuffle.map(() => createRef());
    right.current = rightShuffle.map(() => createRef());

    //Update the state
    setShuffledLeftOptions(leftShuffle);
    setShuffledRightOptions(rightShuffle);

    //Reset states when component unmounts
    return () => {
      setLines([]);
      setShuffledLeftOptions([]);
      setShuffledRightOptions([]);
      left.current = null;
      right.current = null;
      setHighlightRight(false);
      setHighlightLeft(false);
    };
  }, [options, triggerShuffle]);

  //EventHandler when the user clicks the left circles
  const updateLeftLine = useCallback(
    (circleIndex) => {
      //Guards
      if (formDisabled) return;

      //Variables
      let updatedLines = [...lines];
      const lastLineElement = lines[lines.length - 1];

      //Update the lines state depending on the user action
      if (updatedLines.length === 0) {
        //If length of the lines array is zero there needs to be no further checking, the object can just be pushed to the array
        updatedLines.push({ left: left.current[circleIndex].current });

        //Highlight the selected circle and the opposite side
        setHighlightSelectedCircle(`left-${circleIndex}`);
        setHighlightRight(true);
      } else if (lastLineElement.right !== undefined && lastLineElement.left !== undefined) {
        //Set the left property of a new line, but it's not the first line by checking if both elements (left/right) of the line before are set.
        updatedLines.push({ left: left.current[circleIndex].current });

        //Highlight the circle the user clicked on and the opposite side
        setHighlightSelectedCircle(`left-${circleIndex}`);
        setHighlightRight(true);
      } else if (lastLineElement.left === undefined && lastLineElement.right !== undefined) {
        //Case if the user first clicks a right side element
        updatedLines = updatedLines.map((element, index) => {
          if (index === updatedLines.length - 1) {
            return { ...element, left: left.current[circleIndex].current };
          } else {
            return element;
          }
        });

        //Remove the highlight from the single circle and the whole left section
        setHighlightSelectedCircle();
        setHighlightLeft(false);
      } else if (lastLineElement.right === undefined && lastLineElement.left !== undefined) {
        //Case if the user clicks a left element but then clicks another left element, so just the most recent value is used
        updatedLines = updatedLines.map((element, index) => {
          if (index === updatedLines.length - 1) {
            return { left: left.current[circleIndex].current };
          } else {
            return element;
          }
        });

        //Highlight the circle the user clicked on (the opposite side is already highlighted)
        setHighlightSelectedCircle(`left-${circleIndex}`);
      }

      //Update the state
      setLines(() => [...updatedLines]);
    },
    [lines, formDisabled]
  );

  //EventHandler when the user clicks the right circles
  const updateRightLine = useCallback(
    (circleIndex) => {
      //Guards
      if (formDisabled) return;

      //Variables
      let updatedLines = [...lines];
      const lastLineElement = lines[lines.length - 1];

      //Update the lines state depending on the user action
      if (updatedLines.length === 0) {
        //If length of the lines state is zero there needs to be no further checking, the object can just be pushed to the array
        updatedLines.push({ right: right.current[circleIndex].current });

        //Highlight the selected circle and the opposite side
        setHighlightSelectedCircle(`right-${circleIndex}`);
        setHighlightLeft(true);
      } else if (lastLineElement.left !== undefined && lastLineElement.right !== undefined) {
        //Set the right property of a new line, but it's not the first line by checking if both elements (left/right) of the line before are set.
        updatedLines.push({ right: right.current[circleIndex].current });

        //Highlight the clicked circle and the opposite side
        setHighlightSelectedCircle(`right-${circleIndex}`);
        setHighlightLeft(true);
      } else if (lastLineElement.right === undefined && lastLineElement.left !== undefined) {
        //Case if the user first clicks a left side element but there are already at least one line
        updatedLines = updatedLines.map((element, index) => {
          if (index === updatedLines.length - 1) {
            return { ...element, right: right.current[circleIndex].current };
          } else {
            return element;
          }
        });

        //Remove the highlights
        setHighlightSelectedCircle();
        setHighlightRight(false);
      } else if (lastLineElement.left === undefined && lastLineElement.right !== undefined) {
        //Case if the user clicks a right element but then clicks another right element, so just the most recent selected circle is used
        updatedLines = updatedLines.map((element, index) => {
          if (index === updatedLines.length - 1) {
            return { right: right.current[circleIndex].current };
          } else {
            return element;
          }
        });

        //Highlight the circle the user clicked on (the opposite side is already highlighted)
        setHighlightSelectedCircle(`right-${circleIndex}`);
      }

      //Update lines array
      setLines(() => [...updatedLines]);
    },
    [lines, formDisabled]
  );

  //Remove all the lines from the canvas/state
  const removeAllLines = () => {
    setHighlightSelectedCircle();
    setHighlightLeft(false);
    setHighlightRight(false);
    if (formDisabled) return;
    //Reset the state to empty array
    setLines([]);
  };

  //Imperative Handle
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
    checkAnswer() {
      setHighlightSelectedCircle();
      setHighlightRight(false);
      setHighlightLeft(false);

      //TODO remove line if property (right or left) is missing

      //Check if all the elements in solution is also present in the lines array (state)
      const everySolutionInState = options.correctMatches.every((match) => {
        const isEqualTest = lines.some((line) => {
          const matchObject = {
            left: line.left?.attributes.ident.value,
            right: line.right?.attributes.ident.value,
          };

          if (isEqual(match, matchObject)) {
            return true;
          } else {
            return false;
          }
        });

        return isEqualTest;
      });

      //Check if every option matches the solution and compare the length of the arrays, so the user can't trick the program by matching all possibilities
      if (everySolutionInState && options.correctMatches.length === lines.length) {
        //Show if the answer is correct in the parent component
        setAnswerCorrect(true);
      } else {
        setAnswerCorrect(false);
      }
      setShowAnswer(true);
    },

    //Return the correct answer as a Component so it can be displayed in the parent component
    //It needs to run as a component and not jsx like other questions, because first needs to add the refs,
    //before adding the correct lines
    returnAnswer() {
      return (
        <AnswerCorrection
          correctMatches={options.correctMatches}
          shuffledLeftOptions={shuffledLeftOptions}
          shuffledRightOptions={shuffledRightOptions}
          left={left}
          right={right}
        />
      );
    },

    //Reset User selection
    resetSelection() {
      removeAllLines();
    },

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      setTriggerShuffle((prev) => prev + 1);
    },
  }));

  //JSX
  return (
    <div className='question-extended-match'>
      <div className='extended-match-grid'>
        <div className={`ext-match-left-side ${highlightLeft && "highlight-all-left-circles"}`}>
          {shuffledLeftOptions.map((item, index) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`}>
                <ReactMarkdown
                  className='ext-match-element-text'
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  children={text}
                />
                <button
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"} ${
                    highlightSelectedCircle === `left-${index}` && "highlight-single-circle"
                  }`}
                  ref={left.current[index]}
                  ident={id}
                  onClick={() => updateLeftLine(index)}
                />
              </div>
            );
          })}
        </div>
        {lines.length > 0 && <Canvas lines={lines} />}
        <div className={`ext-match-right-side ${highlightRight && "highlight-all-right-circles"}`}>
          {shuffledRightOptions.map((item, index) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`}>
                <ReactMarkdown
                  className='ext-match-element-text'
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  children={text}
                />
                <button
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"} ${
                    highlightSelectedCircle === `right-${index}` && "highlight-single-circle"
                  }`}
                  ref={right.current[index]}
                  ident={id}
                  onClick={() => updateRightLine(index)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {!formDisabled && (
        <button className='remove-lines-btn' onClick={() => removeAllLines()}>
          Remove all lines
        </button>
      )}
    </div>
  );
});

export default ExtendedMatch;
