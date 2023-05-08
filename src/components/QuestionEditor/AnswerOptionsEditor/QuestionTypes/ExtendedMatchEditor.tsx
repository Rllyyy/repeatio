import React, { useState, useRef, useEffect } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { useSize } from "../../../../hooks/useSize";
import { IExtendedMatch, IExtendedMatchLine } from "../../../Question/QuestionTypes/ExtendedMatch/ExtendedMatch";
import { TErrors } from "../../QuestionEditor";

import "./test.css";

// Icons
import { HiXMark } from "react-icons/hi2";

type Props = {
  name?: string;
  /*
  options: IExtendedMatch;
  handleEditorChange: (value: IExtendedMatch) => void;
  lastSelected: string;
  setLastSelected: React.Dispatch<React.SetStateAction<string>>;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>; */
};

interface IState extends Omit<IExtendedMatch, "correctMatches"> {
  correctMatches: IExtendedMatchLine[];
}

export const ExtendedMatchEditor: React.FC<Props> = ({
  name,
  /*
  options,
  handleEditorChange,
  lastSelected,
  setLastSelected,
  answerOptionsError,
  setErrors, */
}) => {
  const [testOptions, setTestOptions] = useState<IState>({ leftSide: [], rightSide: [], correctMatches: [] });

  const [highlightRight, setHighlightRight] = useState(false);
  const [highlightLeft, setHighlightLeft] = useState(false);
  const [highlightSelectedCircle, setHighlightSelectedCircle] = useState<string | null>();

  const left = useRef<Array<HTMLButtonElement | null>>(testOptions.leftSide.map(() => null) || []);
  const right = useRef<Array<HTMLButtonElement | null>>(testOptions.rightSide.map(() => null) || []);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const side = e.target.id.split("-")[1] === "left" ? "leftSide" : "rightSide";

    setTestOptions((prev) => {
      return {
        ...prev,
        [side]: prev[side].map((item) => {
          if (item.id === e.target.id.split("textarea-")[1]) {
            return { ...item, text: e.target.value };
          } else {
            return { ...item };
          }
        }),
      };
    });
  };

  const handleElementAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const sideShort = e.currentTarget.id.split("-")[1] as "left" | "right";

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    const newOption = { id: `${findUniqueID(testOptions[side] ?? [], sideShort)}`, text: "" };

    setTestOptions((prev) => {
      return {
        ...prev,
        [side]: [...(prev[side] ?? []), newOption],
      };
    });
  };

  const handleElementRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const sideShort = (e.target as HTMLButtonElement).id.split("-")[2];
    const id = (e.target as HTMLButtonElement).id.split("remove-btn-")[1];

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: [
          ...prev.correctMatches.filter((item) => {
            const lineLeftId = item.left?.id.split("add-line-")[1];
            const lineRightId = item.right?.id.split("add-line-")[1];
            return lineRightId !== id && lineLeftId !== id;
          }),
        ],
        [side]: prev[side].filter((item) => item.id !== id),
      };
    });

    // Remove the highlight
    if (id === highlightSelectedCircle) {
      setHighlightSelectedCircle(null);
      setHighlightLeft(false);
      setHighlightRight(false);
    }
  };

  const handleLineRemove = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("_circle")[0]; //Format: left-x_right-x_circle

    const [idLeft, idRight] = id.split("_");

    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: prev.correctMatches.filter((item) => {
          const lineLeftId = item.left?.id.split("add-line-")[1];
          const lineRightId = item.right?.id.split("add-line-")[1];

          return lineLeftId !== idLeft || lineRightId !== idRight;
        }),
      };
    });
  };

  /* const updateLeftLine = (index: number) => {
    // Get the current circle element from the left ref object using the circleIndex
    const circle = left.current[index];
    //console.log(circle);

    // Get the last line element from the lines state
    //const lastLine = testOptions.correctMatches[(testOptions.correctMatches?.length || 0) - 1];
    const lastLine = testOptions.correctMatches[testOptions.correctMatches.length - 1];

    if (!lastLine || (lastLine.left !== undefined && lastLine.right !== undefined)) {
      // If there is no last line element or both left and right properties are already set,
      // add a new line element with the left property set to the current circle element,
      // and highlight the selected circle and the opposite side.

      testOptions.correctMatches.push({ left: circle });
      //setHighlightSelectedCircle(`left-${circleIndex}`);
      //setHighlightRight(true);
      console.log("1");
    }
    // If the last line element has the right property set and the left property not set,
    // set the left property to the current circle element, remove the highlight from the single circle and the whole left section.
    else if (lastLine.right !== undefined && lastLine.left === undefined) {
      lastLine.left = circle;
      //setHighlightSelectedCircle(null);
      //setHighlightLeft(false);
      console.log("2");

      //console.log(duplicateLineExists);
    }
    // If the last line element has the left property set and the right property not set,
    // set the left property to the current circle element and highlight the selected circle.
    else if (lastLine.left !== undefined && lastLine.right === undefined) {
      lastLine.left = circle;
      //setHighlightSelectedCircle(`left-${circleIndex}`);
      console.log("3");
    }

    // Update the lines state with the modified array.
    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: [...testOptions.correctMatches],
      };
    });
  }; */

  // console.log(left.current);

  const updateLeftLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];
    // Get the current circle element from the left ref object using the circleIndex
    const circle = left.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    //const lastLine = testOptions.correctMatches[(testOptions.correctMatches?.length || 0) - 1];
    const lastLine = testOptions.correctMatches[testOptions.correctMatches.length - 1];
    //console.log(lastLine);

    if (testOptions.correctMatches.length === 0) {
      testOptions.correctMatches.push({ left: circle });

      setHighlightSelectedCircle(id);
      setHighlightRight(true);
    } else if (lastLine.right !== undefined && lastLine.left !== undefined) {
      testOptions.correctMatches.push({ left: circle });
      setHighlightRight(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine.left === undefined && lastLine.right !== undefined) {
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { ...item, left: circle };
        } else {
          return item;
        }
      });
      setHighlightLeft(false);
      setHighlightSelectedCircle(null);
    } else if (lastLine.right === undefined && lastLine.left !== undefined) {
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { left: circle };
        } else {
          return item;
        }
      });
      setHighlightSelectedCircle(id);
    } else {
      console.warn("Update left line failed");
    }

    // Update the lines state with the modified array.
    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: [...testOptions.correctMatches],
      };
    });
  };

  const updateRightLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];
    // Get the current circle element from the left ref object using the circleIndex
    const circle = right.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    const lastLine = testOptions.correctMatches[testOptions.correctMatches.length - 1];

    if (testOptions.correctMatches.length === 0) {
      testOptions.correctMatches.push({ right: circle });
      setHighlightLeft(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine.left !== undefined && lastLine.right !== undefined) {
      testOptions.correctMatches.push({ right: circle });
      setHighlightLeft(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine.right === undefined && lastLine.left !== undefined) {
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { ...item, right: circle };
        } else {
          return item;
        }
      });
      setHighlightRight(false);
      setHighlightSelectedCircle(null);
    } else if (lastLine.left === undefined && lastLine.right !== undefined) {
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { right: circle };
        } else {
          return item;
        }
      });
      setHighlightSelectedCircle(id);
    } else {
      console.warn("Update right line failed");
    }

    // Update the lines state with the modified array.
    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: [...testOptions.correctMatches],
      };
    });
  };

  // Update the refs inside the state to match after rerender
  useEffect(() => {
    setTestOptions((prev) => {
      let updated = prev.correctMatches.map(({ left: leftElement, right: rightElement }) => {
        const leftId = leftElement?.id.split("add-line-")[1];
        const rightId = rightElement?.id.split("add-line-")[1];
        // get the ref
        if (leftId && rightId) {
          return {
            left: left.current[leftId as keyof IExtendedMatchLine["left"]],
            right: right.current[rightId as keyof IExtendedMatchLine["right"]],
          };
        } else if (leftId) {
          return { left: left.current[leftId as keyof IExtendedMatchLine["left"]] };
        } else {
          return { right: right.current[rightId as keyof IExtendedMatchLine["right"]] };
        }
      });
      return {
        ...prev,
        correctMatches: updated,
      };
    });

    //TODO evaluate if a return is needed here
  }, [testOptions.rightSide, testOptions.leftSide]);

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
      <div
        style={{
          flexGrow: "1",
          flexShrink: "1",
          gap: "6px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
        }}
        className={`editor-ext-match-left ${highlightLeft ? "highlight-editor-left-circles" : ""}`}
      >
        {testOptions?.leftSide?.map((item) => {
          return (
            <div
              key={item.id}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", position: "relative" }}
              aria-label={`Element ${item.id}`}
            >
              <button
                type='button'
                style={{
                  lineHeight: "0",
                  padding: "4px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "red",
                  cursor: "pointer",
                }}
                id={`remove-btn-${item.id}`}
                onClick={handleElementRemove}
                aria-label={`Remove element ${item.id}`}
              >
                <HiXMark style={{ strokeWidth: "2", height: "20px", width: "20px", pointerEvents: "none" }} />
              </button>
              <TextareaAutoSize
                value={item.text}
                onChange={handleTextAreaChange}
                id={`textarea-${item.id}`}
                spellCheck='false'
                autoComplete='false'
                required
                style={{ padding: "4px 12px" }}
                aria-label={`Element ${item.id} Textarea`}
              />
              <button
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  right: "-9px",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                className={`add-line-circle ${highlightSelectedCircle === item.id ? "editor-highlight-circle" : ""}`}
                ref={(el) => (left.current[item.id as keyof IExtendedMatchLine["left"]] = el)}
                type='button'
                id={`add-line-${item.id}`}
                onClick={updateLeftLine}
              />
            </div>
          );
        })}
        <button
          type='button'
          style={{
            border: "1px solid lightgray",
            marginLeft: "30px",
            fontSize: "24px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleElementAdd}
          id={`add-left-element`}
          aria-label='Add left element'
        >
          +
        </button>
      </div>
      <SVGElement correctMatches={testOptions.correctMatches} handleLineRemove={handleLineRemove} />
      <div
        style={{
          flexGrow: "1",
          flexShrink: "1",
          gap: "6px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
        }}
      >
        {testOptions?.rightSide?.map((item) => {
          return (
            <div
              key={item.id}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", position: "relative" }}
              aria-label={`Element ${item.id}`}
              className={`editor-ext-match-right ${highlightRight ? "highlight-editor-right-circles" : ""}`}
            >
              <button
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  left: "-9px",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                type='button'
                id={`add-line-${item.id}`}
                ref={(el) => (right.current[item.id as keyof IExtendedMatchLine["right"]] = el)}
                onClick={updateRightLine}
                className={`add-line-circle ${highlightSelectedCircle === item.id ? "editor-highlight-circle" : ""}`}
              />
              <TextareaAutoSize
                value={item.text}
                onChange={handleTextAreaChange}
                id={`textarea-${item.id}`}
                spellCheck='false'
                autoComplete='false'
                required
                style={{ padding: "4px 12px" }}
                aria-label={`Element ${item.id} Textarea`}
              />
              <button
                type='button'
                style={{
                  lineHeight: "0",
                  padding: "4px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "red",
                  cursor: "pointer",
                }}
                id={`remove-btn-${item.id}`}
                onClick={handleElementRemove}
                aria-label={`Remove element ${item.id}`}
              >
                <HiXMark style={{ strokeWidth: "2", height: "20px", width: "20px", pointerEvents: "none" }} />
              </button>
            </div>
          );
        })}
        <button
          type='button'
          style={{
            border: "1px solid lightgray",
            fontSize: "24px",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "30px",
          }}
          onClick={handleElementAdd}
          id={`add-right-element`}
          aria-label='Add right element'
        >
          +
        </button>
      </div>
    </div>
  );
};

