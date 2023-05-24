import React, { useState, useContext, useRef, SyntheticEvent } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

//Context
import { QuestionIdsContext, IQuestionIdsContext } from "../module/questionIdsContext";

//Components
import { CustomModal } from "../CustomModal/CustomModal";
import { AnswerOptionsEditor } from "./AnswerOptionsEditor/AnswerOptionsEditor";
import TextareaAutoSize from "react-textarea-autosize";
import { toast } from "react-toastify";

//CSS
import "./QuestionEditor.css";

//Functions
import {
  objectWithoutProp,
  checkNotEmpty,
  checkNotIdDuplicate,
  checkForbiddenUrlChars,
  checkContainsSpaces,
  validator,
  setPreviousQuestion,
} from "./helpers";
import { removeGapContent, extractCorrectGapValues } from "./AnswerOptionsEditor/QuestionTypes/GapTextEditor";

//Interfaces
import { IParams } from "../../utils/types.js";
import { getBookmarkedLocalStorageItem } from "../Question/components/Actions/BookmarkQuestion";
import { IMultipleChoice } from "../Question/QuestionTypes/MultipleChoice/MultipleChoice";
import { IMultipleResponse } from "../Question/QuestionTypes/MultipleResponse/MultipleResponse";
import { IQuestion, TUseQuestion } from "../Question/useQuestion";
import { TAnswerOptions } from "../Question/useQuestion";
import { parseJSON } from "../../utils/parseJSON";
import { IModule } from "../module/module";
import { IExtendedMatch } from "../Question/QuestionTypes/ExtendedMatch/ExtendedMatch";
import { IExtendedMatchTemp } from "./AnswerOptionsEditor/QuestionTypes/ExtendedMatchEditor";

/* A few words on validation:
Validation for the inputs is done with native HTML validation (i.e. required), onSubmit and onChange.
To cut down on performance the first validation is only done on the first submit and then after each onChange.
Some elements are excluded from the onChange validation as they require a lot of performance (duplicate checking).
For some reason firefox android does not support HTML5 validation.
*/

//Component

type EditQuestionMode = {
  mode: "edit";
  handleModalClose: () => void;
  showModal: boolean;
  prevQuestion: IQuestion;
  fetchQuestion: TUseQuestion["fetchQuestion"];
  handleResetQuestionComponent: TUseQuestion["handleResetQuestionComponent"];
};

type CreateQuestionMode = { mode: "create"; handleModalClose: () => void; showModal: boolean };

type TEditorModes = EditQuestionMode | CreateQuestionMode;

export const QuestionEditor: React.FC<TEditorModes> = (props) => {
  //JSX
  return (
    <CustomModal
      handleModalClose={props.handleModalClose}
      title={props.mode === "edit" ? "Edit Question" : "Add Question"}
      desktopModalHeight='90vh'
      showModal={props.showModal}
    >
      {props.mode === "create" ? (
        <Form mode='create' handleModalClose={props.handleModalClose} />
      ) : (
        <Form
          mode='edit'
          fetchQuestion={props.fetchQuestion}
          prevQuestion={props.prevQuestion}
          handleModalClose={props.handleModalClose}
          handleResetQuestionComponent={props.handleResetQuestionComponent}
        />
      )}
    </CustomModal>
  );
};

export type TErrors = Record<keyof IQuestion, string>;

const newEmptyQuestion = {
  id: "",
  title: "",
  points: "",
  help: "",
  type: "" as const,
  answerOptions: undefined,
};

type EditForm = Omit<EditQuestionMode, "showModal">;

type CreateForm = Omit<CreateQuestionMode, "showModal">;

