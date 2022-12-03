import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuestionNavigation } from "./components/QuestionNavigation/QuestionNavigation.jsx";

//Context
import { ModuleContext } from "../module/moduleContext.js";

export const useQuestion = () => {
  //States
  const [question, setQuestion] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);

  //Context
  const { filteredQuestions, setContextModuleID } = useContext(ModuleContext);

  //Refs
  const questionDataRef = useRef(null);
  const questionAnswerRef = useRef(null); //Access child functions (check, return answer, reset)

  //params
  const params = useParams();

  //Custom hooks
  const { navigateToNextQuestion } = useQuestionNavigation();

  /* EVENT HANDLERS */
  //Prevent default form submission (reload)
  //TODO Move these into custom hook when I figured out how to update ref value inside hook
  const handleSubmit = (e) => {
    e.preventDefault();

    //If the correct answer isn't shown (before first form submit), check if the answer is correct by calling the check method on the questionAnswerRef
    //Else navigate to the next question (before second form submit)
    if (!showAnswer) {
      setAnswerCorrect(questionAnswerRef.current.checkAnswer());
      setShowAnswer(true);
    } else {
      questionDataRef.current.scrollTo({ top: 0, behavior: "instant" });

      navigateToNextQuestion();
      setShowAnswer(false);
    }
  };

  const handleResetRetryQuestion = useCallback(() => {
    if (showAnswer) {
      questionAnswerRef.current.resetAndShuffleOptions();
    } else {
      questionAnswerRef.current.resetSelection();
    }
    questionDataRef.current.scrollTo({ top: 0, behavior: "instant" });
    setShowAnswer(false);
  }, [showAnswer, setShowAnswer, questionDataRef]);

  /* UseEffects */
  //Set the question state by finding the correct question with the url parameters
  useEffect(() => {
    if (params.questionID === undefined) {
      return;
    }
    //Guard to refetch context (could for example happen on F5)
    if (filteredQuestions?.length <= 0) {
      setContextModuleID(params.moduleID);
      return;
    }

    //Find the correct question in the moduleData context
    const returnQuestion = filteredQuestions?.find((questionItem) => questionItem.id === params.questionID);

    //TODO what if filteredQuestions is undefined/null??

    //Set the question state
    setQuestion(returnQuestion);
    setLoading(false);

    return () => {
      setQuestion({});
      setLoading(true);
    };
  }, [params.questionID, params.moduleID, setContextModuleID, filteredQuestions]);

  //On question unmount, set show answer to false
  //TODO would be great if the useQuestionNavigation would handle this :/
  useEffect(() => {
    return () => {
      setShowAnswer(false);
    };
  }, [question]);

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

  return {
    question,
    loading,
    handleSubmit,
    handleResetRetryQuestion,
    showAnswer,
    setShowAnswer,
    answerCorrect,
    questionDataRef,
    questionAnswerRef,
  };
};
