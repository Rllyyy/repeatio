//Import
//React stuff
import { useState, useRef, useEffect, useContext, useCallback, memo, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";

//Markdown related
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

//Import CSS
import "./Question.css";

//Import Components
import QuestionNotFound from "./Components/QuestionNotFound/QuestionNotFound.jsx"; //TODO switch to jsx
import QuestionUserResponseArea from "./QuestionTypes/QuestionUserResponseArea.jsx";
import { QuestionNavigation } from "./Components/QuestionNavigation/QuestionNavigation.jsx";
import DeleteQuestion from "./Components/Actions/DeleteQuestion.jsx";
import EditQuestion from "./Components/Actions/EditQuestion.jsx";
import BookmarkQuestion from "./Components/Actions/BookmarkQuestion.jsx";

//Context
import { ModuleContext } from "../../../Context/ModuleContext.js";

//Hooks
import useQuestion from "./useQuestion.js";
import { useQuestionNavigation } from "./Components/QuestionNavigation/QuestionNavigation.jsx";
import { useSize } from "../../../hooks/useSize";

//SVG
import { BiCheck } from "react-icons/bi";
import { BsChevronDoubleDown } from "react-icons/bs";
import { CgUndo } from "react-icons/cg";
import { MdNavigateNext } from "react-icons/md";

//Main Question Component
const Question = () => {
  //States
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);

  //Refs
  const questionDataRef = useRef(null);
  const questionAnswerRef = useRef(null); //Access child functions (check, return answer, reset)

  //Custom hooks
  const { navigateToNextQuestion } = useQuestionNavigation();
  const { question, loading } = useQuestion();

  //On question unmount, set show answer to false
  //TODO would be great if the useQuestionNavigation would handle this :/
  useEffect(() => {
    return () => {
      setShowAnswer(false);
    };
  }, [question, setShowAnswer]);

  /* EVENT HANDLERS */
  //Prevent default form submission (reload)
  //TODO Move these into custom hook when I figured out how to update ref value inside hook
  const handleSubmit = (e) => {
    e.preventDefault();

    //If the correct answer isn't shown (before first form submit), check if the answer is correct by calling the check method on the questionAnswerRef
    //Else navigate to the next question (before second form submit)
    if (!showAnswer) {
      setAnswerCorrect(questionAnswerRef.current.checkAnswer());
      setShowAnswer(true);
    } else {
      questionDataRef.current.scrollTo({ top: 0, behavior: "instant" });

      navigateToNextQuestion();
      setShowAnswer(false);
    }
  };

  const handleResetRetryQuestion = useCallback(() => {
    if (showAnswer) {
      questionAnswerRef.current.resetAndShuffleOptions();
    } else {
      questionAnswerRef.current.resetSelection();
    }
    questionDataRef.current.scrollTo({ top: 0, behavior: "instant" });
    setShowAnswer(false);
  }, [showAnswer, setShowAnswer, questionDataRef]);

  //JSX
  return (
    <form className='question-form' onSubmit={handleSubmit}>
      {/* ---- Question data represent the top half of the grid and includes the question -----*/}
      <QuestionData
        question={question}
        loading={loading}
        questionAnswerRef={questionAnswerRef}
        questionDataRef={questionDataRef}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        answerCorrect={answerCorrect}
      />
      {/* -- Question Bottom includes checking/reset/actions(delete/edit/save) and the navigation --*/}
      <QuestionBottom
        showAnswer={showAnswer}
        disabled={loading || !question}
        handleResetRetryQuestion={handleResetRetryQuestion}
      />
    </form>
  );
};

export default Question;

