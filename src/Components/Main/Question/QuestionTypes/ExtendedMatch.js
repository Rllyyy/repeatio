import React, { forwardRef, useRef, useEffect, useState, createRef, useImperativeHandle } from "react";
import { isEqual } from "lodash";
import { useSize } from "../../../../hooks/useSize.js";
import "./ExtendedMatch.css";

const ExtendedMatch = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [lines, setLines] = useState([]);

  //Refs
  const canvasRef = useRef();
  const left = useRef(options.leftSide.map(() => createRef()));
  const right = useRef(options.rightSide.map(() => createRef()));

  //Custom Hooks
  const canvasSize = useSize(canvasRef);

  //Reset the ref options changes
  useEffect(() => {
    setLines([]);
    left.current = options.leftSide.map(() => createRef());
    right.current = options.rightSide.map(() => createRef());
  }, [options]);

  //Draw a new line in the canvas
  useEffect(() => {
    if (canvasSize === undefined || lines.length <= 0) {
      //Reset the canvas to empty
      //TODO Update this https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing ??
      const canvasEle = canvasRef.current;
      canvasEle.width = canvasRef.current.clientWidth;
      canvasEle.height = canvasRef.current.clientHeight;
      let ctx = canvasEle.getContext("2d");
      ctx.beginPath();
    }

    //Create the canvas element
    const canvasEle = canvasRef.current;
    canvasEle.width = canvasRef.current.clientWidth;
    canvasEle.height = canvasRef.current.clientHeight;
    let ctx = null;

    lines.forEach((line) => {
      //Guards: Only render the line if the left and right property are defined
      if (line.left === undefined || line.right === undefined || Object.keys(line).length !== 2) {
        return;
      }

      //Set the left and right side offset top to determine the Y values of the lines
      //The offset is the height of the circle (10 + 2 [???]) + the distance to the parent (ext-match-element) + the distance of the parent element to to the ext-match-left-side element
      //
      const leftOffsetTop = line.left.offsetTop + 12 + line.left.parentNode.offsetTop;
      const rightOffSetTop = line.right.offsetTop + 12 + line.right.parentNode.offsetTop;

      //Draw on the canvas
      ctx = canvasEle.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(0, leftOffsetTop);
      ctx.lineTo(canvasSize.width, rightOffSetTop);
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgb(150, 150, 150)";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }, [lines, canvasSize]);

  //TODO Callback this only when lines changes??
  const setLeftSide = (index) => {
    //Guards
    if (formDisabled) return;

    //
    let arr = lines;

    if (arr.length === 0) {
      //If length is zero there is no need for checking
      console.log("1");
      arr.push({ left: left.current[index].current });
    } //Case if the left property is not set but the right property is
    else if (arr[arr.length - 1].left === undefined && arr[arr.length - 1].right !== undefined) {
      console.log("2");
      let obj = arr[arr.length - 1];
      obj = { ...obj, left: left.current[index].current };
      arr = arr.map((element, index) => {
        if (index === arr.length - 1) {
          return obj;
        } else {
          return element;
        }
      });
    } //Case if the right property isn't set
    else if (arr[arr.length - 1].right !== undefined) {
      console.log("3");
      arr.push({ left: left.current[index].current });
    } else if (arr[arr.length - 1].right === undefined && arr[arr.length - 1].left !== undefined) {
      console.log("4");
      let obj = { left: left.current[index].current };
      arr = arr.map((element, index) => {
        if (index === arr.length - 1) {
          return obj;
        } else {
          return element;
        }
      });
    }

    //Update the state
    setLines(() => [...arr]);

    //TODO highlight to opposite site
  };

  const setRightSide = (index) => {
    //Guards
    if (formDisabled) return;

    //
    let arr = lines;

    if (arr.length === 0) {
      arr.push({ right: right.current[index].current });
    } else if (arr[arr.length - 1].right === undefined && arr[arr.length - 1].left !== undefined) {
      let obj = arr[arr.length - 1];
      obj = { ...obj, right: right.current[index].current };

      arr = arr.map((element, index) => {
        if (index === arr.length - 1) {
          return obj;
        } else {
          return element;
        }
      });
    } else if (arr[arr.length - 1].left !== undefined) {
      arr.push({ right: right.current[index].current });
    } else if (arr[arr.length - 1].left === undefined && arr[arr.length - 1].right !== undefined) {
      let obj = { right: right.current[index].current };
      arr = arr.map((element, index) => {
        if (index === arr.length - 1) {
          return obj;
        } else {
          return element;
        }
      });
    }

    setLines(() => [...arr]);
  };

  const removeAllLines = () => {
    //Reset the state to empty array
    setLines([]);
  };

  //Imperative Handle
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
    checkAnswer() {
      //Check if all the elements in solution is also present in the lines array (state)
      const everySolutionInState = options.correctMatches.every((match) => {
        const isEqualTest = lines.some((line) => {
          const matchObject = {
            left: line.left.attributes.ident.value,
            right: line.right.attributes.ident.value,
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

    //Return the correct answer in JSX so it can be displayed in the parent component
    returnAnswer() {},

    //Reset User selection
    resetSelection() {
      removeAllLines();
    },

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      //TODO shuffle
      removeAllLines();
    },
  }));

  //JSX
  return (
    <div className='question-extended-match'>
      <div className='extended-match-grid'>
        <div className='ext-match-left-side'>
          {options.leftSide.map((item, index) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`}>
                <p className='ext-match-element-text'>{text}</p>
                <div
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"}`}
                  ref={left.current[index]}
                  ident={id}
                  onClick={() => setLeftSide(index)}
                />
              </div>
            );
          })}
        </div>
        <canvas ref={canvasRef}></canvas>
        <div className='ext-match-right-side'>
          {options.rightSide.map((item, index) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`}>
                <p className='ext-match-element-text'>{text}</p>
                <div
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"}`}
                  ref={right.current[index]}
                  ident={id}
                  onClick={() => setRightSide(index)}
                />
              </div>
            );
          })}
        </div>
      </div>
      <button className='remove-lines-btn' onClick={() => removeAllLines()}>
        Remove all lines
      </button>
    </div>
  );
});

export default ExtendedMatch;
