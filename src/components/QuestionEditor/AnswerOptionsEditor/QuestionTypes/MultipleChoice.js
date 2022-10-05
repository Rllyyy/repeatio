import { useState, useEffect } from "react";

//Material UI
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//Component
export const MultipleChoice = ({ answerValues, handleEditorChange, lastSelected, setLastSelected }) => {
  const [radioGroupValue, setRadioGroupValue] = useState("");

  //Prevent the modal from closing when hitting escape while on the radio/input
  const preventLabelEscapeKeyExit = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  //Update the selected correct value in the QuestionEditor question state
  const handleRadioGroupChange = (e) => {
    const returnVal = answerValues.map((item) => {
      if (item.id === e.target.value) {
        return { ...item, isCorrect: !item.isCorrect };
      } else {
        return { ...item, isCorrect: false };
      }
    });
    handleEditorChange([...returnVal]);
  };

  //Update text in the QuestionEditor question state
  const updateText = (e, id) => {
    const returnVal = answerValues.map((item) => {
      if (item.id === id) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    handleEditorChange([...returnVal]);
  };

  //Update the last selected value
  const selected = (id) => {
    setLastSelected(id);
  };

  //Prevent escape closing the form
  //TODO change this to form not closing on escape in general
  const radioPreventSubmission = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleRadioGroupChange(e);
      e.preventDefault();
    }

    if (e.key === "Escape") {
      setLastSelected("");
    }
  };

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
    <FormControl>
      <RadioGroup value={radioGroupValue} onChange={handleRadioGroupChange}>
        {answerValues?.map((item) => {
          const { id, text } = item;
          return (
            <FormControlLabel
              onClick={() => selected(id)}
              onKeyDown={preventLabelEscapeKeyExit}
              data-testid={id}
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
                  onChange={(e) => updateText(e, id)}
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