export const Form: React.FC<EditForm | CreateForm> = (props) => {
  //State - If creating a new question, provide a predefined empty object else use and modify the previous question
  const [question, setQuestion] = useState<IQuestion>(
    props.mode === "create" ? newEmptyQuestion : () => setPreviousQuestion(props.prevQuestion)
  );

  const [errors, setErrors] = useState<TErrors>({} as TErrors);

  // Refs
  const hasSubmitted = useRef(false);

  //Params
  const params = useParams<IParams>();

  //navigate (previously history)
  let navigate = useNavigate();

  //Location
  const { search } = useLocation();

  //Context
  const { questionIds, setQuestionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //Change the value of the question object at the target.name
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    //If the target is the type selection, remove the answerOptions
    setQuestion({
      ...question,
      [e.target.name]: e.target.value,
      ...(e.target.name === "type" ? { answerOptions: undefined } : undefined),
    });
  };

  const handleEditorChange = (value: TAnswerOptions) => {
    setQuestion({ ...question, answerOptions: value });
  };

  //Handle form submit
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    //Return if there are any errors
    if (Object.keys(errors).length > 0) return;

    //Setup variables
    hasSubmitted.current = true;
    let onSubmitErrors = {};

    //Error in ID
    const idError = validator({
      functions: [
        checkContainsSpaces,
        checkForbiddenUrlChars,
        () =>
          checkNotIdDuplicate({
            prevQuestionID: props.mode === "edit" ? props.prevQuestion.id : undefined,
            questions: parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`))?.questions || [],
            questionID: question.id,
            params: params,
          }),
      ],
      value: question.id,
      fieldName: "id",
    });

    onSubmitErrors = { ...(idError ? { id: idError } : null) };

    //Error in answerOptions
    const answerOptionsError = getAnswerOptionsError({ answerOptions: question?.answerOptions, type: question.type });

    onSubmitErrors = { ...onSubmitErrors, ...(answerOptionsError ? { answerOptions: answerOptionsError } : null) };

    //Cancel submit if there are any new errors else continue
    if (Object.keys(onSubmitErrors).length > 0) {
      setErrors(onSubmitErrors as TErrors);
      return;
    }

    //No errors --> Start Building output and saving question

    //Build output by filtering out empty values of the object (often "points" and "help")copying the question, transforming string points to float and
    let output = Object.fromEntries(Object.entries(question).filter(([key, value]) => value !== ""));

    //Transform given points (string) to float and round it to 2 decimal places if output has key "points"
    if (output.points) {
      const pointsFloatRound = Math.round(parseFloat(output.points) * 100) / 100;
      output = { ...output, points: pointsFloatRound };
    }

    /* Question Type specific */
    //The tempText value has to be transformed back to text and correctGapValues (so users on the safari browser can use gap-text questions in combination with markdown, reason no lookbehind support )
    if (question.type === "gap-text" && output.answerOptions.hasOwnProperty("tempText")) {
      output = {
        ...output,
        answerOptions: {
          text: removeGapContent(replaceUnsupportedChars(output.answerOptions.tempText)),
          correctGapValues: extractCorrectGapValues(output.answerOptions.tempText),
        },
      };
    } else if (question.type === "extended-match") {
      output = {
        ...output,
        answerOptions: {
          ...output.answerOptions,
          correctMatches: ((output.answerOptions as IExtendedMatchTemp)?.correctMatches ?? []).reduce(
            (acc, { left, right }) => {
              const leftId = left?.id.split("add-line-")[1];
              const rightId = right?.id.split("add-line-")[1];
              if (leftId !== undefined && rightId !== undefined) {
                acc?.push({ left: leftId, right: rightId });
              }
              return acc;
            },
            [] as IExtendedMatch["correctMatches"]
          ),
        },
      };
    }

    //Adding or updating a question
    if (props.mode === "create") {
      //If the user is adding a question, push the new question to the end of the localStorage
      let module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));
      module?.questions.push(output as IQuestion);

      localStorage.setItem(`repeatio-module-${params.moduleID}`, JSON.stringify(module, null, "\t"));
    } else {
      //Handle updating a question
      let module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));

      if (!module) {
        throw new Error("Couldn't find module");
      }

      //Try finding the index of the question
      const index = module.questions?.findIndex((question) => question.id === output.id);

      //If the user changes the id (index <= -1), the question gets inserted at that position
      if (index > -1) {
        // User did not change id on edit

        // Replace the question in localStorage with the edited question
        module.questions.splice(index, 1, output as IQuestion);

        localStorage.setItem(`repeatio-module-${params.moduleID}`, JSON.stringify(module, null, "\t"));

        // Refetch the question after it was updated
        props.fetchQuestion();
      } else {
        // User edited the id of the question
        //Find index of the old id by the provided question id
        const previousIdIndexInLocalStorage = module.questions.findIndex(
          (question) => question.id === props.prevQuestion.id
        );

        //If question isn't in moduleData don't modify the storage. In Prod this should never be shown!
        if (previousIdIndexInLocalStorage <= -1) {
          toast.error("Couldn't find questionID!");
          return;
        }

        //Insert and update context
        module.questions.splice(previousIdIndexInLocalStorage, 1, output as IQuestion);
        localStorage.setItem(`repeatio-module-${params.moduleID}`, JSON.stringify(module, null, "\t"));

        // Update the context with the changed id
        // Get index of the id in the context
        const previousIndexInContext = questionIds?.findIndex((id) => id === props.prevQuestion.id);

        if (typeof previousIndexInContext === "undefined") {
          throw new Error("Couldn't find id in context");
        }

        // Replace the old id with the new id
        questionIds?.splice(previousIndexInContext, 1, output.id);

        // Set the context
        setQuestionIds([...questionIds]);

        //Navigate to new path with new id
        navigate({
          pathname: `/module/${params.moduleID}/question/${output.id}`,
          search: `?mode=${new URLSearchParams(search).get("mode") || "practice"}&order=${
            new URLSearchParams(search).get("order") || "chronological"
          }`,
        });
      }
    }

    //Update saved questions json object in localStorage if question is edited and the id changed
    if (props.mode === "edit" && props.prevQuestion.id !== question.id) {
      //Get whole bookmarked item from localStorage
      const localStorageBookmarkedItem = getBookmarkedLocalStorageItem(params.moduleID);

      //Extract questions array from bookmarked localStorage item
      const savedIDs = localStorageBookmarkedItem?.questions;

      //Check if question exists in bookmarked array
      const index = savedIDs?.indexOf(props.prevQuestion.id);

      //Replaces the previous id with the new id if the id existed in the previous bookmarked questions
      if (index !== undefined && index > -1) {
        savedIDs?.splice(index, 1, question.id);

        //Update localStorage with the replaced value
        if (savedIDs && savedIDs?.length >= 1) {
          localStorage.setItem(
            `repeatio-marked-${params.moduleID}`,
            JSON.stringify({ ...localStorageBookmarkedItem, questions: savedIDs }, null, "\t")
          );
        }
      }
    }

    if (props.mode === "edit") {
      // Reset current question
      props.handleResetQuestionComponent();
    }

    // Navigate to just added question if button name is add-and-view
    if (props.mode === "create" && (e.nativeEvent.submitter as HTMLButtonElement)?.name === "add-and-view") {
      navigate({
        pathname: `/module/${params.moduleID}/question/${output.id}`,
        search: `?mode=practice&order=chronological`,
      });
    }

    hasSubmitted.current = false;
    props.handleModalClose();
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
          setQuestion={setQuestion}
        />
        {errors?.answerOptions && <p className='modal-question-error'>{errors?.answerOptions}</p>}
      </div>
      {/* Buttons */}
      <div className={`buttons ${props.mode}`}>
        {props.mode === "create" ? (
          <>
            <button
              type='submit'
              className={`update-add-question`}
              aria-disabled={Object.keys(errors).length > 0}
              aria-label='Add Question'
              name='add'
            >
              Add
            </button>
            <button
              type='submit'
              className='update-add-question'
              aria-disabled={Object.keys(errors).length > 0}
              aria-label='Add and navigate to Question'
              name='add-and-view'
            >
              Add + View
            </button>
          </>
        ) : (
          <button
            type='submit'
            className={`update-add-question`}
            aria-disabled={Object.keys(errors).length > 0}
            name='update'
            aria-label='Update Question'
          >
            Update
          </button>
        )}
        <button type='button' className='cancel' onClick={props.handleModalClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

//Helpers
function getAnswerOptionsError({
  answerOptions,
  type,
}: {
  answerOptions: TAnswerOptions | undefined;
  type: IQuestion["type"];
}) {
  if (answerOptions === null || answerOptions === undefined) {
    switch (type) {
      case "multiple-choice":
        return "Add at least one item!";
      case "multiple-response":
        return "Add at least one item!";
      case "gap-text":
        return "Add a text!";
      case "extended-match":
        return "Add at least one item!";
      default:
        return "Add at least one item!";
    }
  }

  //Used for firefox mobile because required property doesn't work
  if (
    type === "multiple-choice" &&
    Array.isArray(answerOptions) &&
    (answerOptions as IMultipleChoice[])?.filter((option) => option.isCorrect).length !== 1
  ) {
    return "Check one item!";
  }

  //Used for firefox mobile because required property doesn't work
  if (
    type === "multiple-response" &&
    Array.isArray(answerOptions) &&
    !(answerOptions as IMultipleResponse[])?.some((option) => option.isCorrect)
  ) {
    return "Check at least one item!";
  }

  if (type === "extended-match" && (answerOptions as IExtendedMatchTemp)?.correctMatches?.length === 0) {
    return "Add at least one line!";
  }

  // Check that the first object contains more than 1 property (left and right)
  const obj = (answerOptions as IExtendedMatchTemp)?.correctMatches?.[0];
  if (obj && Object.keys(obj).length < 2) {
    return "Add at least one line!";
  }
}

/**
 * Replace the characters that are not supported by gap-text and gap-text-dropdown
 * Ignores unsupported characters inside html tags as they aren't rendered later
 */
function replaceUnsupportedChars(text: string) {
  let count = 0;
  return text
    .split(/(?<!<[^>]*)"/g)
    .map((str) => {
      if (count++ % 2 !== 0) {
        return `„${str}“`;
      } else {
        return str;
      }
    })
    .join("")
    .replaceAll(/(?<!<[^>]*)'/g, "‘");
}

/* -------------------------------TEXTAREA for multiline inputs --------------------------------- */
const EditorFormTextarea = ({
  labelText,
  value,
  handleChange,
  ...props
}: {
  labelText: string;
  value?: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  const labelTextLowerCase = labelText.toLowerCase();

  return (
    <div className={`modal-question-${labelTextLowerCase}`}>
      <label htmlFor={`modal-question-${labelTextLowerCase}-textarea`}>{labelText}</label>
      <TextareaAutoSize
        name={labelTextLowerCase}
        id={`modal-question-${labelTextLowerCase}-textarea`}
        value={value || ""}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

/* -------------------------------- INPUT for single line inputs -------------------------------- */
interface IEditorFormInput
  extends Exclude<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "value"> {
  labelText: string;
  type: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: TErrors;
  setErrors?: React.Dispatch<React.SetStateAction<TErrors>>;
  hasSubmitted?: boolean;
}

const EditorFormInput: React.FC<IEditorFormInput> = ({
  labelText,
  type,
  value,
  handleChange,
  errors,
  setErrors,
  hasSubmitted,
  ...props
}) => {
  const preventSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const labelTextLowerCase = labelText.toLowerCase();

  //Handle change to the input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);

    //Only run after the form submit, to revalidate onChange
    if (hasSubmitted) {
      if (!setErrors) return;
      //define new field error
      const fieldError = validator({
        functions: [checkContainsSpaces, checkForbiddenUrlChars, checkNotEmpty],
        value: e.target.value,
        fieldName: e.target.name,
      });

      //Remove the corresponding prop from the error object
      //Then combine the old errors (without the field) and the new field error
      //If there is no new field error, just return the old errors
      setErrors((prev: TErrors) => ({
        ...objectWithoutProp({ object: prev, deleteProp: e.target.name as keyof TErrors }),
        ...(fieldError ? { [e.target.name]: fieldError } : null),
      }));
    }
  };

  return (
    <div className={`modal-question-${labelTextLowerCase}`}>
      <label htmlFor={`modal-question-${labelTextLowerCase}-input`}>{labelText}</label>
      <input
        name={labelTextLowerCase}
        type={type}
        id={`modal-question-${labelTextLowerCase}-input`}
        className={`${errors?.[labelTextLowerCase as keyof TErrors] ? "is-invalid" : "is-valid"}`}
        value={value ?? ""}
        onChange={handleInputChange}
        onKeyDown={preventSubmit}
        autoComplete='off'
        spellCheck='false'
        {...props}
      />
      {errors?.[labelTextLowerCase as keyof TErrors] && (
        <p className='modal-question-error'>{errors?.[labelTextLowerCase as keyof TErrors]}</p>
      )}
    </div>
  );
};

/* ----------------------------------- SELECT for form ------------------------------------------ */
const EditorFormSelect = ({
  handleChange,
  value,
  typeErrors,
  hasSubmitted,
  setErrors,
}: {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  typeErrors: TErrors["type"];
  hasSubmitted: boolean;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>;
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);

    //Only run after the form submit, to revalidate onChange
    if (hasSubmitted) {
      //define new field error
      const fieldError = validator({
        functions: [checkNotEmpty],
        value: e.target.value,
        fieldName: e.target.name,
      });

      //Remove select type and answerOptions errors from the errors state but keep other errors
      setErrors((prev: TErrors) => ({
        ...objectWithoutProp({
          object: prev,
          deleteProp: [e.target.name as keyof TErrors, "answerOptions" as keyof TErrors],
        }),
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
