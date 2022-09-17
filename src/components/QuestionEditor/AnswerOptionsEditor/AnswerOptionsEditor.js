import { useState } from "react";
import { toast } from "react-toastify";

//Question types
import { MultipleChoice } from "./QuestionTypes/MultipleChoice.js";
import { MultipleResponse } from "./QuestionTypes/MultipleResponse.js";

//CSS
import "./AnswerOptionsEditor.css";

//Icons
import { CgExtensionAdd } from "react-icons/cg";
import { CgExtensionRemove } from "react-icons/cg";

//Editor
export const AnswerOptionsEditor = ({ questionType, answerValues, handleEditorChange }) => {
  const [lastSelected, setLastSelected] = useState("");

  //Find a new unique id
  const findUniqueID = () => {
    //IF can't find
    let newID;
    for (let indexID = 0; indexID <= answerValues.length; indexID++) {
      const idExists = answerValues.find((item) => item.id === `option-${indexID}`);
      if (!idExists) {
        newID = `option-${indexID}`;
      }
    }
    return newID;
  };

  //TODO Move to question type maybe??
  const addElement = () => {
    switch (questionType) {
      case "multiple-choice":
        if (answerValues?.length >= 1) {
          handleEditorChange([...answerValues, { id: findUniqueID(), text: "", isCorrect: false }]);
        } else {
          handleEditorChange([{ id: `option-0`, text: "", isCorrect: false }]);
        }
        break;
      case "multiple-response":
        if (answerValues?.length >= 1) {
          handleEditorChange([...answerValues, { id: findUniqueID(), text: "", isCorrect: false }]);
        } else {
          handleEditorChange([{ id: `option-0`, text: "", isCorrect: false }]);
        }
        break;
      case "":
        toast.warn("nothing chosen!");
        break;
      case undefined:
        toast.warn("nothing chosen!");
        break;
      default:
        toast.warn(`${questionType} isn't implemented yet!`);
        break;
    }
  };

  //TODO Move to question type itself maybe
  const removeElement = () => {
    //If a element is selected, remove it else remove the last element of the array
    if (lastSelected) {
      //Remove selected Element
      const returnVal = answerValues.filter((item) => item.id !== lastSelected);
      setLastSelected("");
      handleEditorChange(returnVal);
    } else if (!lastSelected && answerValues?.length >= 1) {
      //Remove last element of array
      answerValues.pop();
      handleEditorChange([...answerValues]);
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

      <div className='editor-content'>
        <Switch questionType={questionType}>
          <MultipleChoice
            name='multiple-choice'
            answerValues={answerValues}
            handleEditorChange={handleEditorChange}
            lastSelected={lastSelected}
            setLastSelected={setLastSelected}
          />
          <MultipleResponse
            name='multiple-response'
            options={answerValues}
            handleEditorChange={handleEditorChange}
            lastSelected={lastSelected}
            setLastSelected={setLastSelected}
          />
          <Empty name='' />
        </Switch>
      </div>
    </div>
  );
};

//To find the correct question type
const Switch = ({ questionType, children }) => {
  //Return the empty component if question type is undefined
  if (questionType === undefined) {
    return <Empty name='' />;
  }

  //Find the question type
  const child = children.find((child) => child.props.name === questionType);

  if (child !== undefined) {
    return child;
  } else {
    return <p>{questionType} isn't implemented yet!</p>;
  }
};

//Empty
const Empty = () => {
  return <p className='editor-message'>Please select a Question Type</p>;
};