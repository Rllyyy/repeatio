//Imports
//React
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

//Markdown related
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

//Material UI
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";

//Import css
import "./MultipleResponse.css";

//Import functions
import shuffleArray from "../../../../functions/shuffleArray.js";

//Component
const MultipleResponse = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [shuffleCounter, setShuffleCounter] = useState(1);

  //Run shuffle function on first render of component or when the user clicks the retry button
  //Also add isChecked state (to false which means unchecked)
  useEffect(() => {
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
  const handleCheckBoxClick = (optionID) => {
    let updatedShuffleOptions = shuffledOptions.map((item) => {
      //Set the isChecked state of the answer option to the opposite of the current value (true/false) where the ids are equal else just return the object as it is
      if (item.id === optionID) {
        return { ...item, isChecked: !item.isChecked };
      } else {
        return { ...item };
      }
    });

    // Update the state
    setShuffledOptions(updatedShuffleOptions);
  };

  const handleCheckBoxKeyPress = (e, optionID) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheckBoxClick(optionID);
    }
  };

  //Method so the parent can interact with this component
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
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
        <ul className='correction-multipleResponse-list'>
          {shuffledOptions.map((item) => {
            if (item.isCorrect) {
              return (
                <li className='correction-multipleResponse-list-item' key={item.id}>
                  <ReactMarkdown children={item.text} rehypePlugins={[rehypeRaw, remarkMath, rehypeKatex]} />
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
    <div className='question-multiple-response'>
      <FormControl disabled={formDisabled}>
        <FormGroup>
          {shuffledOptions.map((option, index) => {
            return (
              <FormControlLabel
                key={option.id}
                className='formControlLabel'
                data-testid={`formControlLabel-${index}`}
                checked={option.isChecked || false} //fallback (so it's a controlled input)
                onClick={() => handleCheckBoxClick(option.id)}
                onKeyDown={(e) => handleCheckBoxKeyPress(e, option.id)}
                control={
                  <Checkbox
                    className='formControlLabel-checkbox'
                    data-testid={`formControlLabel-checkbox-${index}`}
                    sx={{
                      color: `${!formDisabled ? "var(--custom-prime-color)" : "rgb(189, 189, 189)"} `,
                      "&.Mui-checked": {
                        color: `${!formDisabled ? "var(--custom-prime-color)" : "rgb(189, 189, 189)"} `,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    component={"span"}
                    onClick={(e) => e.stopPropagation()}
                    className={`formControlLabel-label ${formDisabled ? "label-disabled" : "label-enabled"}`}
                  >
                    <ReactMarkdown children={option.text} rehypePlugins={[rehypeRaw, remarkMath, rehypeKatex]} />
                  </Typography>
                }
              />
            );
          })}
        </FormGroup>
      </FormControl>
    </div>
  );
});

export default MultipleResponse;
