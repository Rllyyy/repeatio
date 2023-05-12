import React, { useState, useRef, useEffect, PropsWithChildren } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { useSize } from "../../../../hooks/useSize";
import { objectWithoutProp } from "../../helpers";

// CSS
import "./ExtendedMatchEditor.css";

// Icons
import { HiXMark } from "react-icons/hi2";

// Interfaces and types
import { IQuestion } from "../../../Question/useQuestion";
import {
  IExtendedMatch,
  IExtendedMatchItem,
  IExtendedMatchLine,
} from "../../../Question/QuestionTypes/ExtendedMatch/ExtendedMatch";
import { TErrors } from "../../QuestionEditor";

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
  const [highlightSide, setHighlightSide] = useState<"left" | "right" | null>(null);
  const [highlightSelectedCircle, setHighlightSelectedCircle] = useState<string | null>();

  const left = useRef<Array<HTMLButtonElement | null>>([]);
  const right = useRef<Array<HTMLButtonElement | null>>([]);

  // Update the text of the element
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
              return item;
            }
          }),
        },
      };
    });
  };

  // Add an element
  const handleElementAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const sideShort = e.currentTarget.id.split("-")[1] as "left" | "right";

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    // Create a new element
    const newElement = { id: `${findUniqueID(options?.[side] ?? [], sideShort)}`, text: "" };

    setQuestion((prev) => {
      return {
        ...prev,
        answerOptions: {
          ...prev.answerOptions,
          // Add the element to the side
          [side]: [...((prev.answerOptions as IExtendedMatchTemp)?.[side] ?? []), newElement],
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
          // remove a object from the correct matches if one of the elements is removed
          correctMatches:
            (prev.answerOptions as IExtendedMatchTemp)?.correctMatches?.filter((item) => {
              const lineLeftId = item.left?.id.split("add-line-")[1];
              const lineRightId = item.right?.id.split("add-line-")[1];
              return lineRightId !== id && lineLeftId !== id;
            }) || [],
          // remove the item from the side
          [side]: (prev.answerOptions as IExtendedMatchTemp)?.[side]?.filter((item) => item.id !== id),
        },
      };
    });

    // Remove the highlight
    if (id === highlightSelectedCircle) {
      setHighlightSelectedCircle(null);
      setHighlightSide(null);
    }
  };

  // Remove a line
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

  // Update the left point of a line
  const updateLeftLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];

    // Get the current circle element from the left ref object using the circleIndex
    const circle = left.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    const lastLine = options?.correctMatches?.[options?.correctMatches?.length - 1];

    if (options.correctMatches?.length === 0 || typeof options.correctMatches === "undefined") {
      // Add a new array of correct matches if there isn't one
      options.correctMatches = [{ left: circle }];

      // Highlight the circle and the opposite side
      setHighlightSelectedCircle(id);
      setHighlightSide("right");
    } else if (lastLine?.right !== undefined && lastLine.left !== undefined) {
      // Add a new object to the correctMatches array if both previous elements are present
      options?.correctMatches?.push({ left: circle });

      // Highlight the clicked circle and the opposite side
      setHighlightSelectedCircle(id);
      setHighlightSide("right");
    } else if (lastLine?.left === undefined && lastLine?.right !== undefined) {
      // Update the last element in the options array if the left property is undefined but right defined

      // This part ensures that no duplicate lines are added
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

      // Deselect the clicked element and remove the highlight from the opposite side
      setHighlightSelectedCircle(null);
      setHighlightSide(null);

      // Remove any present errors on the answerOptions
      if (answerOptionsError) {
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
      }
    } else if (lastLine?.right === undefined && lastLine?.left !== undefined) {
      // This case gets executed if the user clicks twice on one side (e.g. left-0 and then left-1 before right-0)
      options.correctMatches[(options.correctMatches?.length ?? 0) - 1].left = circle;

      // Highlight the new circle
      setHighlightSelectedCircle(id);
    } else {
      //Show warning in console if no case was meet
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

  // Update the right point of a line
  const updateRightLine = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const id = e.currentTarget.id.split("add-line-")[1];

    // Get the current circle element from the left ref object using the circleIndex
    const circle = right.current[id as keyof IExtendedMatchLine["right"]];

    // Get the last line element from the lines state
    const lastLine = options.correctMatches?.[options.correctMatches?.length - 1];

    if (options.correctMatches?.length === 0 || typeof options.correctMatches === "undefined") {
      // Add a new array of correct matches if there isn't one
      options.correctMatches = [{ right: circle }];

      // Highlight the circle and the opposite side
      setHighlightSide("left");
      setHighlightSelectedCircle(id);
    } else if (lastLine?.left !== undefined && lastLine.right !== undefined) {
      // Add a new object to the correctMatches array if both previous elements are present
      options.correctMatches?.push({ right: circle });

      // Highlight the clicked circle and the opposite side
      setHighlightSide("left");
      setHighlightSelectedCircle(id);
    } else if (lastLine?.right === undefined && lastLine?.left !== undefined) {
      // Update the last element in the options array if the left property is undefined but right defined
      const lastItemIndex = (options?.correctMatches?.length ?? 0) - 1;

      // This part ensures that no duplicate lines are added
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

      // Deselect the clicked element and remove the highlight from the opposite side
      setHighlightSelectedCircle(null);
      setHighlightSide(null);

      // Remove any present errors on the answerOptions
      if (answerOptionsError) {
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
      }
    } else if (lastLine?.left === undefined && lastLine?.right !== undefined) {
      // This case gets executed if the user clicks twice on one side (e.g. right-0 and then right-1 before left-0)
      options.correctMatches[(options.correctMatches?.length ?? 0) - 1].right = circle;

      // Highlight the new circle
      setHighlightSelectedCircle(id);
    } else {
      //Show warning in console if no case was meet
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
          // When editing a question, the elements inside correctMatches are arrays of strings not refs.
          // They have to be converted to refs after the initial render.
          // After the first render the elements will be of type object not string
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

          // Get the ids of the element by removing the id prefix add-line-
          const leftId = leftElement?.id?.split("add-line-")[1];
          const rightId = rightElement?.id?.split("add-line-")[1];

          // Update the refs
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
      <SideWrapperComponent side='left' highlightSide={highlightSide}>
        {options?.leftSide?.map((item) => {
          return (
            <Element key={item.id} id={item.id}>
              <RemoveElementButton id={item.id} handleElementRemove={handleElementRemove} />
              <ElementTextarea id={item.id} text={item.text} handleTextAreaChange={handleTextAreaChange} />
              <AddLineButton
                id={item.id}
                highlightSelectedCircle={highlightSelectedCircle}
                sideCurrent={left.current}
                updateLine={updateLeftLine}
                side='left'
              />
            </Element>
          );
        })}
        <AddElementButton side='left' handleElementAdd={handleElementAdd} />
      </SideWrapperComponent>
      <SVGElement correctMatches={options?.correctMatches} handleLineRemove={handleLineRemove} />
      <SideWrapperComponent side='right' highlightSide={highlightSide}>
        {options?.rightSide?.map((item) => {
          return (
            <Element key={item.id} id={item.id}>
              <AddLineButton
                id={item.id}
                highlightSelectedCircle={highlightSelectedCircle}
                side='right'
                sideCurrent={right.current}
                updateLine={updateRightLine}
              />
              <ElementTextarea id={item.id} text={item.text} handleTextAreaChange={handleTextAreaChange} />
              <RemoveElementButton id={item.id} handleElementRemove={handleElementRemove} />
            </Element>
          );
        })}
        <AddElementButton side='right' handleElementAdd={handleElementAdd} />
      </SideWrapperComponent>
    </div>
  );
};

