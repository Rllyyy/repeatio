import { Link } from "react-router-dom";

//The order of give functions is important
export function validator({ functions, value, fieldName }) {
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

//Return an object without the given prop
export function objectWithoutProp({ object, deleteProp } = {}) {
  //Throw error if programmer forgot to pass both props
  if (object === undefined || deleteProp === undefined) {
    throw new Error("Pass an object and delete Prop to the function (as an object)");
  }

  //Delete prop from object and return it
  delete object[deleteProp];
  return object;
}

//Return error message if given value is empty
export function checkNotEmpty({ value, fieldName }) {
  if (value === "") {
    return `The ${fieldName || "field"} can't be empty!`;
  }
}

//Return error if id is duplicate
export function checkNotIdDuplicate({ prevQuestionID, questions, questionID, params }) {
  //Don't search if editing question
  if (prevQuestionID) {
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
export function checkForbiddenUrlChars({ value, fieldName }) {
  //Check if the field contains non allowed characters
  const regex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;
  const notAllowedChars = value
    .match(regex)
    ?.map((el) => `"${el}"`)
    .join(", ");

  if (notAllowedChars?.length > 0) {
    return `The ${fieldName || "field"} contains non allowed characters (${notAllowedChars})!`;
  }
}

//Return error if given value contains spaces
export function checkContainsSpaces({ value, fieldName }) {
  const spaceRegex = / /g;
  const spaces = value.match(spaceRegex)?.join("");

  if (spaces?.length > 0) {
    return `The ${fieldName || "field"} has to be one word! Use hyphens ("-") to concat the word (e.g. ${value.replace(
      / /g,
      "-"
    )}).`;
  }
}