const QuestionData = ({ question, loading, questionAnswerRef, questionDataRef, showAnswer, answerCorrect }) => {
  // Scroll to top
  //TODO would be great if this was handle by the question navigation
  useLayoutEffect(() => {
    if (!loading && question) {
      questionDataRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [loading, question, questionDataRef]);

  //Return empty div if component is loading (so ui doesn't jump)
  if (loading) {
    return <div></div>;
  }

  //Return QuestionNotFound if question can't be found because false id in url params
  if (!question) {
    return <QuestionNotFound />;
  }

  //Return question when question finished loading and question found
  return (
    <div className='question-data' ref={questionDataRef}>
      <QuestionIdProgress qID={question.id} />
      <QuestionTitle title={question.title} />
      <QuestionPoints points={question.points} />
      <QuestionTypeHelp help={question.help} />
      <QuestionUserResponseArea
        type={question.type}
        options={question.answerOptions}
        questionAnswerRef={questionAnswerRef}
        showAnswer={showAnswer}
      />
      <QuestionCorrection showAnswer={showAnswer} answerCorrect={answerCorrect} questionAnswerRef={questionAnswerRef} />
    </div>
  );
};

const QuestionBottom = ({ showAnswer, disabled, handleResetRetryQuestion }) => {
  //States
  const [showNav, setShowNav] = useState(false);
  const [collapsedActionsNav, setCollapsedActionsNav] = useState();

  //URL params
  const params = useParams();

  //Refs
  const questionBottomRef = useRef(null);

  //Custom Hook
  const size = useSize(questionBottomRef);

  //At 800 px collapse the navbar so the buttons and navigation are stacked
  useLayoutEffect(() => {
    if (size?.width > 800) {
      setCollapsedActionsNav(false);
    } else if (size?.width <= 800) {
      setCollapsedActionsNav(true);
    }
  }, [size?.width, size, setCollapsedActionsNav]);

  return (
    <div className={`question-bottom ${collapsedActionsNav ? "collapsed" : "expanded"}`} ref={questionBottomRef}>
      <div className='question-check-retry-wrapper'>
        {/* Check or Next*/}
        <CheckNextButton showAnswer={showAnswer} disabled={disabled} />
        {/* Retry */}
        <QuestionRetryButton
          showAnswer={showAnswer}
          handleResetRetryQuestion={handleResetRetryQuestion}
          disabled={disabled}
        />
        {/* Button that appears at a width of 800px to show the navigation */}
        {collapsedActionsNav && <ShowQuestionNavButton showNav={showNav} setShowNav={setShowNav} />}
      </div>
      {/* Question navigation and buttons (delete/edit/save) */}
      {(showNav || !collapsedActionsNav) && (
        <div className={`question-actions-navigation-wrapper ${collapsedActionsNav ? "collapsed" : ""}`}>
          <DeleteQuestion questionID={params.questionID} disabled={disabled} />
          <EditQuestion prevQuestionID={params.questionID} disabled={disabled} />
          <BookmarkQuestion questionID={params.questionID} disabled={disabled} />
          <QuestionNavigation />
        </div>
      )}
    </div>
  );
};

//ID and Progress of the current question
const QuestionIdProgress = memo(({ qID }) => {
  //Context
  const { filteredQuestions } = useContext(ModuleContext); //TODO remove this

  return (
    <div className='question-id-progress-wrapper'>
      <p className='question-id' data-testid='question-id'>
        ID: {qID}
      </p>
      <p className='question-progress'>
        {filteredQuestions?.findIndex((item) => item.id === qID) + 1}/{filteredQuestions?.length || "?"} Questions
      </p>
    </div>
  );
});

//Title of the question
const QuestionTitle = ({ title }) => {
  return (
    <ReactMarkdown
      className='question-title'
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkMath, remarkGfm]}
      children={title}
    />
  );
};

//Points of the question
const QuestionPoints = ({ points }) => {
  return (
    <p className='question-points'>
      {points} {points === 1 ? "Point" : "Points"}
    </p>
  );
};

//Help for the type of the question
const QuestionTypeHelp = ({ help }) => {
  return (
    <ReactMarkdown
      className='question-type-help'
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkMath, remarkGfm]}
      children={help}
    />
  );
};

//The correction of the question which scrolls into view on form submit (question check)
const QuestionCorrection = ({ showAnswer, answerCorrect, questionAnswerRef }) => {
  const questionCorrectionRef = useRef(null);

  //Sadly this has to run after the question correction component mounts and can therefore not be part of the handleSubmit function
  useEffect(() => {
    if (showAnswer) {
      questionCorrectionRef.current.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }, [showAnswer]);

  if (!showAnswer) {
    return <></>;
  }

  return (
    <section
      className={`question-correction ${answerCorrect ? "answer-correct" : "answer-false"}`}
      data-testid='question-correction'
      ref={questionCorrectionRef}
    >
      <p className='question-correction-title'>
        {answerCorrect ? "Yes, that's correct!" : "No, that's false! The correct answer is:"}
      </p>
      <div id='question-correction'>{questionAnswerRef.current.returnAnswer()}</div>
    </section>
  );
};

//Check the question or navigate to next Question depending on if the correction for the answer is shown
//TODO warn if user tries to submit
const CheckNextButton = ({ showAnswer, disabled }) => {
  return (
    <button
      type='submit'
      className='question-check-next'
      aria-label={showAnswer ? "Next Question" : "Check Question"}
      data-testid='question-check'
      disabled={disabled}
    >
      {/* If the correct answer is show, switch the svg and give the option to continue with the next Question */}
      {showAnswer ? <MdNavigateNext className='next-question-icon' /> : <BiCheck className='check-icon' />}
    </button>
  );
};

const QuestionRetryButton = ({ showAnswer, handleResetRetryQuestion, disabled }) => {
  return (
    <button
      className='question-retry'
      aria-label={showAnswer ? "Retry Question" : "Reset Question"}
      data-testid='question-retry'
      type='button'
      onClick={handleResetRetryQuestion}
      disabled={disabled}
    >
      <CgUndo className='retry-icon' />
    </button>
  );
};

const ShowQuestionNavButton = ({ showNav, setShowNav }) => {
  return (
    <button
      className='show-question-nav'
      type='button'
      aria-label={showNav ? "Hide Navigation" : "Show Navigation"}
      onClick={() => setShowNav(!showNav)}
    >
      <BsChevronDoubleDown className={`show-question-nav-icon ${showNav ? "down" : "up"}`} aria-hidden='true' />
    </button>
  );
};
