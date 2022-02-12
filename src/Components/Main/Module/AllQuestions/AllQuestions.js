//Imports
//React
import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { ModuleContext } from "../../../../Context/ModuleContext";

//CSS
import "./AllQuestions.css";

//Icons
import { IoIosArrowForward } from "react-icons/io";

//Material UI
import Checkbox from "@mui/material/Checkbox";

//Component
const AllQuestions = () => {
  //State
  const [questions, setQuestions] = useState([]);

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
    } else {
      //Refetch context (could for example happen on F5)
      setContextModuleID(params.moduleID);
    }
  }, [moduleData, params.moduleID, setContextModuleID]);

  /* Event Handlers */
  //Go to question url when user clicks arrow button
  const handleToQuestionClick = (id) => {
    history.push({
      pathname: `/module/${params.moduleID}/question/${id}`,
      search: `?mode=chronological`,
    });
  };

  //JSX
  return (
    <div className='all-questions'>
      <h1>All Questions</h1>
      <div className='all-questions-table'>
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
    </div>
  );
};

export default AllQuestions;