/* ---------------------------------- SideWrapperComponent -------------------------------- */
interface ISideWrapperComponent {
  side: "left" | "right";
  highlightSide: "left" | "right" | null;
}

const SideWrapperComponent: React.FC<PropsWithChildren<ISideWrapperComponent>> = ({
  side,
  highlightSide,
  children,
}) => {
  return (
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
      className={`editor-ext-match-${side} ${highlightSide ? `highlight-editor-${highlightSide}-circles` : ""}`}
    >
      {children}
    </div>
  );
};

/* --------------------------------------- Element --------------------------------------- */
interface IElement {
  id: IExtendedMatchItem["id"];
}

const Element: React.FC<PropsWithChildren<IElement>> = ({ id, children }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", position: "relative" }}
      aria-label={`Element ${id}`}
    >
      {children}
    </div>
  );
};

/* ---------------------------------------- AddElementButton -------------------------------- */
interface IAddElementButton {
  side: "left" | "right";
  handleElementAdd: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const AddElementButton: React.FC<IAddElementButton> = ({ side, handleElementAdd }) => {
  return (
    <button
      type='button'
      style={{
        border: "1px solid lightgray",
        fontSize: "24px",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: side === "right" ? "30px" : undefined,
        marginLeft: side === "left" ? "30px" : undefined,
      }}
      onClick={handleElementAdd}
      id={`add-${side}-element`}
      aria-label={`Add ${side} element`}
    >
      +
    </button>
  );
};

/* --------------------------------------- RemoveElementButton -------------------------------- */
interface IRemoveElementButton {
  id: IExtendedMatchItem["id"];
  handleElementRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const RemoveElementButton: React.FC<IRemoveElementButton> = ({ id, handleElementRemove }) => {
  return (
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
      id={`remove-element-${id}`}
      onClick={handleElementRemove}
      aria-label={`Remove element ${id}`}
    >
      <HiXMark style={{ strokeWidth: "2", height: "20px", width: "20px", pointerEvents: "none" }} />
    </button>
  );
};

/* ------------------------------------------ ElementTextarea --------------------------------- */
interface IElementTextarea {
  id: IExtendedMatchItem["id"];
  text: IExtendedMatchItem["text"];
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ElementTextarea: React.FC<IElementTextarea> = ({ id, text, handleTextAreaChange }) => {
  return (
    <TextareaAutoSize
      value={text}
      onChange={handleTextAreaChange}
      id={`textarea-${id}`}
      spellCheck='false'
      autoComplete='false'
      required
      style={{ padding: "4px 12px" }}
      aria-label={`Element ${id} Textarea`}
    />
  );
};

/* -------------------------------------------- AddLineButton ----------------------------------- */
interface IAddLineButton {
  id: IExtendedMatchItem["id"];
  highlightSelectedCircle: string | null | undefined;
  side: "left" | "right";
  sideCurrent: (HTMLButtonElement | null)[];
  updateLine: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const AddLineButton: React.FC<IAddLineButton> = ({ id, highlightSelectedCircle, side, sideCurrent, updateLine }) => {
  return (
    <button
      style={{
        position: "absolute",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        right: side === "left" ? "-9px" : undefined,
        left: side === "right" ? "-9px" : undefined,
        borderWidth: "2px",
        borderStyle: "solid",
        backgroundColor: "white",
        cursor: "pointer",
      }}
      className={`add-line-circle ${highlightSelectedCircle === id ? "editor-highlight-circle" : ""}`}
      ref={(el) => (sideCurrent[id as keyof IExtendedMatchLine[typeof side]] = el)}
      type='button'
      id={`add-line-${id}`}
      onClick={updateLine}
    />
  );
};

/* ---------------------------------------------- SVGElement -------------------------------------*/

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
            <g className='line-container' key={`editor-line-container-${uID}`} id={uID}>
              <line
                x1={0}
                y1={y1}
                x2={svgWidth}
                y2={y2}
                stroke='black'
                strokeWidth='2'
                className='line'
                id={`${uID}_line-editor`}
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

/**
 * Find a unique id for extended line element
 * @param existingElements -
 * @param side - left | right
 * @returns a unique id
 */
function findUniqueID(
  existingElements: IExtendedMatch["leftSide"] | IExtendedMatch["rightSide"],
  side: "left" | "right"
) {
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
