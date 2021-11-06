import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

import "./MultipleChoice.css";

const MultipleChoice = ({ answerOptions }) => {
  return (
    <div className='question-multiple-choice'>
      <FormControl>
        <RadioGroup>
          {answerOptions.map((option, index) => {
            return (
              <FormControlLabel
                key={index}
                className='formControlLabel'
                value={option}
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
                label={<Typography className='formControlLabel-label'>{option}</Typography>}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export default MultipleChoice;