function findUniqueID(
  existingElements: IExtendedMatch["leftSide"] | IExtendedMatch["rightSide"],
  side: "left" | "right"
) {
  //IF can't find
  let newID;
  for (let indexID = 0; indexID <= existingElements.length; indexID++) {
    const idExists = existingElements.find((element) => element.id === `${side}-${indexID}`);
    if (!idExists) {
      newID = `${side}-${indexID}`;
      break;
    }
  }
  return newID || `${side}-0`;
}

interface ISVGElement {
  correctMatches: IState["correctMatches"];
  handleLineRemove: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
}

const SVGElement: React.FC<ISVGElement> = ({ correctMatches, handleLineRemove }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgSize = useSize(svgRef as React.MutableRefObject<HTMLElement | null>);
  const svgWidth = svgSize?.width;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      ref={svgRef}
      style={{ maxWidth: "300px", width: "100%", flexShrink: "1.5" }}
    >
      {correctMatches
        ?.filter((item) => item.left && item.right)
        .map((item) => {
          const y1 = (item.left?.parentElement?.clientHeight || 0) / 2 + (item.left?.parentElement?.offsetTop || 0);

          const y2 = (item.right?.parentElement?.clientHeight || 0) / 2 + (item.right?.parentElement?.offsetTop || 0);

          const leftId = item.left?.id.split("add-line-")[1];
          const rightId = item.right?.id.split("add-line-")[1];

          const uID = `${leftId}_${rightId}`;

          return (
            <g className='line-container' key={uID} id={uID}>
              <line
                x1={0}
                y1={y1}
                x2={svgWidth}
                y2={y2}
                stroke='black'
                strokeWidth='2'
                className='line'
                id={`${uID}_line`}
              />
              <circle
                cx={(svgWidth || 0) / 2}
                cy={(y1 + y2) / 2}
                r='8'
                onClick={handleLineRemove}
                role='button'
                id={`${uID}_circle`}
                style={{ cursor: "pointer" }}
              />
              <g
                transform={`translate(${(svgWidth || 0) / 2}, ${(y1 + y2) / 2})`}
                pointerEvents={"none"}
                className='x-mark'
              >
                <line x1={-3} y1={-3} x2={3} y2={3} stroke='white' strokeWidth={2} />
                <line x1={3} y1={-3} x2={-3} y2={3} stroke='white' strokeWidth={2} />
              </g>
            </g>
          );
        })}
    </svg>
  );
};

//TODO
// - all elements textarea?
// - remove class line? from line
// - rename #remove-btn-right-0 to #remove-element-right-0
// - edit
// - remove console logs
// - correct matches should have min length 1 else error on submit
// -remove test.css
// - add highlight ✔
// replace margin for add button with display grid
// Interface for svg ✔
// - reset errors on change
// - replace + with svg
