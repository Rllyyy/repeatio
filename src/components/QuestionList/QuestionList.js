//React
import { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

//Context
import { ModuleContext } from "../module/moduleContext";

//Components
import { Spinner } from "../Spinner/Spinner";

//Icons
import { IoIosArrowForward } from "react-icons/io";

//Css
import "./QuestionList.css";

//Material UI
import Checkbox from "@mui/material/Checkbox";

export const QuestionList = () => {
  //State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  //Context
  const { moduleData, setContextModuleID } = useContext(ModuleContext);

  //Params
  const params = useParams();

  //History
  let history = useHistory();

  /* UseEffects */
  //Set the question state from the context or refetch if context is undefined
  useEffect(() => {
    //Set the questions state
    if (moduleData.length !== 0 && moduleData !== undefined) {
      setQuestions(moduleData.questions);
      setLoading(false);
    } else {
      //Refetch context (could for example happen on F5)
      setContextModuleID(params.moduleID);
    }

    return () => {
      setQuestions([]);
      setLoading(true);
    };
  }, [moduleData, params.moduleID, setContextModuleID]);

  /* Event Handlers */
  //Go to question url when user clicks arrow button
  const handleToQuestionClick = (id) => {
    //TODO set filteredQuestions with checkboxes
    history.push({
      pathname: `/module/${params.moduleID}/question/${id}`,
      search: `?mode=chronological`,
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='question-table'>
      {questions.map((question, index) => {
        const { id, title } = question;
        return (
          <div className='question' key={`question-${index}`}>
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
