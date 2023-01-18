import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

//Question types
import { MultipleChoiceEditor } from "./QuestionTypes/MultipleChoiceEditor";
import { MultipleResponseEditor } from "./QuestionTypes/MultipleResponseEditor";
import { GapTextEditor } from "./QuestionTypes/GapTextEditor";

//Interfaces/Types
import { TAnswerOptions, IQuestion } from "../../Question/useQuestion";
import { IErrors } from "../QuestionEditor";
import { IGapTextWithTempText } from "./QuestionTypes/GapTextEditor";
import { IMultipleChoice } from "../../Question/QuestionTypes/MultipleChoice/MultipleChoice";
import { IMultipleResponse } from "../../Question/QuestionTypes/MultipleResponse/MultipleResponse";

//Functions
import { objectWithoutProp } from "../helpers";

//CSS
import "./AnswerOptionsEditor.css";

//Icons
import { CgExtensionAdd } from "react-icons/cg";
import { CgExtensionRemove } from "react-icons/cg";
import { FaMarkdown } from "react-icons/fa";

interface IAnswerOptionsEditor {
  questionType: IQuestion["type"];
  answerValues: TAnswerOptions | undefined;
  handleEditorChange: (value: TAnswerOptions) => void;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<IErrors>>;
  hasSubmitted: boolean;
}

//Editor
export const AnswerOptionsEditor = ({
  questionType,
  answerValues,
  handleEditorChange,
  answerOptionsError,
  setErrors,
  hasSubmitted,
}: IAnswerOptionsEditor) => {
  const [lastSelected, setLastSelected] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  //TODO Move to question type maybe??
  const addElement = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    switch (questionType) {
      case "multiple-choice":
        if (Array.isArray(answerValues) && answerValues?.length >= 1) {
          handleEditorChange([...answerValues, { id: findUniqueID(answerValues), text: "", isCorrect: false }]);
        } else {
          handleEditorChange([{ id: `option-0`, text: "", isCorrect: false }]);
          if (!hasSubmitted) return;
          setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
        }
        break;
      case "multiple-response":
        if (Array.isArray(answerValues) && answerValues?.length >= 1) {
          handleEditorChange([...answerValues, { id: findUniqueID(answerValues), text: "", isCorrect: false }]);
        } else {
          handleEditorChange([{ id: `option-0`, text: "", isCorrect: false }]);
          if (!hasSubmitted) return;
          setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
        }
        break;
      case "gap-text":
        if (Array.isArray(answerValues) || !ref.current) return;

        const { selectionStart, selectionEnd } = ref.current;
        if (selectionStart === selectionEnd) {
          //Not selection
          handleEditorChange({
            tempText: insertGapAtCaret((answerValues as IGapTextWithTempText)?.tempText, selectionStart),
          });
        } else {
          //selection
          handleEditorChange({
            tempText: replaceSelectionWithGap(
              (answerValues as IGapTextWithTempText)?.tempText,
              selectionStart,
              selectionEnd
            ),
          });
        }
        ref.current.focus();
        if (!hasSubmitted) return;
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
        break;
      case "":
        toast.warn("Choose a question type!");
        break;
      case undefined:
        toast.warn("Choose a question type!");
        break;
      default:
        toast.warn(`${questionType} isn't implemented yet!`);
        break;
    }
  };

  //TODO Move to question type itself maybe
  const removeElement = () => {
    if (questionType === "multiple-response" || questionType === "multiple-choice") {
      let newValues = [...(answerValues as IMultipleChoice[] | IMultipleResponse[])];
      //If a element is selected, remove it else remove the last element of the array
      if (lastSelected) {
        //Remove selected Element
        newValues = newValues.filter((item) => item.id !== lastSelected);
        setLastSelected("");
        handleEditorChange([...newValues]);
      } else if (!lastSelected && newValues?.length >= 1) {
        //Remove last element of array
        newValues.pop();
        handleEditorChange([...newValues]);
      }

      //Show error message if there is no element left but only if onChange after first submit contains error
      //!Error here
      if (hasSubmitted && newValues?.length === 0) {
        setErrors((prev) => ({
          ...objectWithoutProp({ object: prev, deleteProp: "answerOptions" }),
          ...{ answerOptions: "Add at least one item!" },
        }));
      }
      return;
    }

    if (questionType === "gap-text" && ref.current) {
      const { selectionStart, selectionEnd } = ref.current;
      if (selectionStart !== selectionEnd) {
        handleEditorChange({
          tempText: removeBracketsFromSelection(
            (answerValues as IGapTextWithTempText)?.tempText || "",
            selectionStart,
            selectionEnd
          ),
        });
        ref.current.focus();
      } else {
        toast.warn("Highlight the gap you want to remove!");
      }
      return;
    }
  };

  //JSX
  return (
    <div className='editor'>
      <div className={`editor-toolbar ${!questionType ? "disabled" : "enabled"}`}>
        <button type='button' onClick={addElement} id='editor-add-item'>
          <CgExtensionAdd />
        </button>
        <button type='button' onClick={removeElement} id='editor-remove-item'>
          <CgExtensionRemove />
        </button>
      </div>
      <div className={`editor-content ${questionType} ${answerOptionsError ? "is-invalid" : ""}`}>
        <Switch questionType={questionType}>
          <MultipleChoiceEditor
            name='multiple-choice'
            answerValues={answerValues as IMultipleChoice[]}
            handleEditorChange={handleEditorChange}
            lastSelected={lastSelected}
            setLastSelected={setLastSelected}
            answerOptionsError={answerOptionsError}
            setErrors={setErrors}
          />
          <MultipleResponseEditor
            name='multiple-response'
            options={answerValues as IMultipleResponse[]}
            handleEditorChange={handleEditorChange}
            lastSelected={lastSelected}
            setLastSelected={setLastSelected}
            answerOptionsError={answerOptionsError}
            setErrors={setErrors}
          />
          <GapTextEditor
            ref={ref}
            name='gap-text'
            tempText={(answerValues as IGapTextWithTempText)?.tempText || ""}
            handleEditorChange={handleEditorChange}
            answerOptionsError={answerOptionsError}
            setErrors={setErrors}
          />
          <Empty name='' />
        </Switch>
      </div>
      <div className='markdown-support'>
        <span style={{ fontSize: "14px" }}>Styling with Markdown is supported</span>
        <FaMarkdown />
      </div>
    </div>
  );
};

