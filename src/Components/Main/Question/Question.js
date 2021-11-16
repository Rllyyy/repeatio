//Import
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSize } from "../../../hooks/useSize";

//Import Question Types
import MultipleResponse from "./QuestionTypes/MultipleResponse";
import MultipleChoice from "./QuestionTypes/MultipleChoice";

//Import css
import "./Question.css";

//Import SCG
import { AiFillEye } from "react-icons/ai";
import { BiCheck, BiReset } from "react-icons/bi";
import { BsChevronDoubleDown } from "react-icons/bs";
// import { BsCheckLg } from "react-icons/bs";

//Placeholder
const question = {
  modulename: "ABC12",
  questionID: "qID-1",
  questionTitle:
    "What is often too long for one line so has to wrap to the next line, but not enough on large monitors so one has to add useless information to a placeholder question?",
  questionPoints: 5,
  type: "multiple-choice",
  questionTypeHelp: "Choose the correct answer(s).",
  answerOptions: [
    { id: "option-1", text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas voluptatibus quibusdam magnam.", isCorrect: true },
    { id: "option-2", text: "Lorem ipsum dolor sit amet consectetur adipisicing.", isCorrect: false },
    {
      id: "option-3",
      text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita nemo unde blanditiis dolorem necessitatibus consequatur omnis, reiciendis doloremque recusandae? Soluta ex sit illum doloremque cum non sunt nesciunt, accusantium dolorem.",
      isCorrect: false,
    },
  ],
};

//Navigation svg from https://tablericons.com

const Question = () => {
  //States
  const [showNav, setShowNav] = useState(false);
  const [collapsedNav, setCollapsedNav] = useState();
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState();

  const questionBottomRef = useRef(null);
  const checkRef = useRef(); //Checking if an answer is correct id done in the child component
  const questionCorrectionRef = useRef();
  const hello = useRef();
  const size = useSize(questionBottomRef);

  //At 800 px collapse the navbar so the buttons and navigation are stacked
  useEffect(() => {
    if (size?.width > 800) {
      setCollapsedNav(false);
    } else {
      setCollapsedNav(true);
    }
  }, [size?.width]);

  //Prevent default form submission (reload)
  const preventDef = (e) => {
    e.preventDefault();
  };
  // lose focus onclick --> :active
  //stackoverflow.com/questions/19053181/how-to-remove-focus-around-buttons-on-

  //Scroll to question correction on check click
  const questionCheckButtonOnClick = () => {
    checkRef.current.checkAnswer();
  };

  // scroll to correction feedback for user after show answer is updated and only
  useEffect(() => {
    if (showAnswer) {
      // hello.current.focus();
      questionCorrectionRef.current.scrollIntoView();
    }
  }, [showAnswer]);

  //Decide what Question Type to return
  const questionType = useCallback((type, options) => {
    switch (type) {
      case "multiple-response":
        return <MultipleResponse options={options} ref={checkRef} setAnswerCorrect={setAnswerCorrect} setShowAnswer={setShowAnswer} />;
      case "multiple-choice":
        return <MultipleChoice options={options} ref={checkRef} setAnswerCorrect={setAnswerCorrect} setShowAnswer={setShowAnswer} />;
      default:
        throw new Error("No matching question Type");
    }
  }, []);

  //JSX
  return (
    <form className='question-form' onSubmit={preventDef}>
      <div className={`question-data`} style={showNav ? { paddingBottom: "120px" } : {}} ref={hello}>
        {/* <p>Module: {question.modulename}</p> */}
        <div className='question-heading-wrapper'>
          {/* <h2 className='question-module-heading'>{question.modulename} | Practice</h2>
          <div className='heading-underline'></div> */}
        </div>
        <div className='question-id-progress-wrapper'>
          <p className='question-id'>ID: {question.questionID}</p>
          <p className='question-progress'>1/20 Questions</p>
        </div>
        {/* <button>
          <MdBookmark />
        </button> */}
        <h2 className='question-title'>{question.questionTitle}</h2>
        <p className='question-points'>
          {question.questionPoints} {question.questionPoints >= 2 ? "Points" : "Point"}
        </p>
        <p className='question-id'>ID: {question.questionID}</p>
        <p className='question-type-help'>{question.questionTypeHelp}</p>
        {/* Question */}
        <section className='question-user-response'>{questionType(question.type, question.answerOptions)}</section>
        {/* On Check click show if the answer was correct */}
        {showAnswer && (
          <section className={`question-correction ${answerCorrect ? "answer-correct" : "answer-false"}`} ref={questionCorrectionRef}>
            <p className='question-correction-title'>{answerCorrect ? "Yes, that's correct!" : "No, that's false! The correct answer is:"}</p>
            <>{checkRef.current.returnAnswer()}</>
          </section>
        )}
        {/* <div>Answer</div>
      <div>Tip</div> */}
      </div>
      {/* <button className='question-scrollToBottom-button'>
        <BsChevronBarDown />
      </button> */}
      <div className={`question-bottom ${collapsedNav ? "question-bottom-when-collapsed" : "question-bottom-when-expanded"}`} ref={questionBottomRef}>
        <div className='question-check-reveal-wrapper'>
          {/* Check */}
          <button className='question-check' onClick={() => questionCheckButtonOnClick()}>
            <BiCheck className='check-icon' />
          </button>
          {/* Reveal */}
          <button className='question-reveal'>
            <AiFillEye className='reveal-icon' />
          </button>
          {/* Retry */}
          <button className='question-retry'>
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
            <button>
              {/* <BsSkipStartFill className='navigation-start' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-start' width='48' height='48' viewBox='0 0 24 24' fill='none'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M20 5v14l-12 -7z' />
                <line x1='5' y1='5' x2='5' y2='19' />
              </svg>
            </button>
            <button>
              {/* <BsTriangleFill className='navigation-before' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-before' width='48' height='48' viewBox='0 0 24 24' fill='true'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M7 4v16l13 -8z' />
              </svg>
            </button>
            <input type='number' placeholder={question.questionID} min='1' />
            <button>
              {/* <BsTriangleFill className='navigation-skip' /> */}
              <svg xmlns='http://www.w3.org/2000/svg' className='navigation-skip' width='48' height='48' viewBox='0 0 24 24' fill='none'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M7 4v16l13 -8z' />
              </svg>
            </button>
            <button>
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
