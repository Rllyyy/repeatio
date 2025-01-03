import { forwardRef, useRef, useLayoutEffect, useState, useImperativeHandle, useCallback } from "react";

//Import ReactMarkdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

//Import Components
import { AnswerCorrection } from "./AnswerCorrection";

//Import css
import "./ExtendedMatch.css";

//Import functions
import { isEqual } from "lodash";
import { shuffleArray } from "../../../../utils/shuffleArray";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

// Interfaces
import { IForwardRefFunctions, IQuestionTypeComponent } from "../types";
import { useSize } from "../../../../hooks/useSize";

//I am really not proud of this component :/ and refactor it for a future release
//Each line in the svg is an object in the lines array
//TODO refactor:
//- remove callbacks as they don't do anything

export interface IExtendedMatchItem {
  id: string;
  text: string;
}

interface ICorrectMatch {
  left: IExtendedMatchItem["id"];
  right: IExtendedMatchItem["id"];
}

export interface IExtendedMatch {
  leftSide: IExtendedMatchItem[] | undefined;
  rightSide: IExtendedMatchItem[] | undefined;
  correctMatches: ICorrectMatch[] | undefined;
}

interface IExtendedMatchProps extends IQuestionTypeComponent {
  options: IExtendedMatch;
}

export interface IExtendedMatchLine {
  left?: HTMLButtonElement | HTMLDivElement | undefined | null;
  right?: HTMLButtonElement | HTMLDivElement | undefined | null;
}

