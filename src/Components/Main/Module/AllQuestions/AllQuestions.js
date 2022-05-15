//React
import React from "react";

//Components
import QuestionTable from "./Components/QuestionTable";

//CSS
import "./AllQuestions.css";

//Component
const AllQuestions = () => {
  //JSX
  return (
    <div className='all-questions'>
      <h1 className='site-heading'>All Questions</h1>
      <QuestionTable />
    </div>
  );
};

export default AllQuestions;
