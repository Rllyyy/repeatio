//Import
import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSize } from "../../../hooks/useSize";
import { ModuleContext } from "../../../Context/ModuleContext.js";

//Import Question Types
import MultipleResponse from "./QuestionTypes/MultipleResponse.js";
import MultipleChoice from "./QuestionTypes/MultipleChoice.js";
import GapText from "./QuestionTypes/GapText.js";

//Import css
import "./Question.css";

//Import SCG
import { AiFillEye } from "react-icons/ai";
import { BiCheck, BiReset } from "react-icons/bi";
import { BsChevronDoubleDown } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";

//Navigation svg from https://tablericons.com

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

  //Context
  const { moduleData, setContextModuleID } = useContext(ModuleContext);

  //Refs
  const questionBottomRef = useRef(null);
  const checkRef = useRef(); //Checking if an answer is correct id done in the child component
  const questionCorrectionRef = useRef();

  //Custom Hooks
  const size = useSize(questionBottomRef);

  /* USEEFFECTS */
  //Set the question state by finding the correct question with the url parameters
  useEffect(() => {
    //Guard to refetch context (could for example happen on F5)
    if (moduleData.length === 0 || moduleData === undefined) {
      setContextModuleID(params.moduleID);
      return;
    }
    //Find the correct question in the moduleData context
    const returnQuestion = moduleData.questions.find((questionItem) => questionItem.id === params.questionID);

    //Set the locale storage
    setQuestion(returnQuestion);
  }, [moduleData, params.questionID, params.moduleID, setContextModuleID]);

  //Reset the states when rendering a new question
  useEffect(() => {
    setFormDisabled(false);
    setShowAnswer(false);
    setAnswerCorrect();
    if (checkRef.current !== undefined) {
      checkRef.current.resetSelection();
    }
  }, [params.questionID]);

  //Show the index of the current question

  useEffect(() => {
    if (moduleData === undefined || moduleData.length === 0) return;

    //Find the index of the question by filtering the module context
    const currentIndex = moduleData.questions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Add 1 because arrays are zero based and update the state
    setCurrentQuestionPage(currentIndex + 1);
  }, [params.questionID, moduleData]);

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
          return <MultipleResponse options={options} ref={checkRef} setAnswerCorrect={setAnswerCorrect} setShowAnswer={setShowAnswer} formDisabled={formDisabled} />;
        case "multiple-choice":
          return <MultipleChoice options={options} ref={checkRef} setAnswerCorrect={setAnswerCorrect} setShowAnswer={setShowAnswer} formDisabled={formDisabled} />;
        case "gap-text":
          return <GapText options={options} ref={checkRef} setAnswerCorrect={setAnswerCorrect} setShowAnswer={setShowAnswer} formDisabled={formDisabled} />;
        default:
          throw new Error("No matching question Type");
      }
    },
    [question]
  );

  //Navigation
  //Go to first question in module
  const toFirstQuestion = () => {
    const firstIDInQuestionArray = moduleData.questions[0].id;

    //Only push to history if not already at the first question
    //TODO notify the user that the already is at the beginning
    if (params.questionID !== firstIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleName}/${firstIDInQuestionArray}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  //Go to the previous question
  const toPreviousQuestion = () => {
    //get Current index
    const currentIndex = moduleData.questions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceded else go to the beginning
    if (currentIndex - 1 >= 0) {
      history.push({
        pathname: `/module/${params.moduleName}/${moduleData.questions[currentIndex - 1].id}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleName}/${moduleData.questions[moduleData.questions.length - 1].id}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  //TODO: Go to provided input

  //Go to the next question
  const nextQuestion = () => {
    //get Current index
    const currentIndex = moduleData.questions.findIndex((questionItem) => questionItem.id === params.questionID);

    //Go to next object (url/id) in array if the array length would not be exceeded else go to the beginning

    if (currentIndex + 1 < moduleData.questions.length) {
      history.push({
        pathname: `/module/${params.moduleName}/${moduleData.questions[currentIndex + 1].id}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleName}/${moduleData.questions[0].id}`,
      });
    }
    //Resetting the states and current selection is handled by a useEffect
  };

  //Go to last question
  const toLastQuestion = () => {
    const lastIDInQuestionArray = moduleData.questions[moduleData.questions.length - 1].id;

    //Only push to history if not already at the last point
    //TODO notify the user that the end was reached
    if (params.questionID !== lastIDInQuestionArray) {
      history.push({
        pathname: `/module/${params.moduleName}/${lastIDInQuestionArray}`,
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
      nextQuestion();
    } else {
      checkRef.current.checkAnswer();
      setFormDisabled(true);
    }
  };

  const onQuestionRetryClick = () => {
    //Reset states
    setFormDisabled(false);
    setShowAnswer(false);
    setAnswerCorrect();

    //Deselect answer
    if (showAnswer) {
      checkRef.current.resetAndShuffleOptions();
    } else {
      checkRef.current.resetSelection();
    }
  };

  const moduleLength = useCallback(() => {
    if (moduleData === undefined || moduleData.length === 0) {
      return;
    }
    return moduleData.questions.length;
  }, [moduleData]);

  //JSX
  return (
    <form className='question-form' onSubmit={preventDef}>
      <div className={`question-data`} style={showNav ? { paddingBottom: "120px" } : {}}>
        {/* <p>Module: {question.modulename}</p> */}
        <div className='question-heading-wrapper'>
          {/* <h2 className='question-module-heading'>{question.modulename} | Practice</h2>
          <div className='heading-underline'></div> */}
        </div>
        <div className='question-id-progress-wrapper'>
          <p className='question-id' data-testid='question-id'>
            ID: {question.id}
          </p>
          <p className='question-progress'>
            {currentQuestionPage}/{moduleLength()} Questions
          </p>
        </div>
        {/* <button>
          <MdBookmark />
        </button> */}
        <h2 className='question-title'>{question.title}</h2>
        <p className='question-points'>
          {question.points} {question.points >= 2 ? "Points" : "Point"}
        </p>
        <p className='question-type-help'>{question.questionTypeHelp}</p>
        {/* Question */}
        <section className='question-user-response'>{questionType(question.type, question.answerOptions, formDisabled)}</section>
        {/* On Check click show if the answer was correct */}
        {showAnswer && (
          <section className={`question-correction ${answerCorrect ? "answer-correct" : "answer-false"}`} ref={questionCorrectionRef} data-testid='question-correction'>
            <p className='question-correction-title'>{answerCorrect ? "Yes, that's correct!" : "No, that's false! The correct answer is:"}</p>
            <>{checkRef.current.returnAnswer()}</>
          </section>
        )}
      </div>
      {/* <button className='question-scrollToBottom-button'>
        <BsChevronBarDown />
      </button> */}
      <div className={`question-bottom ${collapsedNav ? "question-bottom-when-collapsed" : "question-bottom-when-expanded"}`} ref={questionBottomRef}>
        <div className='question-check-reveal-wrapper'>
          {/* Check */}
          <button className='question-check-next' data-testid='question-check' onClick={() => questionCheckButtonOnClick()}>
            {/* If the correct answer is show, switch the svg and give the option to continue with the next Question */}
            {showAnswer ? <FaArrowRight className='buttons-arrow' /> : <BiCheck className='check-icon' />}
          </button>
          {/* Reveal */}
          <button className='question-reveal'>
            <AiFillEye className='reveal-icon' />
          </button>
          {/* Retry */}
          <button className='question-retry' data-testid='question-retry' onClick={() => onQuestionRetryClick()}>
            <BiReset className='retry-icon' />
          </button>
          {/* Button that appears at a width of 800px to show the navigation */}
          {collapsedNav && (
            <button className='show-question-nav' onClick={() => setShowNav(!showNav)}>
              <BsChevronDoubleDown className={`show-question-nav-icon ${showNav ? "down" : "up"}`} />
            </button>
          )}
        </div>
        {(showNav || !collapsedNav) && (
          <div className={`question-navigation ${collapsedNav && "nav-collapsed"}`}>
            <button data-testid='first-question-button' onClick={() => toFirstQuestion()}>
              {/* <BsSkipStartFill className='navigation-start' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-start' width='48' height='48' viewBox='0 0 24 24' fill='none'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M20 5v14l-12 -7z' />
                <line x1='5' y1='5' x2='5' y2='19' />
              </svg>
            </button>
            <button data-testid='previous-question-button' onClick={() => toPreviousQuestion()}>
              {/* <BsTriangleFill className='navigation-before' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-before' width='48' height='48' viewBox='0 0 24 24' fill='true'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M7 4v16l13 -8z' />
              </svg>
            </button>
            <input type='number' placeholder={currentQuestionPage} min='1' />
            <button data-testid='next-question-button' onClick={() => nextQuestion()}>
              {/* <BsTriangleFill className='navigation-skip' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-skip' width='48' height='48' viewBox='0 0 24 24' fill='none'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M7 4v16l13 -8z' />
              </svg>
            </button>
            <button data-testid='last-question-button' onClick={() => toLastQuestion()}>
              {/* <BsSkipEndFill /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='icon icon-tabler icon-tabler-player-skip-forward' width='48' height='48' viewBox='0 0 24 24' fill='none'>
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
