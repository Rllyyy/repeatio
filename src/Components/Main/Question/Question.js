//Import
//React stuff
import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { ModuleContext } from "../../../Context/ModuleContext.js";

//Custom Hooks
import { useSize } from "../../../hooks/useSize";

//Markdown related
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

//Import Question Types
import MultipleResponse from "./QuestionTypes/MultipleResponse.js";
import MultipleChoice from "./QuestionTypes/MultipleChoice/MultipleChoice.js";
import GapText from "./QuestionTypes/GapText/GapText.js";
import ExtendedMatch from "./QuestionTypes/ExtendedMatch/ExtendedMatch.js";
import GapTextDropdown from "./QuestionTypes/GapTextDropdown/GapTextDropdown.js";

//Import CSS
import "./Question.css";

//Import SVG
import { BiCheck } from "react-icons/bi";
import { BsChevronDoubleDown } from "react-icons/bs";
import { CgUndo } from "react-icons/cg";
import { MdNavigateNext } from "react-icons/md";

//Import Components
import Bookmark from "./Components/Bookmark.js";

//Navigation svg from https://tablericons.com

//Component
const Question = () => {
  /* HOOKS */
  //States
  const [question, setQuestion] = useState({});
  const [showNav, setShowNav] = useState(false);
  const [collapsedNav, setCollapsedNav] = useState();
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState();
  const [formDisabled, setFormDisabled] = useState(false);
  const [currentQuestionPage, setCurrentQuestionPage] = useState();

  //Params
  const params = useParams();

  //History
  let history = useHistory();

  //Location (Search url=?...)
  const { search } = useLocation();

  //Context
  const { filteredQuestions, moduleData, setContextModuleID } = useContext(ModuleContext);

  //Refs
  const questionDataRef = useRef(null);
  const questionBottomRef = useRef(null);
  const questionAnswerRef = useRef(); //Checking if an answer is correct id done in the child component
  const questionCorrectionRef = useRef();
  const practiceMode = useRef(new URLSearchParams(search).get("mode") || "chronological"); //Fallback to chronological if urlSearchParams is undefined

  //Custom Hooks
  const size = useSize(questionBottomRef);

  /* UseEffects */
  //Set the question state by finding the correct question with the url parameters
  useEffect(() => {
    if (params.questionID === undefined) {
      return;
    }
    //Guard to refetch context (could for example happen on F5)
    if (moduleData === undefined || filteredQuestions.length <= 0) {
      setContextModuleID(params.moduleID);
      return;
    }

    //Find the correct question in the moduleData context
    const returnQuestion = filteredQuestions.find((questionItem) => questionItem.id === params.questionID);

    //If it not in this context
    //!Implement

    //Set the question state
    setQuestion(returnQuestion);

    //Scroll to top
    questionDataRef.current.scrollTo(0, 0);

    //set a variable so it can be used when component unmounts
    const questionAnswerResetRef = questionAnswerRef.current;

    return () => {
      setFormDisabled(false);
      setShowAnswer(false);
      setAnswerCorrect();
      setQuestion({});
      if (questionAnswerResetRef !== undefined && questionAnswerResetRef !== null) {
        questionAnswerResetRef.resetSelection();
      }
    };
  }, [moduleData, params.questionID, params.moduleID, setContextModuleID, filteredQuestions]);

  //Show the index of the current question
  //TODO use memo this
  useEffect(() => {
    if (filteredQuestions === undefined || filteredQuestions.length === 0) return;

    //Find the index of the question by filtering the module context
    const currentIndex = filteredQuestions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Add 1 because arrays are zero based and update the state
    setCurrentQuestionPage(currentIndex + 1);
  }, [params.questionID, filteredQuestions]);

  //At 800 px collapse the navbar so the buttons and navigation are stacked
  useEffect(() => {
    if (size?.width > 800) {
      setCollapsedNav(false);
    } else {
      setCollapsedNav(true);
    }
  }, [size?.width]);

  //Scroll to correction feedback for user after show answer is updated and only
  useEffect(() => {
    if (showAnswer) {
      questionCorrectionRef.current.scrollIntoView();
    }
  }, [showAnswer]);

  /* FUNCTIONS */
  //Decide what Question Type to return
  const questionType = useCallback(
    (type, options, formDisabled) => {
      //Guard: return if initial question object is empty to not throw the default error
      if (Object.keys(question).length === 0) return;
      //decide what question type to return
      switch (type) {
        case "multiple-response":
          return (
            <MultipleResponse
              options={options}
              ref={questionAnswerRef}
              setAnswerCorrect={setAnswerCorrect}
              setShowAnswer={setShowAnswer}
              formDisabled={formDisabled}
            />
          );
        case "multiple-choice":
          return (
            <MultipleChoice
              options={options}
              ref={questionAnswerRef}
              setAnswerCorrect={setAnswerCorrect}
              setShowAnswer={setShowAnswer}
              formDisabled={formDisabled}
            />
          );
        case "gap-text":
          return (
            <GapText
              options={options}
              ref={questionAnswerRef}
              setAnswerCorrect={setAnswerCorrect}
              setShowAnswer={setShowAnswer}
              formDisabled={formDisabled}
            />
          );
        case "extended-match":
          return (
            <ExtendedMatch
              options={options}
              ref={questionAnswerRef}
              setAnswerCorrect={setAnswerCorrect}
              setShowAnswer={setShowAnswer}
              formDisabled={formDisabled}
            />
          );
        case "gap-text-dropdown":
          return (
            <GapTextDropdown
              options={options}
              ref={questionAnswerRef}
              setAnswerCorrect={setAnswerCorrect}
              setShowAnswer={setShowAnswer}
              formDisabled={formDisabled}
            />
          );
        default:
          throw new Error("No matching question Type");
      }
    },
    [question]
  );

  //Navigation
  //Go to first question in module
  const toFirstQuestion = () => {
    const firstIDInQuestionArray = filteredQuestions[0].id;

    //Only push to history if not already at the first question
    //TODO notify the user that the already is at the beginning
    if (params.questionID !== firstIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${firstIDInQuestionArray}`,
        search: `?mode=${practiceMode.current}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  //Go to the previous question
  const toPreviousQuestion = () => {
    //get Current index
    const currentIndex = filteredQuestions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceded else go to the beginning
    if (currentIndex - 1 >= 0) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[currentIndex - 1].id}`,
        search: `?mode=${practiceMode.current}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[filteredQuestions.length - 1].id}`,
        search: `?mode=${practiceMode.current}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  //TODO: Go to provided input

  //Go to the next question
  const handleNextQuestion = () => {
    questionAnswerRef.current.resetSelection();

    //get Current index
    const currentIndex = filteredQuestions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceeded else go to the beginning
    if (currentIndex + 1 < filteredQuestions.length) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[currentIndex + 1].id}`,
        search: `?mode=${practiceMode.current}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[0].id}`,
        search: `?mode=${practiceMode.current}`,
      });
    }

    //Resetting the states is handled by a useEffect
  };

  //Go to last question
  const toLastQuestion = () => {
    const lastIDInQuestionArray = filteredQuestions[filteredQuestions.length - 1].id;

    //Only push to history if not already at the last point
    //TODO notify the user that the end was reached
    if (params.questionID !== lastIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${lastIDInQuestionArray}`,
        search: `?mode=${practiceMode.current}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  /* EVENT HANDLERS */
  //Prevent default form submission (reload)
  const preventDef = (e) => {
    e.preventDefault();
  };

  //Check answer or click to go to next question
  const questionCheckButtonOnClick = () => {
    //If the show answer box is show the svg of the button will change to an arrow and a click will go to the next question
    if (showAnswer) {
      handleNextQuestion();
    } else {
      questionAnswerRef.current.checkAnswer();
      setFormDisabled(true);
    }
  };

  const onQuestionRetryClick = () => {
    //Reset states
    setFormDisabled(false);
    setShowAnswer(false);
    setAnswerCorrect();

    if (showAnswer) {
      questionAnswerRef.current.resetAndShuffleOptions();
      questionDataRef.current.scrollTo(0, 0);
    } else {
      questionAnswerRef.current.resetSelection();
    }
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //TODO switch to useMemo
  const moduleLength = useCallback(() => {
    if (filteredQuestions === undefined || filteredQuestions.length === 0) {
      return;
    }
    return filteredQuestions.length;
  }, [filteredQuestions]);

  //JSX
  return (
    <form className='question-form' onSubmit={preventDef}>
      <div className='question-data' ref={questionDataRef} style={showNav ? { paddingBottom: "120px" } : {}}>
        <div className='question-id-progress-wrapper'>
          <p className='question-id' data-testid='question-id'>
            ID: {question.id}
          </p>
          <p className='question-progress'>
            {currentQuestionPage}/{moduleLength()} Questions
          </p>
        </div>
        <ReactMarkdown
          className='question-title'
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          remarkPlugins={[remarkMath, remarkGfm]}
          children={question.title}
        />
        <p className='question-points'>
          {question.points} {question.points === 1 ? "Point" : "Points"}
        </p>
        <ReactMarkdown
          className='question-type-help'
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          remarkPlugins={[remarkMath, remarkGfm]}
          children={question.help}
        />
        {/* Question */}
        <section className='question-user-response'>
          {questionType(question.type, question.answerOptions, formDisabled)}
        </section>
        {/* On Check click show if the answer was correct */}
        {showAnswer && (
          <section
            className={`question-correction ${answerCorrect ? "answer-correct" : "answer-false"}`}
            ref={questionCorrectionRef}
            data-testid='question-correction'
          >
            <p className='question-correction-title'>
              {answerCorrect ? "Yes, that's correct!" : "No, that's false! The correct answer is:"}
            </p>
            <div id='question-correction'>{questionAnswerRef.current.returnAnswer()}</div>
          </section>
        )}
      </div>
      <div
        className={`question-bottom ${
          collapsedNav ? "question-bottom-when-collapsed" : "question-bottom-when-expanded"
        }`}
        ref={questionBottomRef}
      >
        <div className='question-check-retry-wrapper'>
          {/* Check */}
          <button
            className='question-check-next'
            aria-label={showAnswer ? "Next Question" : "Check Question"}
            data-testid='question-check'
            onClick={() => questionCheckButtonOnClick()}
          >
            {/* If the correct answer is show, switch the svg and give the option to continue with the next Question */}
            {showAnswer ? <MdNavigateNext className='next-question-icon' /> : <BiCheck className='check-icon' />}
          </button>
          {/* Retry */}
          <button
            className='question-retry'
            aria-label={showAnswer ? "Retry Question" : "Reset Question"}
            data-testid='question-retry'
            onClick={() => onQuestionRetryClick()}
          >
            <CgUndo className='retry-icon' />
          </button>
          {/* Button that appears at a width of 800px to show the navigation */}
          {collapsedNav && (
            <button
              className='show-question-nav'
              aria-label={showNav ? "Hide Navigation" : "Show Navigation"}
              onClick={() => setShowNav(!showNav)}
            >
              <BsChevronDoubleDown className={`show-question-nav-icon ${showNav ? "down" : "up"}`} aria-hidden='true' />
            </button>
          )}
        </div>
        {(showNav || !collapsedNav) && (
          <div className={`question-navigation ${collapsedNav && "nav-collapsed"}`}>
            <Bookmark questionID={question.id} />
            <button
              data-testid='first-question-button'
              aria-label='Navigate to first Question'
              onClick={() => toFirstQuestion()}
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
            <button
              data-testid='previous-question-button'
              aria-label='Navigate to previous Question'
              onClick={() => toPreviousQuestion()}
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
            <input type='number' placeholder={currentQuestionPage} min='1' onKeyDown={onInputKeyDown} />
            <button
              data-testid='nav-next-question-button'
              aria-label='Navigate to next Question'
              onClick={() => handleNextQuestion()}
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
            <button
              data-testid='last-question-button'
              aria-label='Navigate to last Question'
              onClick={() => toLastQuestion()}
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
        )}
      </div>
    </form>
  );
};

export default Question;