//Component
export const ExtendedMatch = forwardRef<IForwardRefFunctions, IExtendedMatchProps>(({ options, formDisabled }, ref) => {
  //States
  const [lines, setLines] = useState<IExtendedMatchLine[]>([]);
  const [shuffledLeftOptions, setShuffledLeftOptions] = useState<IExtendedMatchProps["options"]["leftSide"]>([]);
  const [shuffledRightOptions, setShuffledRightOptions] = useState<IExtendedMatchProps["options"]["rightSide"]>([]);
  const [highlightSide, setHighlightSide] = useState<"left" | "right" | null>(null);
  const [highlightSelectedCircle, setHighlightSelectedCircle] = useState<string | null>();

  //Refs
  const left = useRef<Array<HTMLButtonElement | null>>([]);
  const right = useRef<Array<HTMLButtonElement | null>>([]);

  //Reset the ref options changes
  useLayoutEffect(() => {
    //Remove all lines
    setLines([]);

    //Randomize the values.
    //Other question types (multiple-response /-choice) check if the new shuffled array is equal to the old one
    //and get a new one until they aren't but I personally think this is not worth the performance
    const leftShuffle = shuffleArray(options.leftSide || []);
    const rightShuffle = shuffleArray(options.rightSide || []);

    //Update the state
    setShuffledLeftOptions(leftShuffle);
    setShuffledRightOptions(rightShuffle);

    //Reset states when component unmounts
    return () => {
      setLines([]);
      setShuffledLeftOptions([]);
      setShuffledRightOptions([]);
      left.current = [];
      right.current = [];
      setHighlightSide(null);
    };
  }, [options]);

  //EventHandler when the user clicks the left circles
  const updateLeftLine = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      //Guards
      if (formDisabled) return;

      //Variables
      let updatedLines = [...lines];
      const id = e.currentTarget.getAttribute("data-ident");
      const newElement = left.current[id as keyof IExtendedMatchLine["left"]];
      const lastLineElement = lines[lines.length - 1];

      //Update the lines state depending on the user action
      if (updatedLines.length === 0 || typeof updatedLines === "undefined") {
        //If length of the lines array is zero there needs to be no further checking, the object can just be pushed to the array
        updatedLines = [{ left: newElement }];

        //Highlight the selected circle and the opposite side
        setHighlightSelectedCircle(id);
        setHighlightSide("right");
      } else if (lastLineElement.right !== undefined && lastLineElement.left !== undefined) {
        //Set the left property of a new line, but it's not the first line by checking if both elements (left/right) of the line before are set.
        updatedLines.push({ left: newElement });

        //Highlight the circle the user clicked on and the opposite side
        setHighlightSelectedCircle(id);
        setHighlightSide("right");
      } else if (lastLineElement.left === undefined && lastLineElement.right !== undefined) {
        //Case if the user first clicks a right side element
        const lastItemIndex = (updatedLines?.length ?? 0) - 1;

        // This part ensures that no duplicate lines are added
        // Loop through each item in the array using reduce
        updatedLines = (updatedLines || []).reduce((accumulator, item, currentIndex) => {
          // Check if this is the last item in the array
          if (currentIndex === lastItemIndex) {
            // Find the index of the item we want to update
            const index = updatedLines?.findIndex((item) => {
              return (
                item.right?.getAttribute("data-ident") === lastLineElement.right?.getAttribute("data-ident") &&
                item.left?.getAttribute("data-ident") === id
              );
            });

            // If the item is already at the beginning of the array, don't modify it
            if ((index ?? 0) >= 0) {
              // Don't add anything to the accumulator
              console.warn("Line already exists");
              //return
            } else if (index < 0) {
              // Create a copy of the item with the 'left' property updated
              const updatedItem = { ...item, left: newElement };
              // Add the updated item to the accumulator
              accumulator?.push(updatedItem);
            }
          } else {
            // This is not the last item in the array, so add it to the accumulator unchanged
            accumulator?.push(item);
          }

          // Return the accumulator for the next iteration
          return accumulator;
        }, [] as IExtendedMatchLine[]);

        //Remove the highlight from the single circle and the whole left section
        setHighlightSelectedCircle(null);
        setHighlightSide(null);
      } else if (lastLineElement.right === undefined && lastLineElement.left !== undefined) {
        //Case if the user clicks a left element but then clicks another left element, so just the most recent value is used
        updatedLines[(updatedLines?.length ?? 0) - 1].left = newElement;

        //Highlight the circle the user clicked on (the opposite side is already highlighted)
        setHighlightSelectedCircle(id);
      }

      //Update the state
      setLines(() => [...updatedLines]);
    },
    [lines, formDisabled]
  );

  //EventHandler when the user clicks the right circles
  const updateRightLine = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      //Guards
      if (formDisabled) return;

      //Variables
      let updatedLines = [...lines];
      const id = e.currentTarget.getAttribute("data-ident");
      const newElement = right.current[id as keyof IExtendedMatchLine["right"]];
      const lastLineElement = lines[lines.length - 1];

      //Update the lines state depending on the user action
      if (updatedLines.length === 0 || typeof updatedLines === "undefined") {
        //If length of the lines state is zero there needs to be no further checking, the object can just be pushed to the array
        updatedLines = [{ right: newElement }];

        //Highlight the selected circle and the opposite side
        setHighlightSelectedCircle(id);
        setHighlightSide("left");
      } else if (lastLineElement.left !== undefined && lastLineElement.right !== undefined) {
        //Set the right property of a new line, but it's not the first line by checking if both elements (left/right) of the line before are set.
        updatedLines.push({ right: newElement });

        //Highlight the clicked circle and the opposite side
        setHighlightSelectedCircle(id);
        setHighlightSide("left");
      } else if (lastLineElement.right === undefined && lastLineElement.left !== undefined) {
        //Case if the user first clicks a left side element

        const lastItemIndex = (updatedLines?.length ?? 0) - 1;

        // This part ensures that no duplicate lines are added
        // Loop through each item in the array using reduce
        updatedLines = (updatedLines || []).reduce((accumulator, item, currentIndex) => {
          // Check if this is the last item in the array
          if (currentIndex === lastItemIndex) {
            // Find the index of the item we want to update
            const index = updatedLines?.findIndex((item) => {
              return (
                item.left?.getAttribute("data-ident") === lastLineElement.left?.getAttribute("data-ident") &&
                item.right?.getAttribute("data-ident") === id
              );
            });

            // If the item is already at the beginning of the array, don't modify it
            if ((index ?? 0) >= 0) {
              // Don't add anything to the accumulator
              console.warn("Line already exists");
              //return
            } else if (index < 0) {
              // Create a copy of the item with the 'right' property updated
              const updatedItem = { ...item, right: newElement };
              // Add the updated item to the accumulator
              accumulator?.push(updatedItem);
            }
          } else {
            // This is not the last item in the array, so add it to the accumulator unchanged
            accumulator?.push(item);
          }

          // Return the accumulator for the next iteration
          return accumulator;
        }, [] as IExtendedMatchLine[]);

        //Remove the highlights
        setHighlightSelectedCircle(null);
        setHighlightSide(null);
      } else if (lastLineElement.left === undefined && lastLineElement.right !== undefined) {
        //Case if the user clicks a right element but then clicks another right element, so just the most recent selected circle is used
        updatedLines[(updatedLines.length ?? 0) - 1].right = newElement;

        //Highlight the circle the user clicked on (the opposite side is already highlighted)
        setHighlightSelectedCircle(id);
      }

      //Update lines array
      setLines(() => [...updatedLines]);
    },
    [lines, formDisabled]
  );

  const handleLineRemove = (e: React.SyntheticEvent) => {
    if (formDisabled) return;

    const id = e.currentTarget.id.split("_remove-btn")[0]; //Format: left-x_right-x_remove-btn
    const [idLeft, idRight] = id.split("_");

    setLines((prev) => {
      return prev.filter((item) => {
        const leftLineId = item.left?.getAttribute("data-ident");
        const rightLineId = item.right?.getAttribute("data-ident");

        return leftLineId !== idLeft || rightLineId !== idRight;
      });
    });
  };

  //Remove all the lines from the state
  const removeAllLines = () => {
    setHighlightSelectedCircle(null);
    setHighlightSide(null);
    //Reset the state to empty array
    setLines([]);
  };

  //Imperative Handle
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
    checkAnswer() {
      setHighlightSelectedCircle(null);
      setHighlightSide(null);

      //Remove line if property (right or left) is missing
      const filteredLines = lines.filter((line) => line.left && line.right);

      //Check if all the elements in solution is also present in the lines array (state)
      const everySolutionInState =
        options.correctMatches?.every((match) => {
          const isEqualTest = filteredLines.some((line) => {
            const matchObject = {
              left: line.left?.getAttribute("data-ident"),
              right: line.right?.getAttribute("data-ident"),
            };

            return isEqual(match, matchObject);
          });

          return isEqualTest;
        }) ?? true;

      //Check if every option matches the solution and compare the length of the arrays, so the user can't trick the program by matching all possibilities.
      //And return boolean (if is correct) to question form
      return everySolutionInState && options.correctMatches?.length === filteredLines.length;
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
        />
      );
    },

    //Reset User selection
    resetSelection() {
      removeAllLines();
    },

    //Reset States (Could be that updating the refs isn't needed)
    resetAndShuffleOptions() {
      //Reset lines array
      removeAllLines();

      //Reset the refs
      left.current = [];
      right.current = [];

      //Reshuffle the options
      const leftShuffle = shuffleArray(options.leftSide || []);
      const rightShuffle = shuffleArray(options.rightSide || []);

      //Update the state
      setShuffledLeftOptions(leftShuffle);
      setShuffledRightOptions(rightShuffle);
    },
  }));

  //JSX
  return (
    <div className='question-extended-match'>
      <div className='extended-match-grid'>
        <div className={`ext-match-left-side ${highlightSide === "left" ? "highlight-all-left-circles" : ""}`}>
          {shuffledLeftOptions?.map((item) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`} id={`element-${id}`}>
                <ReactMarkdown
                  className='ext-match-element-text'
                  children={text}
                  urlTransform={normalizeLinkUri}
                  rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
                  remarkPlugins={[remarkMath, remarkGfm]}
                />
                <button
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"} ${
                    highlightSelectedCircle === id && "highlight-single-circle"
                  }`}
                  ref={(el) => (left.current[id as keyof IExtendedMatchLine["left"]] = el)}
                  data-ident={id}
                  type='button'
                  onClick={updateLeftLine}
                  disabled={formDisabled}
                />
              </div>
            );
          })}
        </div>
        <SVGElement lines={lines} handleLineRemove={handleLineRemove} formDisabled={formDisabled} mode='drawable' />
        <div className={`ext-match-right-side ${highlightSide === "right" ? "highlight-all-right-circles" : ""}`}>
          {shuffledRightOptions?.map((item) => {
            const { text, id } = item;
            return (
              <div className='ext-match-element' key={`ext-match-element-${id}`} id={`element-${id}`}>
                <ReactMarkdown
                  className='ext-match-element-text'
                  children={text}
                  urlTransform={normalizeLinkUri}
                  rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
                  remarkPlugins={[remarkMath, remarkGfm]}
                />
                <button
                  className={`ext-match-element-circle ${!formDisabled ? "circle-enabled" : "circle-disabled"} ${
                    highlightSelectedCircle === id && "highlight-single-circle"
                  }`}
                  ref={(el) => (right.current[id as keyof IExtendedMatchLine["right"]] = el)}
                  data-ident={id}
                  type='button'
                  onClick={updateRightLine}
                  disabled={formDisabled}
                />
              </div>
            );
          })}
        </div>
      </div>
      {!formDisabled && (
        <button className='remove-lines-btn' onClick={removeAllLines} type='button'>
          Remove all lines
        </button>
      )}
    </div>
  );
});

