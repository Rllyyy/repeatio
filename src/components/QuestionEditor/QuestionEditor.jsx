import { useState, useContext, useEffect, useRef } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import isElectron from "is-electron";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

//Context
import { ModuleContext } from "../module/moduleContext.js";

//Components
import { CustomModal } from "../CustomModal/CustomModal";
import { AnswerOptionsEditor } from "./AnswerOptionsEditor/AnswerOptionsEditor";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//CSS
import "./QuestionEditor.css";
import {
  objectWithoutProp,
  checkNotEmpty,
  checkNotIdDuplicate,
  checkForbiddenUrlChars,
  checkContainsSpaces,
  validator,
} from "./helpers.js";

/* A few words on validation:
Validation for the inputs is done with native HTML validation (i.e. required), onSubmit and onChange.
To cut down on performance the first validation is only done on the first submit and then after each onChange.
Some elements are excluded from the onChange validation as they require a lot of performance (duplicate checking).
*/

//Component
//TODO in React@v18 use useID hook for label/input elements
export const QuestionEditor = ({ isOpen, handleModalClose, prevQuestionID }) => {
  //JSX
  return (
    <CustomModal
      isOpen={isOpen}
      handleModalClose={handleModalClose}
      title={prevQuestionID ? "Edit Question" : "Add Question"}
      desktopModalHeight='90vh'
    >
      <Form prevQuestionID={prevQuestionID} handleModalClose={handleModalClose} />
    </CustomModal>
  );
};

