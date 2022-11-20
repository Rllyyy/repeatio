import { TextareaAutosize } from "@mui/material";
import { forwardRef } from "react";
import { objectWithoutProp } from "../../helpers";
import { isSafari } from "react-device-detect";

//Types
import { IErrors } from "../../QuestionEditor";

interface IGapTextEditor {
  name: string;
  tempText: string;
  handleEditorChange: ({ tempText }: { tempText: string }) => void;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<IErrors>>;
}

export const GapTextEditor = forwardRef<HTMLTextAreaElement, IGapTextEditor>(
  ({ name, tempText, handleEditorChange, answerOptionsError, setErrors }, ref) => {
    //handleChange
    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      handleEditorChange({ tempText: e.target.value });

      //Clear error on answerOptions but keep all other form onSubmit errors
      //Mainly used for firefox mobile because "required" property doesn't work there
      if (answerOptionsError) {
        setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
      }
    }

    //Return error text if user uses safari because safari does not support lookbehind
    //https://bugs.webkit.org/show_bug.cgi?id=174931
    if (isSafari) {
      return (
        <p style={{ color: "rgb(231, 76, 60)", paddingBottom: "10px" }}>
          YOur browser (safari) does not support features used for this question type! Use a different browser to add or
          edit this type of question.
        </p>
      );
    }

    //Return textarea
    return (
      <TextareaAutosize
        ref={ref}
        spellCheck='false'
        id='editor-gap-text-textarea'
        autoComplete='false'
        minRows={5}
        style={{ border: "none", padding: 0, borderRadius: 0, outline: "none" }}
        placeholder='Add a gap by surrounding the correct match with square brackets like [this]. Separate multiple correct answers by a semicolon like this: This is [easy; hard]'
        value={tempText}
        required
        onChange={handleChange}
      />
    );
  }
);

//TODO: Add info (maybe as a feature for the answerOptionsEditor)
//Move gapTextUpdate to updateQuestion
//Move gapTextAdd to addQuestion

//HELPERS

/**
 * Replace the content with the brackets from the input string
 * @returns A string where the content of the gap is removed
 */
export function removeGapContent(input: string) {
  return input.replaceAll(/\[[^\]]*\](?!\()/g, "[]");
}

/**
 * Combines the text and correctGapValues properties to one string so it can be displayed in the editor
 * @param gapText
 * @returns
 */
export function getGapTextTempText(gapText: { text?: string; correctGapValues?: Array<string[]> }) {
  const array = gapText?.text?.split("[]");
  const stringWithCorrectValues = array
    ?.map((line, index) => {
      if (index < array.length - 1) {
        return `${line}[${gapText?.correctGapValues?.[index]?.join("; ")}]`;
      } else {
        return line;
      }
    })
    .join("");
  return stringWithCorrectValues || "";
}

/**
 * Get the correct gap values out of all square brackets and remove them
 */
export function extractCorrectGapValues(input: string) {
  //Match [...] but not if immediately followed by "(" because of markdown image/link
  const res = input.match(/\[[^\]]*\](?!\()/g);

  //replace [ and ] then split the values, trim them and return values that aren't empty
  //TODO maybe switch to value.slice(1, -1
  return res?.map((value = "") => {
    return value
      .replace("[", "")
      .replace("]", "")
      .split(";")
      .map((str) => str.trim())
      .filter((val) => val !== "");
  });
}