interface ISVGDrawable {
  lines: IExtendedMatchLine[];
  handleLineRemove: (e: React.SyntheticEvent) => void;
  formDisabled: boolean;
  mode: "drawable";
}

interface ISVGStatic {
  lines: IExtendedMatchLine[];
  mode: "static";
}

type ISVGElement = ISVGDrawable | ISVGStatic;

export const SVGElement: React.FC<ISVGElement> = (props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgSize = useSize(svgRef as React.MutableRefObject<HTMLElement | null>);
  const svgWidth = svgSize?.width;

  const color = props.mode === "static" ? "gray" : props.formDisabled ? "gray" : "black";

  const removeLineOnEnter = (e: React.KeyboardEvent<SVGCircleElement>) => {
    if (e.key === "Enter" && props.mode === "drawable") {
      props.handleLineRemove(e);
    }
  };

  return (
    <svg className='svg-element' xmlns='http://www.w3.org/2000/svg' ref={svgRef}>
      {/* Fixes an issue on iOS that would result in an incorrect svg size if there are no elements on one side */}
      <rect width='100%' height='100%' fill='transparent' />
      {/* Map over each complete line */}
      {props.lines
        .filter((item) => item.left && item.right)
        .map((item) => {
          const y1 = (item.left?.parentElement?.offsetHeight || 0) / 2 + (item.left?.parentElement?.offsetTop || 0);

          const y2 = (item.right?.parentElement?.offsetHeight || 0) / 2 + (item.right?.parentElement?.offsetTop || 0);

          const leftId = item.left?.getAttribute("data-ident");
          const rightId = item.right?.getAttribute("data-ident");

          const lineId = props.mode === "drawable" ? `${leftId}_${rightId}_line` : `${leftId}_${rightId}_line-static`;

          return (
            <g className='line-g' key={`line-wrapper-${props.mode}_${leftId}-${rightId}`}>
              <line x1={0} y1={y1} x2={svgWidth} y2={y2} stroke={color} strokeWidth='2' id={lineId} />
              {props.mode === "drawable" && (
                <>
                  <circle
                    cx={(svgWidth || 0) / 2}
                    cy={(y1 + y2) / 2}
                    r='8'
                    onClick={props.handleLineRemove}
                    onKeyDown={removeLineOnEnter}
                    id={`${leftId}_${rightId}_remove-btn`}
                    fill={color}
                    style={{ cursor: !props.formDisabled ? "pointer" : "not-allowed" }}
                    focusable='true'
                    tabIndex={!props.formDisabled ? 0 : undefined}
                    role={!props.formDisabled ? "button" : undefined}
                    aria-disabled={props.formDisabled}
                  />
                  <g
                    transform={`translate(${(svgWidth || 0) / 2}, ${(y1 + y2) / 2})`}
                    pointerEvents={"none"}
                    className='x-mark'
                  >
                    <line x1={-3} y1={-3} x2={3} y2={3} stroke='white' strokeWidth={2} />
                    <line x1={3} y1={-3} x2={-3} y2={3} stroke='white' strokeWidth={2} />
                  </g>
                </>
              )}
            </g>
          );
        })}
    </svg>
  );
};
