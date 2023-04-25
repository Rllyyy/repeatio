import React from "react";
import TextAreaAutoSize from "react-textarea-autosize";

//Material UI
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";

//Functions
import { objectWithoutProp } from "../../helpers";

//Import Interfaces
import { IMultipleResponse } from "../../../Question/QuestionTypes/MultipleResponse/MultipleResponse";
import { TErrors } from "../../QuestionEditor";

//interface
interface IMultipleResponseEditor {
  name?: string;
  options: IMultipleResponse[];
  handleEditorChange: (value: IMultipleResponse[]) => void;
  lastSelected: string;
  setLastSelected: React.Dispatch<React.SetStateAction<string>>;
  answerOptionsError: string;
  setErrors: React.Dispatch<React.SetStateAction<TErrors>>;
}

//Component
export const MultipleResponseEditor = ({
  name,
  options,
  handleEditorChange,
  lastSelected,
  setLastSelected,
  answerOptionsError,
  setErrors,
}: IMultipleResponseEditor) => {
  //Prevent the modal from closing when hitting escape while on the checkbox
  const preventLabelEscapeKeyExit = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  //Handle the change to the checkbox change
  const handleCheckBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const returnVal = options.map((option) => {
      if (option.id === e.target.value) {
        return { ...option, isCorrect: !option.isCorrect };
      } else {
        return { ...option };
      }
    });

    //Remove any errors from answerOptions but keep all other errors
    //Clears firefox mobile errors because firefox android does not support HTML5 validation
    if (answerOptionsError) {
      setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));
    }

    handleEditorChange(returnVal);
  };

  //Update text of the option in the QuestionEditor question state
  const handleCheckBoxInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const returnVal = options.map((item) => {
      if (item.id === e.target.getAttribute("data-id")) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    handleEditorChange([...returnVal]);
  };

  function exitSelection(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      setLastSelected("");
      return;
    }
  }

  //Update checkbox state on enter keypress on the checkbox
  const checkBoxPreventSubmission = (e: unknown) => {
    if ((e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
      (e as React.KeyboardEvent<HTMLInputElement>).preventDefault();
      handleCheckBoxChange(e as React.ChangeEvent<HTMLInputElement>);
    }
  };

  //Update selected value (dotted line)
  const selectElement = (e: React.MouseEvent<HTMLLabelElement>) => {
    setLastSelected(e.currentTarget.getAttribute("data-id") || "");
  };

  return (
    <FormControl required>
      <FormGroup>
        {options?.map((option) => {
          return (
            <FormControlLabel
              onClick={selectElement}
              onKeyDown={preventLabelEscapeKeyExit}
              key={option.id}
              value={option.id}
              data-id={option.id}
              className={`formControlLabel ${lastSelected === option.id ? "lastSelected" : ""}`}
              data-testid={`formControlLabel-${option.id}`}
              control={
                <Checkbox
                  checked={option.isCorrect || false}
                  onChange={handleCheckBoxChange}
                  onKeyDown={checkBoxPreventSubmission}
                  className='formControlLabel-checkbox'
                  data-testid={`formControlLabel-checkbox-${option.id}`}
                  sx={{
                    color: "var(--custom-prime-color)",
                    "&.Mui-checked": {
                      color: "var(--custom-prime-color)",
                    },
                  }}
                />
              }
              label={
                <TextAreaAutoSize
                  spellCheck='false'
                  autoComplete='false'
                  className='editor-label-textarea'
                  required
                  onChange={handleCheckBoxInputChange}
                  onKeyDown={exitSelection}
                  data-id={option.id}
                  value={option.text}
                />
              }
            />
          );
        })}
      </FormGroup>
    </FormControl>
  );
};
