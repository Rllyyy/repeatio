import { Link } from "react-router-dom";
import { getGapTextTempText, IGapTextWithTempText } from "./AnswerOptionsEditor/QuestionTypes/GapTextEditor";
import { isSafari } from "react-device-detect";

//Interfaces + Types
import { IQuestion } from "../Question/useQuestion";
import { IParams } from "../../utils/types";

//The order of give functions is important
export function validator({
  functions,
  value,
  fieldName,
}: {
  functions: Function[];
  value: string | number;
  fieldName: string;
}) {
  let res;

  for (const func of functions) {
    const message = func({ value, fieldName });
    if (message) {
      res = message;
      break;
    }
  }
  return res;
}

/**
 * Returns an object without the given prop
 * Pass in the object and then the prop or properties that should be deleted
 */
export function objectWithoutProp<T extends object>({
  object,
  deleteProp,
}: {
  object: T;
  deleteProp: (keyof T & string) | ((keyof T)[] & string[]);
}) {
  //Throw error if programmer forgot to pass both props
  if (object === undefined || deleteProp === undefined) {
    throw new Error("Pass an object and delete Prop to the function (as an object)");
  }

  //Check if given input is an array
  if (Array.isArray(deleteProp)) {
    deleteProp.forEach((prop) => {
      if (object.hasOwnProperty(prop)) {
        delete object[prop];
      }
    });
  } else {
    //Delete prop from object and return it
    if (object.hasOwnProperty(deleteProp)) {
      delete object[deleteProp];
    }
  }

  return object;
}

/**
 * Return error message if given value is empty
 * @param {string} value - The value
 * @param {string} [fieldName] - The name of the html element that is empty
 * @returns  an error message if the value is empty, or nothing if the value is not empty
 */
export function checkNotEmpty({ value, fieldName }: { value: string; fieldName?: string }) {
  if (value === "") {
    return `The ${fieldName || "field"} can't be empty!`;
  }
}

//Return error if id is duplicate
export function checkNotIdDuplicate({
  prevQuestionID,
  questions,
  questionID,
  params,
}: {
  prevQuestionID?: string;
  questions: IQuestion[];
  questionID: IQuestion["id"];
  params: IParams;
}) {
  if (!questionID) return;

  //Don't search if editing question and the id wasn't changed
  if (prevQuestionID && prevQuestionID === questionID) {
    return;
  }

  //Search for id and return jsx error if found
  if (questions?.find((originalQuestion) => originalQuestion.id === questionID)) {
    return (
      <>
        <span>A question with this id already exists! </span>
        <Link to={`/module/${params.moduleID}/question/${questionID}`}>View: {questionID}</Link>
        <span>
          {" "}
          (<i>Caution:</i> Entered data will be lost when visiting this link!)
        </span>
      </>
    );
  }
}

//Return error if given value contains characters that aren't permitted to be in the url
export function checkForbiddenUrlChars({ value, fieldName }: { value: string; fieldName?: string }) {
  //Check if the field contains non allowed characters
  const forbiddenCharRegex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;
  const notAllowedChars = value
    .match(forbiddenCharRegex)
    ?.map((el) => `"${el}"`)
    .join(", ");

  if (notAllowedChars) {
    return `The ${fieldName || "field"} contains non allowed characters (${notAllowedChars})!`;
  }
}

//Return error if given value contains spaces
export function checkContainsSpaces({ value, fieldName }: { value: string; fieldName?: string }) {
  const spaceRegex = / /g;
  const spaces = value.match(spaceRegex)?.join("");

  if (spaces) {
    return `The ${fieldName || "field"} has to be one word! Use hyphens ("-") to concat the word (e.g. ${value.replace(
      / /g,
      "-"
    )}).`;
  }
}

/**
 * Return the question and modifies the answer options for gap-text
 * @param question
 */
export function setPreviousQuestion(question: IQuestion) {
  //Combine the text and correctGapValues of gap-text to a variable that is used for the input
  //Prevent Safari because lookbehind support: https://bugs.webkit.org/show_bug.cgi?id=174931
  //TODO check if safari ever supports this feature
  if (question?.type === "gap-text" && !isSafari) {
    question = {
      ...question,
      answerOptions: {
        tempText: getGapTextTempText(question.answerOptions as IGapTextWithTempText),
      },
    };
  }
  return question;
}
