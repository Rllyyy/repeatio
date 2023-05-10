import React, { useState, useRef, useEffect } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { useSize } from "../../../../hooks/useSize";

import "./ExtendedMatchEditor.css";

// Icons
import { HiXMark } from "react-icons/hi2";

// Interfaces and types
import { IQuestion } from "../../../Question/useQuestion";
import { IExtendedMatch, IExtendedMatchLine } from "../../../Question/QuestionTypes/ExtendedMatch/ExtendedMatch";
import { TErrors } from "../../QuestionEditor";
import { objectWithoutProp } from "../../helpers";

export interface IExtendedMatchTemp extends Omit<IExtendedMatch, "correctMatches"> {
  correctMatches: IExtendedMatchLine[] | undefined;
}

type Props = {
  name?: string;
  setQuestion: React.Dispatch<React.SetStateAction<IQuestion>>;
  options: IExtendedMatchTemp;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>;
};

export const ExtendedMatchEditor: React.FC<Props> = ({ name, options, setQuestion, answerOptionsError, setErrors }) => {
  const [highlightRight, setHighlightRight] = useState(false);
  const [highlightLeft, setHighlightLeft] = useState(false);
  const [highlightSelectedCircle, setHighlightSelectedCircle] = useState<string | null>();

  const left = useRef<Array<HTMLButtonElement | null>>([]);
  const right = useRef<Array<HTMLButtonElement | null>>([]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const side = e.target.id.split("-")[1] === "left" ? "leftSide" : "rightSide";

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...prev.answerOptions,
          [side]: (prev.answerOptions as IExtendedMatchTemp)?.[side]?.map((item) => {
            if (item.id === e.target.id.split("textarea-")[1]) {
              return { ...item, text: e.target.value };
            } else {
              return { ...item };
            }
          }),
        },
      };
    });
  };

  const handleElementAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const sideShort = e.currentTarget.id.split("-")[1] as "left" | "right";

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    const newOption = { id: `${findUniqueID(options?.[side] ?? [], sideShort)}`, text: "" };

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...prev.answerOptions,
          [side]: [...((prev.answerOptions as IExtendedMatchTemp)?.[side] ?? []), newOption],
        },
      };
    });
  };

  const handleElementRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const sideShort = (e.target as HTMLButtonElement).id.split("-")[2];
    const id = (e.target as HTMLButtonElement).id.split("remove-element-")[1];

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...(prev.answerOptions as IExtendedMatchTemp),
          correctMatches:
            (prev.answerOptions as IExtendedMatchTemp)?.correctMatches?.filter((item) => {
              const lineLeftId = item.left?.id.split("add-line-")[1];
              const lineRightId = item.right?.id.split("add-line-")[1];
              return lineRightId !== id && lineLeftId !== id;
            }) || [],
          [side]: (prev.answerOptions as IExtendedMatchTemp)?.[side]?.filter((item) => item.id !== id),
        },
      };
    });

    // Remove the highlight
    if (id === highlightSelectedCircle) {
      setHighlightSelectedCircle(null);
      setHighlightLeft(false);
      setHighlightRight(false);
    }
  };

  const handleLineRemove = (e: React.SyntheticEvent) => {
    const id = e.currentTarget.id.split("_circle")[0]; //Format: left-x_right-x_circle

    const [idLeft, idRight] = id.split("_");

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...(prev.answerOptions as IExtendedMatchTemp),
          correctMatches: (prev.answerOptions as IExtendedMatchTemp).correctMatches?.filter((item) => {
            const lineLeftId = item.left?.id.split("add-line-")[1];
            const lineRightId = item.right?.id.split("add-line-")[1];

            return lineLeftId !== idLeft || lineRightId !== idRight;
          }),
        },
      };
    });
  };

  const updateLeftLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];
    // Get the current circle element from the left ref object using the circleIndex
    const circle = left.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    //const lastLine = testOptions.correctMatches[(testOptions.correctMatches?.length || 0) - 1];
    const lastLine = options?.correctMatches?.[options?.correctMatches?.length - 1];

    if (options.correctMatches?.length === 0 || typeof options.correctMatches === "undefined") {
      //options.correctMatches?.push({ left: circle });
      options.correctMatches = [{ left: circle }];

      setHighlightSelectedCircle(id);
      setHighlightRight(true);
    } else if (lastLine?.right !== undefined && lastLine.left !== undefined) {
      options?.correctMatches?.push({ left: circle });
      setHighlightRight(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine?.left === undefined && lastLine?.right !== undefined) {
      // Find the index of the last item in the array
      const lastItemIndex = (options?.correctMatches?.length ?? 0) - 1;

      // Loop through each item in the array using reduce
      options.correctMatches = (options.correctMatches || []).reduce((accumulator, item, currentIndex) => {
        // Check if this is the last item in the array
        if (currentIndex === lastItemIndex) {
          // Find the index of the item we want to update
          const index = options?.correctMatches?.findIndex((otherItem) => {
            return (
              otherItem.right?.id.split("add-line-")[1] === lastLine?.right?.id.split("add-line-")[1] &&
              otherItem.left?.id.split("add-line-")[1] === id
            );
          });

          // If the item is already at the beginning of the array, don't modify it
          if (index === 0) {
            // Don't add anything to the accumulator
            console.warn("Line already exists");
          } else {
            // Create a copy of the item with the 'left' property updated
            const updatedItem = { ...item, left: circle };
            // Add the updated item to the accumulator
            accumulator?.push(updatedItem);
          }
        } else {
          // This is not the last item in the array, so add it to the accumulator unchanged
          accumulator?.push(item);
        }

        // Return the accumulator for the next iteration
        return accumulator;
      }, [] as IExtendedMatchTemp["correctMatches"]);

      setHighlightLeft(false);
      setHighlightSelectedCircle(null);

      if (answerOptionsError) {
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
      }
    } else if (lastLine?.right === undefined && lastLine?.left !== undefined) {
      options.correctMatches = options.correctMatches?.map((item, currentIndex) => {
        if (currentIndex === (options.correctMatches?.length ?? 0) - 1) {
          return { left: circle };
        } else {
          return item;
        }
      });
      setHighlightSelectedCircle(id);
    } else {
      console.warn("Update left line failed");
    }

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...(prev.answerOptions as IExtendedMatchTemp),
          correctMatches: [...(options.correctMatches || [])],
        },
      };
    });
  };

  const updateRightLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];
    // Get the current circle element from the left ref object using the circleIndex
    const circle = right.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    const lastLine = options.correctMatches?.[options.correctMatches?.length - 1];

    if (options.correctMatches?.length === 0 || typeof options.correctMatches === "undefined") {
      options.correctMatches = [{ right: circle }];

      setHighlightLeft(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine?.left !== undefined && lastLine.right !== undefined) {
      options.correctMatches?.push({ right: circle });
      setHighlightLeft(true);
      setHighlightSelectedCircle(id);
    } else if (lastLine?.right === undefined && lastLine?.left !== undefined) {
      const lastItemIndex = (options?.correctMatches?.length ?? 0) - 1;

      // Loop through each item in the array using reduce
      options.correctMatches = (options.correctMatches || []).reduce((accumulator, item, currentIndex) => {
        // Check if this is the last item in the array
        if (currentIndex === lastItemIndex) {
          // Find the index of the item we want to update
          const index = options?.correctMatches?.findIndex((otherItem) => {
            return (
              otherItem.left?.id.split("add-line-")[1] === lastLine?.left?.id.split("add-line-")[1] &&
              otherItem.right?.id.split("add-line-")[1] === id
            );
          });

          // If the item is already at the beginning of the array, don't modify it
          if (index === 0) {
            // Don't add anything to the accumulator
            console.warn("Line already exists");
          } else {
            // Create a copy of the item with the 'right' property updated
            const updatedItem = { ...item, right: circle };
            // Add the updated item to the accumulator
            accumulator?.push(updatedItem);
          }
        } else {
          // This is not the last item in the array, so add it to the accumulator unchanged
          accumulator?.push(item);
        }

        // Return the accumulator for the next iteration
        return accumulator;
      }, [] as IExtendedMatchTemp["correctMatches"]);

      setHighlightRight(false);
      setHighlightSelectedCircle(null);

      if (answerOptionsError) {
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
      }
    } else if (lastLine?.left === undefined && lastLine?.right !== undefined) {
      options.correctMatches = options.correctMatches?.map((item, currentIndex) => {
        if (currentIndex === (options.correctMatches?.length ?? 0) - 1) {
          return { right: circle };
        } else {
          return item;
        }
      });
      setHighlightSelectedCircle(id);
    } else {
      console.warn("Update right line failed");
    }

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...(prev.answerOptions as IExtendedMatchTemp),
          correctMatches: [...(options.correctMatches || [])],
        },
      };
    });
  };

  // Update the refs inside the state to match after rerender
  useEffect(() => {
    setQuestion((prev) => {
      let updated = (prev.answerOptions as IExtendedMatchTemp)?.correctMatches?.map(
        ({ left: leftElement, right: rightElement }) => {
          if (typeof leftElement === "string" || typeof rightElement === "string") {
            if (leftElement && rightElement) {
              return {
                left: left.current[leftElement as keyof IExtendedMatchLine["left"]],
                right: right.current[rightElement as keyof IExtendedMatchLine["right"]],
              };
            } else if (leftElement) {
              return {
                left: left.current[leftElement as keyof IExtendedMatchLine["left"]],
              };
            } else {
              return {
                right: right.current[rightElement as keyof IExtendedMatchLine["right"]],
              };
            }
          }

          const leftId = leftElement?.id?.split("add-line-")[1];
          const rightId = rightElement?.id?.split("add-line-")[1];
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
        }
      );

      return {
        ...prev,
        answerOptions: {
          ...(prev.answerOptions as IExtendedMatchTemp),
          correctMatches: updated || [],
        },
      };
    });
  }, [options?.rightSide, options?.leftSide, setQuestion]);

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
        {options?.leftSide?.map((item) => {
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
                id={`remove-element-${item.id}`}
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
      <SVGElement correctMatches={options?.correctMatches} handleLineRemove={handleLineRemove} />
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
        className={`editor-ext-match-right ${highlightRight ? "highlight-editor-right-circles" : ""}`}
      >
        {options?.rightSide?.map((item) => {
          return (
            <div
              key={item.id}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", position: "relative" }}
              aria-label={`Element ${item.id}`}
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
                id={`remove-element-${item.id}`}
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
  for (let indexID = 0; indexID <= (existingElements?.length ?? 0); indexID++) {
    const idExists = existingElements?.find((element) => element.id === `${side}-${indexID}`);
    if (!idExists) {
      newID = `${side}-${indexID}`;
      break;
    }
  }
  return newID || `${side}-0`;
}

interface ISVGElement {
  correctMatches: IExtendedMatchTemp["correctMatches"];
  handleLineRemove: (e: React.SyntheticEvent) => void;
}

const SVGElement: React.FC<ISVGElement> = ({ correctMatches, handleLineRemove }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgSize = useSize(svgRef as React.MutableRefObject<HTMLElement | null>);
  const svgWidth = svgSize?.width;

  const removeLineOnEnter = (e: React.KeyboardEvent<SVGCircleElement>) => {
    if (e.key === "Enter") {
      handleLineRemove(e);
    }
  };

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      ref={svgRef}
      style={{ maxWidth: "300px", width: "100%", flexShrink: "1.5" }}
    >
      {correctMatches
        ?.filter((item) => item.left && item.right && typeof item.left === "object" && typeof item.right === "object")
        .map((item) => {
          const y1 = (item.left?.parentElement?.clientHeight || 0) / 2 + (item.left?.parentElement?.offsetTop || 0);

          const y2 = (item.right?.parentElement?.clientHeight || 0) / 2 + (item.right?.parentElement?.offsetTop || 0);

          const leftId = item.left?.id?.split("add-line-")[1];
          const rightId = item.right?.id?.split("add-line-")[1];

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
                onKeyDown={removeLineOnEnter}
                role='button'
                id={`${uID}_circle`}
                style={{ cursor: "pointer" }}
                focusable='true'
                tabIndex={0}
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
// - edit + tests
// replace margin for add button with display grid
// - add comments
