//Import
import React, { useState, useRef, useEffect } from "react";

import { useSize } from "../../../hooks/useSize";

//Import css
import "./Question.css";

//Import SCG
import { MdBookmark } from "react-icons/md";
import { AiFillEye } from "react-icons/ai";
import { BiCheck, BiReset } from "react-icons/bi";
import { BsArrowRepeat, BsChevronDoubleDown } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
// import { BsCheckLg } from "react-icons/bs";

//Placeholder
const question = {
  modulename: "Placeholder Name",
  questionID: "qID-1",
  questionTitle: "Test Title",
  questionPoints: 5,
  questionTypeHelp: "Wählen Sie die richtige(n) Aussage(n) aus.",
};

//Navigation svg from https://tablericons.com

const Question = () => {
  //States
  const [showNav, setShowNav] = useState(false);
  const [collapsedNav, setCollapsedNav] = useState();

  const questionBottomRef = useRef(null);
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
  // lose focus onclick
  //stackoverflow.com/questions/19053181/how-to-remove-focus-around-buttons-on-click

  //JSX
  return (
    <form className='question-form' onSubmit={preventDef}>
      <div className={`question-data`} style={showNav ? { paddingBottom: "120px" } : {}}>
        <div className='question-heading-wrapper'>
          <h1>{question.modulename} | Practice</h1>
          <div className='heading-underline'></div>
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
        <p className='question-type-help'>{question.questionTypeHelp}</p>
        <div>
          <p>Question</p>
        </div>
        {/* <h1>{navigationWidth}</h1> */}
        {/* <div>Answer</div>
      <div>Tip</div> */}
      </div>
      {/* <button className='question-scrollToBottom-button'>
        <BsChevronBarDown />
      </button> */}
      <div className={`question-bottom ${collapsedNav ? "question-bottom-when-collapsed" : "question-bottom-when-expanded"}`} ref={questionBottomRef}>
        <div className='question-check-reveal-wrapper'>
          {/* Check */}
          <button className='question-check'>
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
