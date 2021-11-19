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
const MultipleChoice = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
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

  //Functions that are called by parent
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct. Called by the parent form (check button) in a ref
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

    //Return the correct answer in JSX so it can be displayed in the parent component
    returnAnswer() {
      return (
        <ul className='correction-multipleChoice-list'>
          {shuffledOptions.map((item) => {
            if (item.isCorrect) {
              return (
                <li className='correction-multipleChoice-list-item' key={item.id}>
                  {item.text}
                </li>
              );
            } else {
              return null;
            }
          })}
        </ul>
      );
    },

    //Reset User selection
    resetSelection() {
      const unselectedOption = shuffledOptions.map((item) => {
        return { ...item, isChecked: false };
      });

      setShuffledOptions(unselectedOption);
    },
  }));

  //JSX
  return (
    <div className='question-multiple-choice'>
      <FormControl disabled={formDisabled}>
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
                      color: `${!formDisabled ? "var(--custom-prime-color)" : "rgb(189, 189, 189)"}`,
                      "&.Mui-checked": {
                        color: `${!formDisabled ? "var(--custom-prime-color)" : "rgb(189, 189, 189)"}`,
                      },
                    }}
                  />
                }
                label={<Typography className={`formControlLabel-label ${formDisabled && "label-disabled"}`}>{option.text}</Typography>}
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
});

export default MultipleChoice;
