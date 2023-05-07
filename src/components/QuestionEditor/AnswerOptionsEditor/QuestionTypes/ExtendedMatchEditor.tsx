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
  options: IExtendedMatch;
  handleEditorChange: (value: IExtendedMatch) => void;
  lastSelected: string;
  setLastSelected: React.Dispatch<React.SetStateAction<string>>;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>;
};

/* const testObj = {
  leftSide: [
    {
      id: "left-0",
      text: "Hello",
    },
    {
      id: "left-1",
      text: "7+4",
    },
  ],
  rightSide: [
    {
      id: "right-0",
      text: "World",
    },
    {
      id: "right-1",
      text: "20",
    },
    {
      id: "right-2",
      text: "11",
    },
  ],
  correctMatches: [],
}; */

interface IState extends Omit<IExtendedMatch, "correctMatches"> {
  correctMatches: IExtendedMatchLine[];
}

export const ExtendedMatchEditor: React.FC<Props> = ({
  name,
  options,
  handleEditorChange,
  lastSelected,
  setLastSelected,
  answerOptionsError,
  setErrors,
}) => {
  const [testOptions, setTestOptions] = useState<IState>({ leftSide: [], rightSide: [], correctMatches: [] });

  const left = useRef<Array<HTMLButtonElement | null>>(testOptions.leftSide.map(() => null) || []);
  const right = useRef<Array<HTMLButtonElement | null>>(testOptions.rightSide.map(() => null) || []);
  //const right = useRef<RefObject<HTMLButtonElement>[] | null | undefined>();

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //console.log(e.target.id);

    const side = e.target.id.split("-")[1] === "left" ? "leftSide" : "rightSide";

    const returnValue = testOptions[side].map((item) => {
      if (item.id === e.target.id.split("textarea-")[1]) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    const returnOptions = {
      ...testOptions,
      [side]: returnValue,
    };

    setTestOptions({ ...returnOptions });
  };

  const handleElementAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    //TODO handle Ref + here
    const sideShort = e.currentTarget.id.split("-")[1] as "left" | "right";

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    const newOption = { id: `${findUniqueID(testOptions[side] ?? [], sideShort)}`, text: "" };

    /* if (sideShort === "left") {
      left.current?.push(null);
      //      console.log("added null");
    } else {
      right.current?.push(null);
    } */

    setTestOptions((prev) => {
      return {
        ...prev,
        [side]: [...(prev[side] ?? []), newOption],
      };
    });
  };

  const handleElementRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    //TODO handle Ref remove here
    const sideShort = (e.target as HTMLButtonElement).id.split("-")[2];
    const id = (e.target as HTMLButtonElement).id.split("remove-btn-")[1];

    const side = sideShort === "left" ? "leftSide" : "rightSide";

    if (sideShort === "left") {
      left.current = [
        ...left.current.filter((item) => {
          return item?.id !== `add-line-${id}` && item !== null;
        }),
      ];
    } else {
      right.current = [
        ...right.current.filter((item) => {
          return item?.id !== `add-line-${id}` && item !== null;
        }),
      ];
    }

    //console.log(right.current);

    const returnValue = testOptions[side].filter((item) => {
      return item.id !== id;
    });

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
        [side]: returnValue,
      };
    });

    // filter out item

    //TODO remove from correct options
  };

  const handleLineRemove = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    const id = e.currentTarget.id; //Format: left-x_right-x

    /*  const idLeft = id.split("_")[0];
    const idRight = id.split("_")[1] */

    const [idLeft, idRight] = id.split("_");

    console.log(idRight);

    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: prev.correctMatches.filter((item, index) => {
          const lineLeftId = item.left?.id.split("add-line-")[1];
          const lineRightId = item.right?.id.split("add-line-")[1];
          //console.log(`${index}: ${lineLeftId} ${idLeft} ${lineRightId} ${idRight} `);

          // return !(lineLeftId === idLeft && lineRightId === idRight);
          return lineLeftId !== idLeft || lineRightId !== idRight;
        }),
      };
    });
    //console.log(id);
  };

  //console.log(left.current);

  //console.log(document.getElementById("add-line-left-1")?.parentElement?.clientHeight);
  //console.log(document.getElementById("add-line-left-1")?.parentElement?.offsetTop);

  /* 12 + 
    document.getElementById("add-line-left-1")?.parentElement?.offsetHeight */

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
    //console.log(left.current[id as string]);
    const id = e.currentTarget.id.split("add-line-")[1];
    // Get the current circle element from the left ref object using the circleIndex
    const circle = left.current[id];

    // Get the last line element from the lines state
    //const lastLine = testOptions.correctMatches[(testOptions.correctMatches?.length || 0) - 1];
    const lastLine = testOptions.correctMatches[testOptions.correctMatches.length - 1];
    //console.log(lastLine);

    if (testOptions.correctMatches.length === 0) {
      testOptions.correctMatches.push({ left: circle });
      console.log("first");
    } else if (lastLine.right !== undefined && lastLine.left !== undefined) {
      console.log("secondary");

      testOptions.correctMatches.push({ left: circle });
    } else if (lastLine.left === undefined && lastLine.right !== undefined) {
      console.log("third");
      //console.log(testOptions.correctMatches[index - 1]);
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { ...item, left: circle };
        } else {
          return item;
        }
      });
    } else if (lastLine.right === undefined && lastLine.left !== undefined) {
      console.log("fourth");
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { left: circle };
        } else {
          return item;
        }
      });
    } else {
      console.log("fail");
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
    const circle = right.current[id];
    //console.log(circle);
    //console.log(circle);

    // Get the last line element from the lines state
    //const lastLine = testOptions.correctMatches[(testOptions.correctMatches?.length || 0) - 1];
    const lastLine = testOptions.correctMatches[testOptions.correctMatches.length - 1];
    //console.log(lastLine);

    if (testOptions.correctMatches.length === 0) {
      testOptions.correctMatches.push({ right: circle });
      console.log("first");
    } else if (lastLine.left !== undefined && lastLine.right !== undefined) {
      console.log("secondary");

      testOptions.correctMatches.push({ right: circle });
    } else if (lastLine.right === undefined && lastLine.left !== undefined) {
      console.log("right-third");

      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { ...item, right: circle };
        } else {
          return item;
        }
      });
    } else if (lastLine.left === undefined && lastLine.right !== undefined) {
      console.log("fourth");
      testOptions.correctMatches = testOptions.correctMatches.map((item, currentIndex) => {
        if (currentIndex === testOptions.correctMatches.length - 1) {
          return { right: circle };
        } else {
          return item;
        }
      });
    } else {
      console.log("fail");
    }

    // Update the lines state with the modified array.
    setTestOptions((prev) => {
      return {
        ...prev,
        correctMatches: [...testOptions.correctMatches],
      };
    });
  };

  //console.log(testOptions.correctMatches);
  console.log(right.current);

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
      >
        {testOptions?.leftSide?.map((item, index) => {
          return (
            <div
              key={item.id}
              style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "2px", position: "relative" }}
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
              />
              <button
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  right: "-9px",
                  border: "2px solid rgb(150, 150, 150)",
                  /* backgroundColor: "white", */
                  /* backgroundColor: "transparent", */
                  cursor: "pointer",
                }}
                className='add-line-circle'
                ref={(el) => (left.current[item.id] = el)}
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
            width: "100%",
            fontSize: "24px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleElementAdd}
          id={`add-left-element`}
        >
          +
        </button>
      </div>
      <SVGElement testOptions={testOptions} handleLineRemove={handleLineRemove} />
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
            >
              <button
                style={{
                  position: "absolute",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  left: "-9px",
                  border: "2px solid rgb(150, 150, 150)",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                type='button'
                id={`add-line-${item.id}`}
                ref={(el) => (right.current[item.id] = el)}
                onClick={updateRightLine}
              />
              <TextareaAutoSize
                value={item.text}
                onChange={handleTextAreaChange}
                id={`textarea-${item.id}`}
                spellCheck='false'
                autoComplete='false'
                required
                style={{ padding: "4px 12px" }}
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
            width: "100%",
            fontSize: "24px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleElementAdd}
          id={`add-right-element`}
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

const SVGElement = ({
  testOptions,
  handleLineRemove,
}: {
  testOptions: IState;
  handleLineRemove: (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
}) => {
  const [rerender, setRerender] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgSize = useSize(svgRef as React.MutableRefObject<HTMLElement | null>);
  const svgWidth = svgSize?.width;

  useEffect(() => {
    setRerender((prev) => !prev);

    return () => {};
  }, [testOptions]);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      ref={svgRef}
      style={{ maxWidth: "300px", width: "100%", flexShrink: "1.5" }}
    >
      {testOptions.correctMatches
        ?.filter((item) => item.left && item.right)
        .map((item) => {
          const y1 = (item.left?.parentElement?.clientHeight || 0) / 2 + (item.left?.parentElement?.offsetTop || 0);

          const y2 = (item.right?.parentElement?.clientHeight || 0) / 2 + (item.right?.parentElement?.offsetTop || 0);
          console.log("udpated");

          const leftId = item.left?.id.split("add-line-")[1];
          const rightId = item.right?.id.split("add-line-")[1];

          /*  const y1 =
            (document.getElementById(item.left?.id)?.parentElement?.clientHeight || 0) / 2 +
            (document.getElementById(item.left?.id)?.parentElement?.offsetTop || 0); */

          const uID = `${leftId}_${rightId}`;

          return (
            <g className='gee' key={uID}>
              <line x1={0} y1={y1} x2={svgWidth} y2={y2} stroke='black' strokeWidth='2' className='line' />
              <circle
                className='circle-x'
                cx={(svgWidth || 0) / 2}
                cy={(y1 + y2) / 2}
                r='8'
                onClick={handleLineRemove}
                role='button'
                id={uID}
              />
              {/*  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /> */}
              <g transform={`translate(${(svgWidth || 0) / 2}, ${(y1 + y2) / 2})`} pointerEvents={"none"}>
                <line x1={-3} y1={-3} x2={3} y2={3} stroke='white' strokeWidth={2} />
                <line x1={3} y1={-3} x2={-3} y2={3} stroke='white' strokeWidth={2} />
              </g>
            </g>
          );
        })}
      {/*
       */}
    </svg>
  );
};

//TODO always show x on mobile
