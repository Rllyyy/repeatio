import { useState, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import isElectron from "is-electron";

//Context
import { ModuleContext } from "../../../Context/ModuleContext.js";

//Components
import CustomModal from "../CustomModal/CustomModal.js";
import AnswerOptionsEditor from "./Components/AnswerOptionsEditor/AnswerOptionsEditor.js";
import FormInput from "./Components/FormInput.js";

//CSS
import "./QuestionEditor.css";

//Helper functions
//Transform string points to int or return "?"
const transformPoints = (points) => {
  return parseInt(points) || "?";
};

//Add new line but not for html elements
const transformAnswerOptions = (answerOptions) => {
  const returnValue = [...answerOptions];
  if (Array.isArray(answerOptions)) {
    answerOptions = answerOptions.map((option) => {
      const splitOption = option.text.split(/\n\r?/g);

      const optionWithLineBreaks = splitOption?.map((item, index) => {
        //Don't add new line where there is html, manual set new lines or at the end.
        if (
          !item.startsWith("<") &&
          !item.endsWith(">") &&
          !item.endsWith("\n") &&
          !item.endsWith("\n\n") &&
          index < splitOption.length - 1
        ) {
          return item.concat("  \n");
        } else {
          return item;
        }
      });

      return { ...option, text: optionWithLineBreaks.join("") };
    });
  }

  return returnValue;
};

//Component
//TODO in React@v18 use useID hook for label/input elements
const QuestionEditor = ({ isOpen, handleModalClose, prevQuestion }) => {
  //State
  const [question, setQuestion] = useState(
    prevQuestion || {
      id: "",
      title: "",
      points: undefined,
      help: "",
      type: "",
      answerOptions: undefined,
    }
  );

  //Params
  const params = useParams();

  //History
  let history = useHistory();

  //Location
  const { search } = useLocation();

  //Context
  const { moduleData, setModuleData } = useContext(ModuleContext);

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
    if (moduleData.questions.find((originalQuestion) => originalQuestion.id === question.id) && !prevQuestion) {
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

    //Build output by copying the question and transforming points to int and add line breaks
    const output = {
      ...question,
      points: transformPoints(question.points),
      answerOptions: transformAnswerOptions(question.answerOptions),
    };

    //Adding or updating a question
    if (!prevQuestion) {
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
      } else {
        //Find index of the old id by using params (url)
        const index = moduleData.questions.findIndex((question) => question.id === params.questionID);

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

    handleModalClose();
  };

  //JSX
  return (
    <CustomModal
      isOpen={isOpen}
      handleModalClose={handleModalClose}
      title={prevQuestion ? "Edit Question" : "Add Question"}
      desktopModalHeight='90%'
    >
      <form className='add-question-form' onSubmit={handleSubmit}>
        {/* ID */}
        <FormInput
          labelText='ID'
          value={question.id}
          type='text'
          placeholder='MOD01-1'
          onChange={handleChange}
          required
        />
        {/* Title */}
        <FormInput labelText='Title' value={question.title} onChange={handleChange} type='text' />
        {/* Points */}
        <FormInput labelText='Points' value={question.points} onChange={handleChange} type='number' min='0' />
        {/* Type help*/}
        <FormInput labelText='Help' type='string' value={question.help} onChange={handleChange} />
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
            {prevQuestion ? "Update" : "Add"}
          </button>
          <button type='button' className='cancel' onClick={handleModalClose}>
            Cancel
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default QuestionEditor;