export const Form = ({ prevQuestionID, handleModalClose }) => {
  //State
  const [question, setQuestion] = useState({
    id: "",
    title: "",
    points: "",
    help: "",
    type: "",
    answerOptions: undefined,
  });

  const [errors, setErrors] = useState({});
  const hasSubmitted = useRef(false);

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
    //TODO fetch from name param not context

    if (prevQuestionID) {
      // condition
      const questionFromContext = moduleData.questions.find((question) => question.id === prevQuestionID);

      //!Somehow it keeps the order of the answer options from the question
      //If this isn't the case anymore when using the storage, pass the question
      setQuestion({ ...questionFromContext });
    }

    return () => {
      setQuestion({});
      hasSubmitted.current = false;
    };
  }, [prevQuestionID, moduleData?.questions]);

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

    //Return if there are any errors
    if (Object.keys(errors).length > 0) return;

    if (isElectron()) {
      toast.warn("Can't edit question in electron for this time. Use your browser instead!");
      handleModalClose();
      return;
    }

    //Don't allow question editing when using mode random
    if (new URLSearchParams(search).get("mode") === "random") {
      //TODO fix this
      toast.warn(
        "Can't edit this questions while using mode random! Navigate to this question using the question overview.",
        {
          autoClose: 12000,
        }
      );
      return;
    }

    //Setup variables
    hasSubmitted.current = true;
    let onSubmitErrors = {};

    //Prevent adding to types module as it is originally saved in the public folder
    //Adding a question would create a module in the localStorage with the same id.
    if (moduleData?.id === "types_1") {
      toast.warn("Editing this module (Question Types) is not allowed!");
      handleModalClose();
      return;
    }

    const idError = validator({
      functions: [
        checkContainsSpaces,
        checkForbiddenUrlChars,
        () =>
          checkNotIdDuplicate({
            prevQuestionID: prevQuestionID,
            questions: moduleData?.questions,
            questionID: question.id,
            params: params,
          }),
      ],
      value: question.id,
      fieldName: "id",
    });

    onSubmitErrors = { ...(idError ? { id: idError } : null) };

    const emptyAnswerOptions = ({ answerOptions }) => {
      if (answerOptions === null || answerOptions === undefined || answerOptions?.length < 1) {
        return "Add at least one item!";
      }

      if (question.type === "multiple-response" && !question.answerOptions?.some((option) => option.isCorrect)) {
        return "Check at least one item!";
      }
    };

    const answerOptionsError = emptyAnswerOptions({ answerOptions: question?.answerOptions });
    onSubmitErrors = { ...onSubmitErrors, ...(answerOptionsError ? { answerOptions: answerOptionsError } : null) };

    //Cancel submit if there are any new errors else continue
    if (Object.keys(onSubmitErrors).length > 0) {
      setErrors(onSubmitErrors);
      return;
    }

    //No errors --> Start Building output and saving question

    //Build output by filtering out empty values of the object (often "points" and "help")copying the question, transforming string points to float and
    let output = Object.fromEntries(Object.entries(question).filter(([key, value]) => value !== ""));

    //Transform given points (string) to float and round it to 2 decimal places if output has key "points"
    if (output.points) {
      const pointsFloatRound = Math.round(parseFloat(question.points) * 100) / 100;
      output = { ...output, points: pointsFloatRound };
    }

    //Adding or updating a question
    if (!prevQuestionID) {
      //If the user is adding a question (not given prevQuestion), push the new question to the end of the array
      moduleData?.questions?.push(output);
      setModuleData({ ...moduleData, questions: moduleData?.questions });
    } else {
      //Handle updating a question

      //Try finding the index of the question
      const index = moduleData?.questions?.findIndex((question) => question.id === output.id);

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
          toast.error("Couldn't find questionID!");
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
        localStorage.setItem(`repeatio-marked-${params.moduleID}`, JSON.stringify(savedIDs, null, "\t"), {
          sameSite: "strict",
          secure: true,
        });
      }
    }

    hasSubmitted.current = false;
    handleModalClose();
  };

  return (
    <form className='question-editor-form' onSubmit={handleSubmit}>
      {/* ID */}
      <EditorFormInput
        labelText='ID'
        value={question.id}
        type='text'
        placeholder='MOD01-1'
        handleChange={handleChange}
        errors={errors}
        setErrors={setErrors}
        hasSubmitted={hasSubmitted.current}
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
      <EditorFormSelect
        handleChange={handleChange}
        value={question.type}
        typeErrors={errors?.type}
        setErrors={setErrors}
        hasSubmitted={hasSubmitted.current}
      />
      {/* Question Answer*/}
      <div className='modal-question-answer'>
        <label htmlFor='editor'>Answer</label>
        <AnswerOptionsEditor
          questionType={question.type}
          answerValues={question.answerOptions}
          handleEditorChange={handleEditorChange}
          answerOptionsError={errors.answerOptions}
          setErrors={setErrors}
          hasSubmitted={hasSubmitted.current}
        />
        {errors?.answerOptions && <p className='modal-question-error'>{errors?.answerOptions}</p>}
      </div>
      {/* Buttons */}
      <div className='buttons'>
        <button
          type='submit'
          className={`update-add-question`}
          aria-disabled={Object.keys(errors).length > 0 ? true : false}
        >
          {prevQuestionID ? "Update" : "Add"}
        </button>
        <button type='button' className='cancel' onClick={handleModalClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

/* -------------------------------TEXTAREA for multiline inputs --------------------------------- */
const EditorFormTextarea = ({ labelText, value, handleChange, ...props }) => {
  const labelTextLowerCase = labelText.toLowerCase();

  return (
    <div className={`modal-question-${labelTextLowerCase}`}>
      <label htmlFor={`modal-question-${labelTextLowerCase}-textarea`}>{labelText}</label>
      <TextareaAutosize
        name={labelTextLowerCase}
        id={`modal-question-${labelTextLowerCase}-textarea`}
        value={value || ""}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

//Prop Types for textarea
EditorFormTextarea.propTypes = {
  labelText: PropTypes.string.isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
};

/* -------------------------------- INPUT for single line inputs -------------------------------- */
const EditorFormInput = ({ labelText, type, value, handleChange, errors, setErrors, hasSubmitted, ...props }) => {
  const preventSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Handle change to the input field
  const handleInputChange = (e) => {
    handleChange(e);

    //Only run after the form submit, to revalidate onChange
    if (hasSubmitted) {
      //define new field error
      const fieldError = validator({
        functions: [checkContainsSpaces, checkForbiddenUrlChars, checkNotEmpty],
        value: e.target.value,
        fieldName: e.target.name,
      });

      //Remove the corresponding prop from the error object
      //Then combine the old errors (without the field) and the new field error
      //If there is no new field error, just return the old errors
      setErrors((prev) => ({
        ...objectWithoutProp({ object: prev, deleteProp: e.target.name }),
        ...(fieldError ? { [e.target.name]: fieldError } : null),
      }));
    }
  };

  const labelTextLowerCase = labelText.toLowerCase();

  return (
    <div className={`modal-question-${labelTextLowerCase}`}>
      <label htmlFor={`modal-question-${labelTextLowerCase}-input`}>{labelText}</label>
      <input
        name={labelTextLowerCase}
        type={type}
        id={`modal-question-${labelTextLowerCase}-input`}
        className={`${errors?.[labelTextLowerCase] ? "is-invalid" : "is-valid"}`}
        value={value || ""}
        onChange={handleInputChange}
        onKeyDown={preventSubmit}
        autoComplete='off'
        spellCheck='false'
        {...props}
      />
      {errors?.[labelTextLowerCase] && <p className='modal-question-error'>{errors?.[labelTextLowerCase]}</p>}
    </div>
  );
};

//PropTypes for Input
EditorFormInput.propTypes = {
  labelText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleChange: PropTypes.func.isRequired,
  setErrors: PropTypes.func,
  hasSubmitted: PropTypes.bool,
};

/* ----------------------------------- SELECT for form ------------------------------------------ */
const EditorFormSelect = ({ handleChange, value, typeErrors, hasSubmitted, setErrors }) => {
  const handleSelectChange = (e) => {
    handleChange(e);

    //Only run after the form submit, to revalidate onChange
    if (hasSubmitted) {
      //define new field error
      const fieldError = validator({
        functions: [checkNotEmpty],
        value: e.target.value,
        fieldName: e.target.name,
      });

      //Remove the corresponding prop from the error object
      //Then combine the old errors (without the field) and the new field error
      //If there is no new field error, just return the old errors
      setErrors((prev) => ({
        ...objectWithoutProp({ object: prev, deleteProp: e.target.name }),
        ...(fieldError ? { [e.target.name]: fieldError } : null),
      }));
    }
  };

  return (
    <div className='modal-question-type'>
      <label htmlFor='modal-question-type-select'>Type</label>
      <select
        className={`${typeErrors ? "is-invalid" : "is-valid"}`}
        id='modal-question-type-select'
        name='type'
        value={value || ""}
        onChange={handleSelectChange}
        required
      >
        <option value=''></option>
        <option value='multiple-choice'>Multiple Choice</option>
        <option value='multiple-response'>Multiple Response</option>
        <option value='gap-text'>Gap Text</option>
        <option value='gap-text-dropdown'>Gap Text with Dropdown</option>
        <option value='extended-match'>Extended Match</option>
      </select>
      {typeErrors && <p className='modal-question-error'>{typeErrors}</p>}
    </div>
  );
};

//PropTypes for the select
EditorFormSelect.propTypes = {
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  typeErrors: PropTypes.string,
  hasSubmitted: PropTypes.bool,
  setErrors: PropTypes.func,
};
