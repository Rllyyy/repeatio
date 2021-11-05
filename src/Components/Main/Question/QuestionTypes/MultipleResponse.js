import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";

import "./MultipleResponse.css";

const MultipleResponse = ({ answerOptions }) => {
  return (
    <div className='question-multiple-response'>
      <FormGroup>
        {answerOptions.map((option, index) => {
          return (
            <FormControlLabel
              key={index}
              className='formControlLabel'
              control={
                <Checkbox
                  className='formControlLabel-checkbox'
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
      </FormGroup>
    </div>
  );
};

export default MultipleResponse;
