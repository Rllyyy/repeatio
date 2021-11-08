import React, { useEffect, useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

//Import css
import "./MultipleChoice.css";

//Import functions
import shuffleArray from "../../../../functions/shuffleArray.js";

//Component
const MultipleChoice = ({ options }) => {
  //states
  const [shuffledOptions, setShuffledOptions] = useState([]);

  //Run shuffle function on first render of
  //Future needs to be depended on question id
  useEffect(() => {
    setShuffledOptions(shuffleArray(options));
  }, [options]);

  //JSX
  return (
    <div className='question-multiple-choice'>
      <FormControl>
        <RadioGroup>
          {shuffledOptions.map((option, index) => {
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
