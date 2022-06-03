//Imports
//React
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

//Material UI
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

//Markdown related
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

//Import css
import "./MultipleChoice.css";

//Import functions
import shuffleArray from "../../../../functions/shuffleArray.js";

/* Component */
const MultipleChoice = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //states
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [shuffleCounter, setShuffleCounter] = useState(1);

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

    //Cleanup the states
    return () => {
      setShuffledOptions([]);
      setShuffleCounter(0);
    };
  }, [options, shuffleCounter]);

  //Update the isChecked value of shuffledOptions state
  const handleRadioClick = (optionID) => {
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

  //Prevent Form submit on enter and update state
  const handleRadioEnter = (e, optionID) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRadioClick(optionID);
    }
  };

  //Functions that are called by parent
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct. Called by the parent form (check button) in a ref
    checkAnswer() {
      //every value should be the same (true/false) in the properties isChecked and isCorrect
      const answeredCorrect = shuffledOptions.every(
        (option, index) => option.isChecked === shuffledOptions[index].isCorrect
      );

      //Show if the answer is correct in the parent component
      setShowAnswer(true);
      if (answeredCorrect) {
        setAnswerCorrect(true);
      } else {
        setAnswerCorrect(false);
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
                  <ReactMarkdown
                    children={item.text}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    remarkPlugins={[remarkGfm, remarkMath]}
                  />
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

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      setShuffleCounter((prev) => prev + 1);
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
                onClick={() => handleRadioClick(option.id)}
                onKeyDown={(e) => handleRadioEnter(e, option.id)}
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
                label={
                  <Typography
                    component={"span"}
                    onClick={(e) => e.stopPropagation()}
                    className={`formControlLabel-label ${formDisabled && "label-disabled"}`}
                  >
                    <ReactMarkdown
                      children={option.text}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      remarkPlugins={[remarkGfm, remarkMath]}
                    />
                  </Typography>
                }
              />
            );
          })}
        </RadioGroup>
      </FormControl>
    </div>
  );
});

export default MultipleChoice;
