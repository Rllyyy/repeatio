import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

//Context
import { ModuleContext } from "../../../Context/ModuleContext.js";

const useQuestion = () => {
  const [question, setQuestion] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const { filteredQuestions, setContextModuleID } = useContext(ModuleContext);

  /* UseEffects */
  //Set the question state by finding the correct question with the url parameters
  useEffect(() => {
    if (params.questionID === undefined) {
      return;
    }
    //Guard to refetch context (could for example happen on F5)
    if (filteredQuestions.length <= 0) {
      setContextModuleID(params.moduleID);
      return;
    }

    //Find the correct question in the moduleData context
    const returnQuestion = filteredQuestions.find((questionItem) => questionItem.id === params.questionID);

    //Set the question state
    setQuestion(returnQuestion);
    setLoading(false);

    return () => {
      setQuestion({});
      setLoading(true);
    };
  }, [params.questionID, params.moduleID, setContextModuleID, filteredQuestions]);

  //Refetch the question if the user edits a questions
  useEffect(() => {
    //Find question with the id from the url
    const refetchQuestion = () => {
      setQuestion(filteredQuestions.find((questionItem) => questionItem.id === params.questionID));
    };

    //Add event listener. If you want to trigger this use:
    //window.dispatchEvent(new Event("storage"));
    window.addEventListener("storage", refetchQuestion);

    //Cleanup
    return () => {
      window.removeEventListener("storage", refetchQuestion);
      setQuestion({});
      setLoading(true);
    };
  }, [params.questionID, filteredQuestions]);

  return { question, loading };
};

export default useQuestion;
