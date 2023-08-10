import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

//Context
import { IQuestionIdsContext, QuestionIdsContext } from "../../../module/questionIdsContext";

//Interfaces
import { IParams } from "../../../../utils/types";
import { TUseQuestion } from "../../useQuestion";

//Icons
import { TbPlayerSkipBackFilled, TbPlayerSkipForwardFilled } from "react-icons/tb";

//TODO
//- Consider moving all Buttons into Components

type TQuestionNavigation = {
  handleResetQuestionComponent: TUseQuestion["handleResetQuestionComponent"];
};

export const QuestionNavigation: React.FC<TQuestionNavigation> = ({ handleResetQuestionComponent }) => {
  //Access custom hook navigation functions
  const { navigateToPreviousQuestion, navigateToNextQuestion, navigateToInputValue, preventInputSubmit, inputValue } =
    useQuestionNavigation();

  //JSX
  return (
    <div className={`question-navigation`}>
      {/* To previous Question */}
      <button
        data-testid='previous-question-button'
        aria-label='Navigate to previous Question'
        onClick={() => {
          navigateToPreviousQuestion();
          handleResetQuestionComponent();
        }}
        type='button'
      >
        <TbPlayerSkipBackFilled />
      </button>
      {/* To Input value */}
      <input
        aria-label='Navigate to question number'
        type='number'
        min='1'
        value={inputValue}
        onChange={navigateToInputValue}
        onKeyDown={preventInputSubmit}
      />
      {/* To next Question */}
      <button
        data-testid='nav-next-question-button'
        aria-label='Navigate to next Question'
        type='button'
        onClick={() => {
          navigateToNextQuestion();
          handleResetQuestionComponent();
        }}
      >
        <TbPlayerSkipForwardFilled />
      </button>
    </div>
  );
};

export const useQuestionNavigation = () => {
  const [inputValue, setInputValue] = useState<string>("");

  //context
  const { questionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //params
  const params = useParams<IParams>();

  //navigate
  let navigate = useNavigate();

  //Location (Search url=?...)
  const { search } = useLocation();

  const mode = new URLSearchParams(search).get("mode") || "practice"; //Fallback to practice if urlSearchParams is undefined
  const order = new URLSearchParams(search).get("order") || "chronological"; //Fallback to chronological order if urlSearchParams is undefined

  // Set the value of the navigation input on url change
  useEffect(() => {
    //find the current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    //Return the index and add 1 so indexes aren't zero based if question can be found
    if (currentIndex >= 0 && typeof currentIndex !== "undefined") {
      // Update the input value to be index + 1
      setInputValue((currentIndex + 1).toString());
    } else {
      setInputValue("");
    }

    return () => {
      setInputValue("");
    };
  }, [params.questionID, questionIds]);

  //Navigation
  //Navigate to the previous question
  const navigateToPreviousQuestion = () => {
    //get Current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceded else go to the beginning
    if (currentIndex && currentIndex - 1 >= 0) {
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[currentIndex - 1]}`,
        search: `?mode=${mode}&order=${order}`,
      });
    } else {
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[questionIds.length - 1]}`,
        search: `?mode=${mode}&order=${order}`,
      });
    }
  };

  // Navigate to the position with the input value and change input value
  const navigateToInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Don't allow the user to enter just 0
    if (value === "0") return;

    // Update state
    setInputValue(value);

    // Convert input string to number
    const intValue = parseInt(value);

    // Navigate to position if value is a number and bigger than 0
    if (!isNaN(intValue) && intValue >= 1) {
      const newID = questionIds[intValue - 1];

      if (newID) {
        navigate({
          pathname: `/module/${params.moduleID}/question/${newID}`,
          search: `?mode=${mode}&order=${order}`,
        });
      }
    }
  };

  //Prevent input submitting question on enter key
  const preventInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Go to the next question
  const navigateToNextQuestion = () => {
    //get Current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    if (typeof currentIndex === "undefined") return;

    //Go to next object (url/id) in array if the array length would not be exceeded else go to the beginning
    if (currentIndex + 1 < (questionIds?.length ?? 0)) {
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[currentIndex + 1]}`,
        search: `?mode=${mode}&order=${order}`,
      });
    } else {
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[0]}`,
        search: `?mode=${mode}&order=${order}`,
      });
    }
  };

  return {
    navigateToPreviousQuestion,
    navigateToNextQuestion,
    navigateToInputValue,
    preventInputSubmit,
    inputValue,
  } as const;
};
