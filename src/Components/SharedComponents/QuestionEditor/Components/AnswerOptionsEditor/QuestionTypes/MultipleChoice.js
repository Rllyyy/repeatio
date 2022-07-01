import { useState, useEffect } from "react";

//Material UI
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//Component
const MultipleChoice = ({ answerValues, handleEditorChange, lastSelected, setLastSelected }) => {
  const [radioGroupValue, setRadioGroupValue] = useState("");

  //Update the selected correct value in the QuestionEditor question state
  const handleChange = (e) => {
    const returnVal = answerValues.map((item) => {
      if (item.id === e.target.value) {
        return { ...item, isCorrect: true };
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
  const handleKeyDown = (e) => {
    e.stopPropagation();

    if (e.key === "Enter") {
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
      <RadioGroup value={radioGroupValue} onChange={handleChange}>
        {answerValues?.map((item) => {
          const { id, text } = item;
          return (
            <FormControlLabel
              onClick={() => selected(id)}
              onKeyDown={handleKeyDown}
              className={`${lastSelected === id ? "lastSelected" : ""}`}
              key={id}
              value={id}
              control={
                <Radio
                  className='formControlLabel-radio'
                  sx={{
                    color: "var(--custom-prime-color)",
                    "&.Mui-checked": {
                      color: "var(--custom-prime-color)",
                    },
                  }}
                />
              }
              label={
                <TextareaAutosize
                  spellCheck='false'
                  autoComplete='false'
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

export default MultipleChoice;
