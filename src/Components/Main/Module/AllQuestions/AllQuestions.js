//Components
import SiteHeading from "../../../SharedComponents/SiteHeading/SiteHeading.jsx";
import QuestionTable from "./Components/QuestionTable.js";

//CSS
import "./AllQuestions.css";

//Component
const AllQuestions = () => {
  //JSX
  return (
    <div className='all-questions'>
      <SiteHeading title='All Questions' />
      <QuestionTable />
    </div>
  );
};

export default AllQuestions;
