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
import shuffleArray from "../../../../../functions/shuffleArray.js";

/* Component */
const MultipleChoice = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //states
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [radioGroupValue, setRadioGroupValue] = useState("");

  //Update state of radioGroupValue
  const handleChange = (e) => {
    setRadioGroupValue(e.target.value);
  };

  //Prevent Form submit on enter and update state
  const handleRadioEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Run shuffle function on first render of component
  useEffect(() => {
    //Update the state with the new shuffled array
    setShuffledOptions(shuffleArray(options));

    //Cleanup the states
    return () => {
      setShuffledOptions([]);
    };
  }, [options]);

  //Functions that are called by parent
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct. Called by the parent form (check button) in a ref
    checkAnswer() {
      //Check if the value the user selected is correct (isCorrect===true) in the options array
      const answeredCorrect = options.find((option) => option.id === radioGroupValue)?.isCorrect;

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
      setRadioGroupValue("");
    },

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      setRadioGroupValue("");
      setShuffledOptions(shuffleArray(options));
    },
  }));

  //JSX
  return (
    <div className='question-multiple-choice'>
      <FormControl disabled={formDisabled}>
        <RadioGroup value={radioGroupValue} onChange={handleChange}>
          {shuffledOptions?.map((option) => {
            return (
              <FormControlLabel
                key={option.id}
                className='formControlLabel'
                value={option.id}
                onKeyDown={(e) => handleRadioEnter(e, option.id)}
                data-testid={option.id}
                control={
                  <Radio
                    className='formControlLabel-radio'
                    sx={{
                      color: `${!formDisabled ? "var(--custom-prime-color)" : "var(--custom-border-color-light)"}`,
                      "&.Mui-checked": {
                        color: `${!formDisabled ? "var(--custom-prime-color)" : "var(--custom-border-color-light)"}`,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    component={"span"}
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