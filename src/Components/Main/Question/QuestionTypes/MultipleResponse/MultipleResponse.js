//Imports
//React
import { useState, forwardRef, useImperativeHandle, useLayoutEffect } from "react";

//Markdown related
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
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
import shuffleArray from "../../../../../functions/shuffleArray.js";

//Component
const MultipleResponse = forwardRef(({ options, formDisabled }, ref) => {
  //States
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  //Run shuffle function on first render of component or when the user clicks the retry button
  //Also add isChecked state (to false which means unchecked)
  useLayoutEffect(() => {
    setShuffledOptions(shuffleArray(options));

    //Cleanup the states
    return () => {
      setShuffledOptions([]);
      setSelectedOptions([]);
    };
  }, [options]);

  //Update the selectedOptions state on change
  const handleChange = (e) => {
    if (selectedOptions.includes(e.target.value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== e.target.value));
    } else {
      setSelectedOptions([...selectedOptions, e.target.value]);
    }
  };

  //Allow the user to use enter to add to the selectedOptions state
  const handleCheckBoxKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleChange(e);
    }
  };

  //Styles on form submit to show what answers are correct
  const customStyle = (option) => {
    //If the form hasn't yet been submitted, return
    if (!formDisabled) return;

    if (option.isCorrect && selectedOptions.includes(option.id)) {
      //Selected option is correct
      return { outline: "1px solid green" };
    } else if (option.isCorrect && !selectedOptions.includes(option.id)) {
      //Selected option was not selected but is correct
      return { outline: "1px solid red" };
    } else if (!option.isCorrect && selectedOptions.includes(option.id)) {
      //Option was selected but it is not correct
      return { outline: "1px solid red" };
    }
    //The case that a option is false and the user did not selected it is not tested
  };

  //Method so the parent can interact with this component
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct and return true/false to the question form component
    checkAnswer() {
      //every value should be the same (true/false)
      return shuffledOptions.every((option) => {
        if (option.isCorrect) {
          return selectedOptions.includes(option.id);
        } else {
          return !selectedOptions.includes(option.id);
        }
      });
    },

    //Return the correct answer in JSX so it can be displayed in the parent component
    //This has to be done in here because this component shuffles the options.
    //If this wasn't the case the options that the user can selected and the answer options are not in the same order causing confusion.
    //TODO Maybe change the shuffling to the parent, then correction could be it's own component (see comment above)
    returnAnswer() {
      return (
        <ul className='correction-multipleResponse-list'>
          {shuffledOptions.map((item) => {
            if (item.isCorrect) {
              return (
                <li className='correction-multipleResponse-list-item' key={item.id}>
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
      setSelectedOptions([]);
    },

    //Trigger a useEffect (rerender) by increasing a state value
    resetAndShuffleOptions() {
      setSelectedOptions([]);
      setShuffledOptions(shuffleArray(options));
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
                style={customStyle(option)}
                value={option.id}
                data-testid={`formControlLabel-${index}`}
                onKeyDown={(e) => handleCheckBoxKeyPress(e, option.id)}
                control={
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onChange={handleChange}
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
                    className={`formControlLabel-label ${formDisabled ? "label-disabled" : "label-enabled"}`}
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
        </FormGroup>
      </FormControl>
    </div>
  );
});

export default MultipleResponse;
