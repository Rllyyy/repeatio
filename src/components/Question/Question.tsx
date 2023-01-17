//Import
//React stuff
import { useState, useRef, useEffect, useContext, memo, useLayoutEffect } from "react";
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
import { QuestionNotFound } from "./components/QuestionNotFound/QuestionNotFound";
import { QuestionUserResponseArea } from "./QuestionTypes/QuestionUserResponseArea";
import { QuestionNavigation } from "./components/QuestionNavigation/QuestionNavigation";
import { DeleteQuestion } from "./components/Actions/DeleteQuestion";
import { EditQuestion } from "./components/Actions/EditQuestion";
import { BookmarkQuestion } from "./components/Actions/BookmarkQuestion";

//Context
import { ModuleContext } from "../module/moduleContext";

//Hooks
import { useQuestion } from "./useQuestion";
import { useSize } from "../../hooks/useSize";

//SVG
import { BiCheck } from "react-icons/bi";
import { BsChevronDoubleDown } from "react-icons/bs";
import { CgUndo } from "react-icons/cg";
import { MdNavigateNext } from "react-icons/md";

//Interfaces
import { IParams } from "../../utils/types";
import { IQuestion, TUseQuestion } from "./useQuestion";

//Main Question Component
const Question = () => {
  //Get data from hook
  const {
    question,
    loading,
    handleSubmit,
    handleResetRetryQuestion,
    showAnswer,
    answerCorrect,
    questionDataRef,
    questionAnswerRef,
  } = useQuestion();

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

// TODO maybe use Pick instead
type TQuestionData = Pick<
  TUseQuestion,
  "question" | "loading" | "questionAnswerRef" | "questionDataRef" | "showAnswer" | "answerCorrect"
>;
/*   question: IQuestion | undefined;
  loading: boolean;
  showAnswer: boolean;
  answerCorrect: boolean;
  questionDataRef: React.RefObject<HTMLDivElement>;
  questionAnswerRef: React.RefObject<IForwardRefFunctions>;
} */

//Question Data contains all the question info (title, points, type, help, answerOptions)
const QuestionData: React.FC<TQuestionData> = ({
  question,
  loading,
  questionAnswerRef,
  questionDataRef,
  showAnswer,
  answerCorrect,
}) => {
  // Scroll to top
  //TODO would be great if this was handle by the question navigation
  useLayoutEffect(() => {
    if (!loading && question) {
      questionDataRef.current?.scrollTo({ top: 0, behavior: "auto" });
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

//QuestionBottom contains the checking/resetting of a question as well as the actions (save, edit, delete) and the navigation
interface IQuestionBottom {
  showAnswer: TUseQuestion["showAnswer"];
  disabled: boolean;
  handleResetRetryQuestion: TUseQuestion["handleResetRetryQuestion"];
}

const QuestionBottom: React.FC<IQuestionBottom> = ({ showAnswer, disabled, handleResetRetryQuestion }) => {
  //States
  const [showNav, setShowNav] = useState(false);
  const [collapsedActionsNav, setCollapsedActionsNav] = useState<boolean | null>(null);

  //URL params
  const params = useParams<IParams>();

  //Refs
  const questionBottomRef = useRef(null);

  //Custom Hook
  const size = useSize(questionBottomRef);

  //At 800 px collapse the navbar so the buttons and navigation are stacked
  useLayoutEffect(() => {
    if (size && size?.width > 800) {
      setCollapsedActionsNav(false);
    } else if (size && size?.width <= 800) {
      setCollapsedActionsNav(true);
    }
  }, [size?.width, size, setCollapsedActionsNav]);

  return (
    <div
      className={`question-bottom ${collapsedActionsNav ? "collapsed" : "expanded"}`}
      ref={questionBottomRef}
      data-testid='question-bottom'
    >
      <div className='question-check-retry-wrapper'>
        {/* Check or Next*/}
        <CheckNextButton showAnswer={showAnswer} disabled={disabled} />
        {/* Retry */}
        <QuestionRetryButton
          showAnswer={showAnswer}
          handleResetRetryQuestion={handleResetRetryQuestion}
          disabled={disabled}
        />
        {/* Button that appears at a width of 800px and smaller to show the navigation */}
        {collapsedActionsNav && <ShowQuestionNavButton showNav={showNav} setShowNav={setShowNav} />}
      </div>
      {/* Question navigation and buttons (delete/edit/save) */}
      {(showNav || !collapsedActionsNav) && (
        <div
          className={`question-actions-navigation-wrapper ${collapsedActionsNav ? "collapsed" : ""}`}
          data-testid='question-actions-navigation-wrapper'
        >
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
const QuestionIdProgress = memo(({ qID }: { qID: IQuestion["id"] }) => {
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
const QuestionTitle = ({ title }: { title: IQuestion["title"] }) => {
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
const QuestionPoints = ({ points }: { points: IQuestion["points"] }) => {
  //Return the points value. If they are undefined return ?
  //If the value of point is equal to 1 return Point else return Points
  return (
    <p className='question-points'>
      {points ?? "?"} {points === 1 ? "Point" : "Points"}
    </p>
  );
};

//Help for the type of the question
const QuestionTypeHelp = ({ help }: { help: IQuestion["help"] }) => {
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

interface IQuestionCorrection {
  showAnswer: TUseQuestion["showAnswer"];
  answerCorrect: TUseQuestion["answerCorrect"];
  questionAnswerRef: TUseQuestion["questionAnswerRef"];
}

const QuestionCorrection: React.FC<IQuestionCorrection> = ({ showAnswer, answerCorrect, questionAnswerRef }) => {
  const questionCorrectionRef = useRef<HTMLSelectElement>(null);

  //Sadly this has to run after the question correction component mounts and can therefore not be part of the handleSubmit function
  useEffect(() => {
    if (showAnswer) {
      questionCorrectionRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
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
      <div id='question-correction'>{questionAnswerRef.current?.returnAnswer()}</div>
    </section>
  );
};

//Check the question or navigate to next Question depending on if the correction for the answer is shown
interface ICheckNextButton {
  showAnswer: TUseQuestion["showAnswer"];
  disabled: boolean;
}

//TODO warn if user tries to submit
const CheckNextButton: React.FC<ICheckNextButton> = ({ showAnswer, disabled }) => {
  return (
    <button
      type='submit'
      className='question-check-next'
      aria-label={!showAnswer ? "Check Question" : "Next Question"}
      data-testid={!showAnswer ? "question-check" : "question-next"}
      disabled={disabled}
    >
      {/* If the correct answer is show, switch the svg and give the option to continue with the next Question */}
      {showAnswer ? <MdNavigateNext className='next-question-icon' /> : <BiCheck className='check-icon' />}
    </button>
  );
};

interface IQuestionRetryButton {
  showAnswer: TUseQuestion["showAnswer"];
  handleResetRetryQuestion: TUseQuestion["handleResetRetryQuestion"];
  disabled: boolean;
}

const QuestionRetryButton: React.FC<IQuestionRetryButton> = ({ showAnswer, handleResetRetryQuestion, disabled }) => {
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

// Show or hide the question navigation bar on small displays
interface IShowQuestionNavButton {
  showNav: boolean;
  setShowNav: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShowQuestionNavButton: React.FC<IShowQuestionNavButton> = ({ showNav, setShowNav }) => {
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

export { Question, QuestionBottom, QuestionPoints };
