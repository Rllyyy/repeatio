//Material UI
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import TextareaAutosize from "@mui/material/TextareaAutosize";

//Component
const MultipleResponse = ({ options, handleEditorChange, lastSelected, setLastSelected }) => {
  //Handle selection change
  const handleChange = (e) => {
    const returnVal = options.map((option) => {
      if (option.id === e.target.value) {
        return { ...option, isCorrect: !option.isCorrect };
      } else {
        return { ...option };
      }
    });

    handleEditorChange(returnVal);
  };

  //Update checkbox state on enter keypress
  const handleCheckBoxKeyPress = (e) => {
    if (e.key === "Enter") {
      handleChange(e);
      e.preventDefault();
    }
  };

  //Update text of the option in the QuestionEditor question state
  const updateText = (e, id) => {
    const returnVal = options.map((item) => {
      if (item.id === id) {
        return { ...item, text: e.target.value };
      } else {
        return { ...item };
      }
    });

    handleEditorChange([...returnVal]);
  };

  //Update selected value (dotted component)
  const selected = (id) => {
    setLastSelected(id);
  };

  return (
    <FormControl>
      <FormGroup>
        {options?.map((option, index) => {
          return (
            <FormControlLabel
              onClick={() => selected(option.id)}
              key={option.id}
              value={option.id}
              className={`formControlLabel ${lastSelected === option.id ? "lastSelected" : ""}`}
              data-testid={`formControlLabel-${index}`}
              control={
                <Checkbox
                  checked={option.isCorrect || false}
                  onKeyDown={(e) => handleCheckBoxKeyPress(e)}
                  onChange={handleChange}
                  className='formControlLabel-checkbox'
                  data-testid={`formControlLabel-checkbox-${index}`}
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
                  onChange={(e) => updateText(e, option.id)}
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
