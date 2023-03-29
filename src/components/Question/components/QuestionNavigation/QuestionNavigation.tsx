import React, { useRef, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

//Context
import { IQuestionIdsContext, QuestionIdsContext } from "../../../module/questionIdsContext";

//Interfaces
import { IParams } from "../../../../utils/types";
import { TUseQuestion } from "../../useQuestion";

//Navigation svg from https://tablericons.com

//TODO
//- Consider moving all Buttons into Components
//- Remove to first and to last question

type TQuestionNavigation = {
  setShowAnswer: TUseQuestion["setShowAnswer"];
};

export const QuestionNavigation: React.FC<TQuestionNavigation> = ({ setShowAnswer }) => {
  //Access custom hook navigation functions
  const {
    navigateToFirstQuestion,
    navigateToPreviousQuestion,
    navigateToNextQuestion,
    navigateToLastQuestion,
    navigateToInputValue,
    progressPlaceholder,
  } = useQuestionNavigation();

  //JSX
  return (
    <div className={`question-navigation`}>
      {/* To first Question */}
      <button
        data-testid='first-question-button'
        aria-label='Navigate to first Question'
        onClick={() => {
          navigateToFirstQuestion();
          setShowAnswer(false);
        }}
        type='button'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='navigation-start'
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden='true'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M20 5v14l-12 -7z' />
          <line x1='5' y1='5' x2='5' y2='19' />
        </svg>
      </button>
      {/* To previous Question */}
      <button
        data-testid='previous-question-button'
        aria-label='Navigate to previous Question'
        onClick={() => {
          navigateToPreviousQuestion();
          setShowAnswer(false);
        }}
        type='button'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='navigation-before'
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='true'
          aria-hidden='true'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M7 4v16l13 -8z' />
        </svg>
      </button>
      {/* To Input value */}
      {/* //TODO handle Change  */}
      <input type='number' placeholder={progressPlaceholder} min='1' onKeyDown={navigateToInputValue} />
      {/* To next Question */}
      <button
        data-testid='nav-next-question-button'
        aria-label='Navigate to next Question'
        type='button'
        onClick={() => {
          navigateToNextQuestion();
          setShowAnswer(false);
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='navigation-skip'
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden='true'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M7 4v16l13 -8z' />
        </svg>
      </button>
      {/* Button to last Question */}
      <button
        data-testid='last-question-button'
        aria-label='Navigate to last Question'
        type='button'
        onClick={() => {
          navigateToLastQuestion();
          setShowAnswer(false);
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='icon icon-tabler icon-tabler-player-skip-forward'
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden='true'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M4 5v14l12 -7z' />
          <line x1='19' y1='5' x2='19' y2='19' />
        </svg>
      </button>
    </div>
  );
};

export const useQuestionNavigation = () => {
  //context
  const { questionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //params
  const params = useParams<IParams>();

  //History
  let history = useHistory();

  //Location (Search url=?...)
  const { search } = useLocation();

  const mode = useRef(new URLSearchParams(search).get("mode") || "practice"); //Fallback to practice if urlSearchParams is undefined
  const order = useRef(new URLSearchParams(search).get("order") || "chronological"); //Fallback to chronological order if urlSearchParams is undefined

  //Navigation
  //Go to first question in module
  const navigateToFirstQuestion = () => {
    const firstIDInQuestionArray = questionIds?.[0];

    //Only push to history if not already at the first question
    //TODO notify the user that the already is at the beginning
    if (params.questionID !== firstIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${firstIDInQuestionArray}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    }
  };

  //Go to the previous question
  const navigateToPreviousQuestion = () => {
    //get Current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceded else go to the beginning
    if (currentIndex && currentIndex - 1 >= 0) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[currentIndex - 1]}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[questionIds.length - 1]}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    }
  };

  //TODO: Go to provided input
  const navigateToInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    toast.warn("This feature isn't implemented yet :/", {
      position: toast.POSITION.TOP_RIGHT,
    });
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Return the placeholder value for the input
  const currentQuestionPageIndexPlaceholder = () => {
    //find the current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    if (typeof currentIndex === "undefined") return;

    //Return the index and add 1 so indexes aren't zero based if question can be found
    if (currentIndex >= 0) {
      return (currentIndex + 1).toString();
    } else {
      return undefined;
    }
  };

  //Go to the next question
  const navigateToNextQuestion = () => {
    //get Current index
    const currentIndex = questionIds?.findIndex((id) => id === params.questionID);

    if (typeof currentIndex === "undefined") return;

    //Go to next object (url/id) in array if the array length would not be exceeded else go to the beginning
    if (currentIndex + 1 < (questionIds?.length ?? 0)) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[currentIndex + 1]}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[0]}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    }
  };

  //Go to last question
  const navigateToLastQuestion = () => {
    const lastIDInQuestionArray = questionIds?.[questionIds.length - 1];

    //Only push to history if not already at the last point
    //TODO notify the user that the end was reached
    if (params.questionID !== lastIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${lastIDInQuestionArray}`,
        search: `?mode=${mode.current}&order=${order.current}`,
      });
    }
  };

  return {
    navigateToFirstQuestion,
    navigateToPreviousQuestion,
    navigateToNextQuestion,
    navigateToLastQuestion,
    navigateToInputValue,
    progressPlaceholder: currentQuestionPageIndexPlaceholder(),
  } as const;
};