//To find the correct question type
const Switch = ({
  questionType,
  children,
}: {
  questionType: IQuestion["type"] | "" | undefined;
  children?: JSX.Element[];
}) => {
  //Return the empty component if question type is undefined
  if (questionType === undefined) {
    return <Empty name='' />;
  }

  //Find the question type
  const child = children?.find((child) => child?.props.name === questionType);

  if (child !== undefined) {
    return child;
  } else {
    return <p>{questionType} isn't implemented yet!</p>;
  }
};

//Empty
const Empty = ({ name }: { name: string }) => {
  return <p className='editor-message'>Please select a Question Type</p>;
};

//HELPERS
/**
 * Find a new unique id
 * @param existingElements - Array of existing elements
 */
function findUniqueID(existingElements: IMultipleChoice[] | IMultipleResponse[]) {
  //IF can't find
  let newID;
  for (let indexID = 0; indexID <= existingElements.length; indexID++) {
    const idExists = existingElements.find((element) => element.id === `option-${indexID}`);
    if (!idExists) {
      newID = `option-${indexID}`;
      break;
    }
  }
  return newID || "option-0";
}

/**
 * Adds a gap for gap-text with surrounded brackets and whitespace if needed
 * @param text - The text of the Textarea/Input
 * @param position - The caret position
 */
function insertGapAtCaret(text: string = "", position: number) {
  //Build default return with brackets
  let returnBrackets = "[value]";

  //Add whitespace to the beginning of the return value if all of these conditions are met:
  //- the character before the caret is not a whitespace
  //- the caret is not at the beginning of the textarea/input
  //- the caret is not at the beginning of a new line
  if (text?.[position - 1] !== " " && position > 0 && /\S/.test(text?.[position - 1])) {
    returnBrackets = " ".concat(returnBrackets);
  }

  //Add a whitespace to the end of the return value if all of these conditions are met:
  //- the character after the caret is not a whitespace
  //- the caret is not at the end of the text/textarea/input
  //- the caret is not at the end of a line
  if (text?.[position] !== " " && position < text?.length && !/[\n\r]/.test(text?.[position])) {
    returnBrackets = returnBrackets.concat(" ");
  }

  //Add a whitespace to the end of the return value if:
  //- the text is empty and the caret is at the start
  if (text.length === 0 && position === 0) {
    returnBrackets = returnBrackets.concat(" ");
  }

  //Get text before and after caret
  const textBeforeBracket = text?.slice(0, position) || "";
  const textAfterBracket = text?.slice(position, text?.length) || "";

  //Return string
  return `${textBeforeBracket}${returnBrackets}${textAfterBracket}`;
}

/**
 * Replaces the selection with a gap and add whitespace if needed
 * @param text - The whole text of the textarea/input
 * @param positionStart - Start of the selection
 * @param positionEnd - End of the selection
 */
function replaceSelectionWithGap(text: string = "", positionStart: number, positionEnd: number) {
  const textBeforeSelection = text?.slice(0, positionStart) || "";
  const textSelection = text?.slice(positionStart, positionEnd).trim();
  const textAfterSelection = text?.slice(positionEnd, text?.length) || "";

  //Add brackets to the selection
  let textInBrackets = `[${textSelection}]`;

  //Add a whitespace to the end if (all conditions must be met):
  //- the selection at the end does not include a whitespace
  //- the selection at the end is not the end of the text
  //- the selection at the end is not a line break
  if (text?.[positionEnd] !== " " && positionEnd < text?.length && !/[\n\r]/.test(text?.[positionEnd])) {
    textInBrackets = textInBrackets.concat(" ");
  }

  //Add a whitespace to the beginning if (all conditions are met):
  //- the character before the selection is not a whitespace
  //- the selection does not start at the beginning of the text
  //- the selection at the start is not a new line
  if (text?.[positionStart - 1] !== " " && positionStart !== 0 && /\S/.test(text?.[positionStart - 1])) {
    textInBrackets = " ".concat(textInBrackets);
  }

  return `${textBeforeSelection}${textInBrackets}${textAfterSelection}`;
}

/**
 * Returns the given text without any brackets
 * @param text - The text of the Textarea/Input
 * @param selectionStart - Start of the selection
 * @param selectionEnd - End of the selection
 */
function removeBracketsFromSelection(text: string, selectionStart: number, selectionEnd: number) {
  //Get text before the selection
  const beforeSelection = text.slice(0, selectionStart) || "";

  //Get the selected text and remove [ and ]
  const selectionWithoutBrackets = text.slice(selectionStart, selectionEnd).replaceAll("[", "").replaceAll("]", "");

  //Get text after selection
  const afterSelection = text.slice(selectionEnd, text.length) || "";

  const textWithoutBrackets = `${beforeSelection}${selectionWithoutBrackets}${afterSelection}`;

  //TODO change position to top right
  if (textWithoutBrackets.length === text.length) {
    toast.warn("Found no gaps inside the selection!");
  }

  return textWithoutBrackets;
}
