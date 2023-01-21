import React, { useState, useEffect } from "react";

//Material UI
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//Import functions
import { objectWithoutProp } from "../../helpers";

//Import Types
import { TErrors } from "../../QuestionEditor";
import { IMultipleChoice } from "../../../Question/QuestionTypes/MultipleChoice/MultipleChoice";
import { TAnswerOptions } from "../../../Question/useQuestion";

interface IMultipleChoiceEditor {
  name?: string;
  answerValues: IMultipleChoice[];
  handleEditorChange: (value: TAnswerOptions) => void;
  lastSelected: string;
  setLastSelected: React.Dispatch<React.SetStateAction<string>>;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>;
}

//Component
export const MultipleChoiceEditor = ({
  name,
  answerValues,
  handleEditorChange,
  lastSelected,
  setLastSelected,
  answerOptionsError,
  setErrors,
}: IMultipleChoiceEditor) => {
  const [radioGroupValue, setRadioGroupValue] = useState("");

  //Prevent the modal from closing when hitting escape while on the radio/input
  const preventLabelEscapeKeyExit = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  //Update the selected correct value in the QuestionEditor question state
  const handleRadioGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const returnVal = answerValues.map((item) => {
      if (item.id === e.target.value) {
        return { ...item, isCorrect: !item.isCorrect };
      } else {
        return { ...item, isCorrect: false };
      }
    });
    //Remove any errors from answerOptions but keep all other errors
    //Clears firefox mobile errors because firefox android does not support HTML5 validation
    if (answerOptionsError) {
      setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
    }

    handleEditorChange([...returnVal]);
  };

  //Update text in the QuestionEditor question state
  const updateText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const returnVal = answerValues.map((item) => {
      if (item.id === e.target.getAttribute("data-id")) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    handleEditorChange([...returnVal]);
  };

  //Update the last selected value
  const selectElement = (e: React.MouseEvent<HTMLLabelElement>) => {
    setLastSelected(e.currentTarget.getAttribute("data-id") || "");
  };

  //Prevent escape closing the form
  //TODO change this to form not closing on escape in general
  const radioPreventSubmission = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
    }

    if (e.key === "Escape") {
      setLastSelected("");
    }
  };

  function exitSelection(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      setLastSelected("");
      return;
    }
  }

  //TODO: https://stackoverflow.com/questions/61564465/how-do-i-create-a-tab-spacing-inside-textarea-reactjs-bootstrap
  /* const preventTabFocusLost = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
  }; */

  //Find the correct multiple choice id
  //Is used to keep the state of the (grand) parent editor and this in sync
  useEffect(() => {
    const choiceObj = answerValues?.find((item) => item.isCorrect === true);
    setRadioGroupValue(choiceObj?.id || "");

    return () => {
      setRadioGroupValue("");
    };
  }, [answerValues]);

  //JSX
  return (
    <FormControl required>
      <RadioGroup value={radioGroupValue} onChange={handleRadioGroupChange}>
        {answerValues?.map((item) => {
          const { id, text } = item;
          return (
            <FormControlLabel
              onClick={selectElement}
              onKeyDown={preventLabelEscapeKeyExit}
              data-testid={id}
              data-id={id}
              className={`${lastSelected === id ? "lastSelected" : ""}`}
              key={id}
              name='FormControl'
              value={id}
              control={
                <Radio
                  className='formControlLabel-radio'
                  onKeyDown={radioPreventSubmission}
                  sx={{
                    color: "var(--custom-prime-color)",
                    "&.Mui-checked": {
                      color: "var(--custom-prime-color)",
                    },
                  }}
                  required
                />
              }
              label={
                <TextareaAutosize
                  spellCheck='false'
                  autoComplete='false'
                  required
                  className='editor-label-textarea'
                  onChange={updateText}
                  data-id={id}
                  onKeyDown={exitSelection}
                  value={text}
                />
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};
