//Material UI
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//Functions
import { objectWithoutProp } from "../../helpers.js";

//Component
export const MultipleResponse = ({ options, handleEditorChange, lastSelected, setLastSelected, setErrors }) => {
  //Prevent the modal from closing when hitting escape while on the checkbox
  const preventLabelEscapeKeyExit = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  //Handle the change to the checkbox change
  const handleCheckBoxChange = (e) => {
    const returnVal = options.map((option) => {
      if (option.id === e.target.value) {
        return { ...option, isCorrect: !option.isCorrect };
      } else {
        return { ...option };
      }
    });

    //Remove any errors from answerOptions but keep all other errors
    setErrors((prev) => objectWithoutProp({ object: prev, deleteProp: "answerOptions" }));

    handleEditorChange(returnVal);
  };

  //Update text of the option in the QuestionEditor question state
  const handleCheckBoxInputChange = (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.key === "Escape") {
      setLastSelected("");
      return;
    }

    const returnVal = options.map((item) => {
      if (item.id === id) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    handleEditorChange([...returnVal]);
  };

  //Update checkbox state on enter keypress on the checkbox
  const checkBoxPreventSubmission = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheckBoxChange(e);
    }
  };

  //Update selected value (dotted line)
  const selected = (id) => {
    setLastSelected(id);
  };

  return (
    <FormControl required /* error={filterTest} */>
      <FormGroup>
        {options?.map((option) => {
          return (
            <FormControlLabel
              onClick={() => selected(option.id)}
              onKeyDown={preventLabelEscapeKeyExit}
              key={option.id}
              value={option.id}
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
                <TextareaAutosize
                  spellCheck='false'
                  autoComplete='false'
                  className='editor-label-textarea'
                  required
                  onChange={(e) => handleCheckBoxInputChange(e, option.id)}
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

export default MultipleResponse;
