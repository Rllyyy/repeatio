import { Link } from "react-router-dom";

//Interfaces + Types
import { IParams, IQuestion } from "./QuestionEditor";

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

// TODO add prop
/**
 * Returns an object without the given prop
 * Pass in the object and then the prop or properties that should be deleted
 */
export function objectWithoutProp({
  object,
  deleteProp,
}: {
  object: { [x: string]: any };
  deleteProp: string | string[];
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

//Return error message if given value is empty
/**
 *
 * @param param0
 * @returns
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
  prevQuestionID: string;
  questions: IQuestion[];
  questionID: string;
  params: IParams;
}) {
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
  const regex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;
  const notAllowedChars = value
    .match(regex)
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
