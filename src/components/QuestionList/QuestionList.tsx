//React
import { useEffect, memo, useReducer, useCallback } from "react";
import { parseJSON } from "../../utils/parseJSON";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

//Components
import { Spinner } from "../Spinner/Spinner";
import { ModuleNotFound } from "../module/ModuleNotFound";

// Reducer
import { ActionTypes, defaultState, reducer } from "./QuestionListReducer";

//Icons
import { IoIosArrowForward } from "react-icons/io";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";

//Css
import "./QuestionList.css";

//Types & Interfaces
import { IParams } from "../../utils/types";
import { IModule } from "../module/module";
import { IQuestion } from "../Question/useQuestion";

export const QuestionList = () => {
  // Reducer
  const [{ questions, error, loading }, dispatch] = useReducer(reducer, defaultState);

  //Params
  const { moduleID } = useParams<IParams>();

  /* UseEffects */
  /* Fetch the questions from the localStorage and set the questions */
  useEffect(() => {
    dispatch({ type: ActionTypes.FETCH, payload: { moduleId: moduleID } });

    return () => {
      dispatch({ type: ActionTypes.RESET });
    };
  }, [moduleID]);

  // Update the localStorage if the order of the question changes
  useEffect(() => {
    if (moduleID && questions.length >= 1) {
      const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`));

      const updatedModule = { ...module, questions: questions };

      localStorage.setItem(`repeatio-module-${moduleID}`, JSON.stringify(updatedModule, null, "\t"));
    }

    return () => {};
  }, [questions, moduleID]);

  // Move the question up
  const handleMoveQuestionUp = useCallback((index: number) => {
    dispatch({ type: ActionTypes.MOVE_UP, payload: { index } });
  }, []);

  // Move the question down
  const handleMoveQuestionDown = useCallback((index: number) => {
    dispatch({ type: ActionTypes.MOVE_DOWN, payload: { index } });
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ModuleNotFound />;
  }

  return (
    <div className='question-table' style={{ position: "relative" }}>
      {questions?.map((question, index) => {
        const { id, title } = question;
        return (
          <ListItem
            key={`question-${id}`}
            questionId={id}
            questionTitle={title}
            moduleId={moduleID}
            currentIndex={index}
            handleMoveQuestionDown={handleMoveQuestionDown}
            handleMoveQuestionUp={handleMoveQuestionUp}
          />
        );
      })}
    </div>
  );
};

interface IListItem {
  questionId: IQuestion["id"];
  questionTitle: IQuestion["title"];
  moduleId: IParams["moduleID"];
  currentIndex: number;
  handleMoveQuestionDown: (index: number) => void;
  handleMoveQuestionUp: (index: number) => void;
}

const ListItem: React.FC<IListItem> = memo(
  ({ questionId, questionTitle, moduleId, currentIndex, handleMoveQuestionDown, handleMoveQuestionUp }) => {
    return (
      <motion.div className='question' id={`question-${questionId}`} layout style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 8px",
            color: "lightgray",
          }}
        >
          <button
            style={{ backgroundColor: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            onClick={() => handleMoveQuestionUp(currentIndex)}
            aria-label={`Move ${questionId} up`}
            type='button'
          >
            <BsFillCaretUpFill style={{ width: 25, height: 25 }} />
          </button>
          <button
            style={{ backgroundColor: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            onClick={() => handleMoveQuestionDown(currentIndex)}
            aria-label={`Move ${questionId} down`}
            type='button'
          >
            <BsFillCaretDownFill style={{ width: 25, height: 25 }} />
          </button>
        </div>
        <span className='title'>{questionTitle}</span>
        <span className='id'>{questionId}</span>
        <span className='results'>
          <div className='rectangle' />
          <div className='rectangle' />
        </span>
        <Link
          className='link-to-question'
          to={{
            pathname: `/module/${moduleId}/question/${questionId}`,
            search: `?mode=practice&order=chronological`,
          }}
        >
          <IoIosArrowForward />
        </Link>
      </motion.div>
    );
  }
);
