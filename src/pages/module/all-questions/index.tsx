import { SiteHeading } from "../../../components/SiteHeading/SiteHeading";
import { QuestionList } from "../../../components/QuestionList/QuestionList";

//Is the css needed??
export default function AllQuestionsPage() {
  return (
    <div className='all-questions' style={{ minHeight: "100vh", maxWidth: "100%", overflow: "hidden" }}>
      <SiteHeading title='All Questions' />
      <QuestionList />
    </div>
  );
}
