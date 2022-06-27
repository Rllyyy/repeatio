//Imports
//React
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

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
const MultipleResponse = forwardRef(({ options, setAnswerCorrect, setShowAnswer, formDisabled }, ref) => {
  //States
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  //Run shuffle function on first render of component or when the user clicks the retry button
  //Also add isChecked state (to false which means unchecked)
  useEffect(() => {
    setShuffledOptions(shuffleArray(options));

    //Cleanup the states
    return () => {
      setShuffledOptions([]);
      setSelectedOptions([]);
    };
  }, [options]);

  const handleChange = (e) => {
    if (selectedOptions.includes(e.target.value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== e.target.value));
    } else {
      setSelectedOptions([...selectedOptions, e.target.value]);
    }
  };

  const handleCheckBoxKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleChange(e);
    }
  };

  //Method so the parent can interact with this component
  useImperativeHandle(ref, () => ({
    //Check if the answer is correct.
    checkAnswer() {
      //every value should be the same (true/false)
      //TODO check if every value is included in in there and they have the same length
      const answeredCorrect = shuffledOptions.every((option) => {
        if (option.isCorrect) {
          return selectedOptions.includes(option.id);
        } else {
          return !selectedOptions.includes(option.id);
        }
      });

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
                value={option.id}
                className='formControlLabel'
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
