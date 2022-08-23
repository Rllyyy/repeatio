import { useState, useContext, useEffect } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import isElectron from "is-electron";
import PropTypes from "prop-types";

//Context
import { ModuleContext } from "../Module/ModuleContext.js";

//Components
import { CustomModal } from "../CustomModal/CustomModal";
import { AnswerOptionsEditor } from "./AnswerOptionsEditor/AnswerOptionsEditor";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//CSS
import "./QuestionEditor.css";

//Component
//TODO in React@v18 use useID hook for label/input elements
export const QuestionEditor = ({ isOpen, handleModalClose, prevQuestionID }) => {
  //State
  const [question, setQuestion] = useState({
    id: "",
    title: "",
    points: "",
    help: "",
    type: "",
    answerOptions: undefined,
  });

  //Params
  const params = useParams();

  //History
  let history = useHistory();

  //Location
  const { search } = useLocation();

  //Context
  const { moduleData, setModuleData } = useContext(ModuleContext);

  //useEffect
  useEffect(() => {
    //TODO fetch from storage instead of context
    const questionFromContext = moduleData.questions.find((question) => question.id === prevQuestionID);

    //!Somehow it keeps the order of the answer options from the question
    //If this isn't the case anymore when using the storage, pass the question
    setQuestion({ ...questionFromContext });

    return () => {
      setQuestion({});
    };
  }, [prevQuestionID, moduleData.questions]);

  //Change the value of the question object at the target.name
  const handleChange = (e) => {
    //If the target is the type selection, remove the answerOptions
    setQuestion({
      ...question,
      [e.target.name]: e.target.value,
      ...(e.target.name === "type" ? { answerOptions: undefined } : undefined),
    });
  };

  const handleEditorChange = (value) => {
    setQuestion({ ...question, answerOptions: value });
  };

  //Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isElectron()) {
      console.warn("Can't edit question in electron for this time. Use your browser instead!");
      handleModalClose();
      return;
    }

    //Prevent adding to types module as it is originally saved in the public folder
    //Adding a question would create a module in the localStorage with the same id.
    if (moduleData.id === "types_1") {
      console.warn("Editing the module types is not allowed!");
      handleModalClose();
      return;
    }

    //TODO Tests
    //Check if ID already exists
    if (moduleData.questions.find((originalQuestion) => originalQuestion.id === question.id) && !prevQuestionID) {
      //TODO message user
      console.warn("ID already exists");
      return;
    }

    //AnswerOptions can't be null/undefined
    if (question.answerOptions === null || question.answerOptions === undefined) {
      //TODO give message to user
      console.warn("Answer Options can't be empty");
      return;
    }

    //Build output by copying the question, transforming string points to float and adding line breaks
    const output = {
      ...question,
      points: parseFloat(question.points) || null,
    };

    //Adding or updating a question
    if (!prevQuestionID) {
      //If the user is adding a question (not given prevQuestion), push the new question to the end of the array
      moduleData.questions.push(output);
      setModuleData({ ...moduleData, questions: moduleData.questions });
    } else {
      //Handle updating a question

      //Try finding the index of the question
      const index = moduleData.questions.findIndex((question) => question.id === output.id);

      //If the user changes the id (index <= -1), the question gets inserted at that position
      if (index > -1) {
        moduleData.questions.splice(index, 1, output);
        setModuleData({ ...moduleData, questions: moduleData.questions });
        window.dispatchEvent(new Event("storage"));
      } else {
        //Find index of the old id by the provided question id
        const index = moduleData.questions.findIndex((question) => question.id === prevQuestionID);

        //If question isn't in moduleData don't modify the storage. In Prod this should never be shown!
        if (index <= -1) {
          console.warn("Couldn't find questionID!");
          return;
        }

        //Insert and update context
        moduleData.questions.splice(index, 1, output);
        setModuleData({ ...moduleData, questions: moduleData.questions });

        //Navigate to new path with new id
        history.push({
          pathname: `/module/${params.moduleID}/question/${output.id}`,
          search: `?mode=${new URLSearchParams(search).get("mode") || "chronological"}`,
        });
      }
    }

    //Update saved questions json object in localStorage if question is edited and the id changed
    if (prevQuestionID && prevQuestionID !== question.id) {
      //Get item from localStorage and transform
      const savedIDs = JSON.parse(localStorage.getItem(`repeatio-marked-${params.moduleID}`));

      const index = savedIDs?.indexOf(prevQuestionID);

      if (index > -1) {
        savedIDs.splice(index, 1, question.id);
      }

      //Update localStorage with the replaced value
      if (savedIDs?.length >= 1) {
        localStorage.setItem(`repeatio-marked-${params.moduleID}`, JSON.stringify(savedIDs), {
          sameSite: "strict",
          secure: true,
        });
      }
    }

    handleModalClose();
  };

  //JSX
  return (
    <CustomModal
      isOpen={isOpen}
      handleModalClose={handleModalClose}
      title={prevQuestionID ? "Edit Question" : "Add Question"}
      desktopModalHeight='90vh'
    >
      <form className='question-editor-form' onSubmit={handleSubmit}>
        {/* ID */}
        <EditorFormInput
          labelText='ID'
          value={question.id}
          type='text'
          placeholder='MOD01-1'
          handleChange={handleChange}
          required
        />
        {/* Title */}
        <EditorFormTextarea labelText='Title' value={question.title} handleChange={handleChange} />
        {/* Points */}
        <EditorFormInput
          labelText='Points'
          value={question.points}
          handleChange={handleChange}
          type='number'
          min='0'
          step='any'
        />
        {/* Type help*/}
        <EditorFormTextarea labelText='Help' value={question.help} handleChange={handleChange} />
        {/* Type */}
        <div className='modal-question-type'>
          <label htmlFor='modal-question-type-select'>Type</label>
          <select
            id='modal-question-type-select'
            name='type'
            value={question.type || ""}
            onChange={handleChange}
            required
          >
            <option value=''></option>
            <option value='multiple-choice'>Multiple Choice</option>
            <option value='multiple-response'>Multiple Response</option>
            <option value='gap-text'>Gap Text</option>
            <option value='gap-text-dropdown'>Gap Text with Dropdown</option>
            <option value='extended-match'>Extended Match</option>
          </select>
        </div>
        {/* Question*/}
        <div className='modal-question-answer'>
          <label htmlFor='editor'>Answer</label>
          <AnswerOptionsEditor
            questionType={question.type}
            answerValues={question.answerOptions}
            handleEditorChange={handleEditorChange}
          />
        </div>
        {/* Buttons */}
        <div className='buttons'>
          <button type='submit' className='update-add-question'>
            {prevQuestionID ? "Update" : "Add"}
          </button>
          <button type='button' className='cancel' onClick={handleModalClose}>
            Cancel
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

//TEXTAREA for multiline inputs
const EditorFormTextarea = ({ labelText, value, handleChange, ...props }) => {
  return (
    <div className={`modal-question-${labelText}`}>
      <label htmlFor={`modal-question-${labelText}-textarea`}>{labelText}</label>
      <TextareaAutosize
        name={labelText.toLowerCase()}
        id={`modal-question-${labelText}-textarea`}
        value={value || ""}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

EditorFormTextarea.propTypes = {
  labelText: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

//INPUT for single line inputs
const EditorFormInput = ({ labelText, type, value, handleChange, ...props }) => {
  const preventSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className={`modal-question-${labelText}`}>
      <label htmlFor={`modal-question-${labelText}-input`}>{labelText}</label>
      <input
        name={labelText.toLowerCase()}
        type={type}
        id={`modal-question-${labelText}-input`}
        value={value || ""}
        onChange={handleChange}
        onKeyDown={preventSubmit}
        {...props}
      />
    </div>
  );
};

EditorFormInput.propTypes = {
  labelText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};
