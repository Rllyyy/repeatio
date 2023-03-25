//React
import { useState, useEffect } from "react";
import { parseJSON } from "../../utils/parseJSON";
import { useParams, Link } from "react-router-dom";

//Components
import { Spinner } from "../Spinner/Spinner";
import { ModuleNotFound } from "../module/ModuleNotFound";

//Icons
import { IoIosArrowForward } from "react-icons/io";

//Css
import "./QuestionList.css";

//Material UI
import Checkbox from "@mui/material/Checkbox";

//Types & Interfaces
import { IParams } from "../../utils/types";
import { IModule } from "../module/module";

export const QuestionList = () => {
  //State
  const [questions, setQuestions] = useState<IModule["questions"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  //Params
  const { moduleID } = useParams<IParams>();

  /* UseEffects */
  /* Fetch the questions from the localStorage and set the questions */
  useEffect(() => {
    const questions = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`))?.questions;

    if (questions) {
      setQuestions(questions);
      setLoading(false);
    } else {
      setError(true);
      setLoading(false);
    }

    return () => {
      setQuestions([]);
      setLoading(true);
      setError(false);
    };
  }, [moduleID]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ModuleNotFound />;
  }

  return (
    <div className='question-table'>
      {questions?.map((question) => {
        const { id, title } = question;
        return (
          <div className='question' id={`question-${id}`} key={`question-${id}`}>
            <Checkbox
              disableRipple
              className='question-checkbox'
              classes={{ root: "custom-checkbox-root" }}
              style={{
                color: "var(--custom-prime-color)",
                padding: "0 8px",
              }}
            />
            <span className='title'>{title}</span>
            <span className='id'>{id}</span>
            <span className='results'>
              <div className='rectangle'></div>
              <div className='rectangle'></div>
            </span>
            <Link
              className='link-to-question'
              to={{
                pathname: `/module/${moduleID}/question/${id}`,
                search: `?mode=practice&order=chronological`,
              }}
            >
              <IoIosArrowForward />
            </Link>
          </div>
        );
      })}
    </div>
  );
};
