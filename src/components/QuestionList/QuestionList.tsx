//React
import { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

//Context
import { ModuleContext } from "../module/moduleContext";

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
import { IModule } from "../Home/CreateModule";
import { IQuestion } from "../QuestionEditor/QuestionEditor";

export const QuestionList = () => {
  //State
  const [questions, setQuestions] = useState<IModule["questions"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  //Context
  const { moduleData, setContextModuleID, setFilteredQuestions } = useContext(ModuleContext);

  //Params
  const params = useParams<IParams>();

  //History
  let history = useHistory();

  /* UseEffects */
  //Set the question state from the context or refetch if context is undefined
  useEffect(() => {
    //Context returned nothing because module wasn't found
    if (moduleData === null) {
      setError(true);
      setLoading(false);
      return;
    }

    if (moduleData === undefined) {
      setLoading(true);
      setError(false);
      return;
    }

    //Set the questions state
    if (Object.keys(moduleData)?.length !== 0 && moduleData !== undefined) {
      setQuestions(moduleData.questions);
      setLoading(false);
      setError(false);
    } else {
      //Refetch context (could for example happen on F5)
      if (params.moduleID) {
        setContextModuleID(params.moduleID);
      } else {
        setError(true);
      }
    }

    return () => {
      setQuestions([]);
      setLoading(true);
      setError(false);
    };
  }, [moduleData, params.moduleID, setContextModuleID]);

  /* Event Handlers */
  //Go to question url when user clicks arrow button
  const handleToQuestionClick = (id: IQuestion["id"]) => {
    setFilteredQuestions(moduleData?.questions);

    //TODO set filteredQuestions with checkboxes
    history.push({
      pathname: `/module/${params.moduleID}/question/${id}`,
      search: `?mode=chronological`,
    });
  };

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
            <button className='button-to-question' onClick={() => handleToQuestionClick(id)}>
              <IoIosArrowForward />
            </button>
          </div>
        );
      })}
    </div>
  );
};
