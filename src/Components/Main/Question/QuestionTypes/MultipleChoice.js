import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

//Import css
import "./MultipleChoice.css";

//Import functions
import shuffleArray from "../../../../functions/shuffleArray.js";

/* Component */
const MultipleChoice = forwardRef(({ options, setAnswerCorrect, setShowAnswer }, ref) => {
  //states
  const [shuffledOptions, setShuffledOptions] = useState([]);

  //Run shuffle function on first render of component and add isChecked state
  //Future needs to be depended on question id
  useEffect(() => {
    //Shuffle Array with imported function
    const shuffledArray = shuffleArray(options);

    //Add is checked to each object in array
    let shuffleArrayChecked = shuffledArray.map((item) => {
      return { ...item, isChecked: false };
    });

    //Update the state with the new shuffled array
    setShuffledOptions(shuffleArrayChecked);
  }, [options]);

  //Update the isChecked value of shuffledOptions state
  const updateIsChecked = (optionID) => {
    // console.log(optionID);
    let updatedShuffleOptions = shuffledOptions.map((item) => {
      //Set the state of the state to true where the ids are equal else change it to false (because only one option can be checked at the time => multiple Choice)
      if (item.id === optionID) {
        return { ...item, isChecked: !item.isChecked };
      } else {
        return { ...item, isChecked: false };
      }
    });

    // Update the state
    setShuffledOptions(updatedShuffleOptions);
  };

  //Check if the answer is correct. Called by the parent form (check button) in a ref
  useImperativeHandle(ref, () => ({
    checkAnswer() {
      const checkArray = shuffledOptions.map((item) => {
        if (item.isChecked === item.isCorrect) {
          return "correct";
        } else {
          return "false";
        }
      });

      //Show if the answer is correct in the parent component
      if (checkArray.includes("false")) {
        setShowAnswer(true);
        setAnswerCorrect(false);
      } else {
        setShowAnswer(true);
        setAnswerCorrect(true);
      }
    },
  }));

  //JSX
  return (
    <div className='question-multiple-choice'>
      <FormControl>
        <RadioGroup>
          {shuffledOptions.map((option) => {
            return (
              <FormControlLabel
                key={option.id}
                className='formControlLabel'
                checked={option.isChecked}
                onChange={() => updateIsChecked(option.id)}
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
                label={<Typography className='formControlLabel-label'>{option.text}</Typography>}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
});

export default MultipleChoice;
