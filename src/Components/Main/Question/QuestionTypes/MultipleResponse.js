import React, { useState, useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";

//Import css
import "./MultipleResponse.css";

//Import functions
import shuffleArray from "../../../../functions/shuffleArray.js";

const MultipleResponse = ({ options }) => {
  //states
  const [shuffledOptions, setShuffledOptions] = useState([]);

  //Run shuffle function on first mount of component or when options is updated (although that should never happen, just react complaining about a missing dependency)
  useEffect(() => {
    setShuffledOptions(shuffleArray(options));
  }, [options]);

  //JSX
  return (
    <div className='question-multiple-response'>
      <FormGroup>
        {shuffledOptions.map((option, index) => {
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
