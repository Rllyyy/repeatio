import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useQuestionNavigation } from "./components/QuestionNavigation/QuestionNavigation";
import { parseJSON } from "../../utils/parseJSON";
import { shuffleArray } from "../../utils/shuffleArray";

//Context
import { ModuleContext } from "../module/moduleContext";

// Interfaces
import { IMultipleChoice } from "./QuestionTypes/MultipleChoice/MultipleChoice";
import { IMultipleResponse } from "./QuestionTypes/MultipleResponse/MultipleResponse";
import { IGapText } from "./QuestionTypes/GapText/GapText";
import { IGapTextDropdown } from "./QuestionTypes/GapTextDropdown/GapTextDropdown";
import { IParams } from "../../utils/types";
import { IForwardRefFunctions } from "./QuestionTypes/types";
import { IExtendedMatch } from "./QuestionTypes/ExtendedMatch/ExtendedMatch";
import { IGapTextWithTempText } from "../QuestionEditor/AnswerOptionsEditor/QuestionTypes/GapTextEditor";
import { IModule } from "../module/module";
import { IBookmarkedQuestions } from "./components/Actions/BookmarkQuestion";
import { toast } from "react-toastify";

export type TAnswerOptions =
  | IMultipleChoice[]
  | IMultipleResponse[]
  | IGapText
  | IGapTextDropdown
  | IGapTextWithTempText
  | IExtendedMatch
  | undefined;

export interface IQuestion {
  id: string;
  title?: string;
  points?: string | number | undefined;
  help?: string;
  type: "multiple-choice" | "multiple-response" | "gap-text" | "gap-text-dropdown" | "extended-match" | "";
  answerOptions: TAnswerOptions | undefined;
}

export type TUseQuestion = ReturnType<typeof useQuestion>;

export const useQuestion = () => {
  //States
  const [question, setQuestion] = useState<IQuestion | undefined>({} as IQuestion);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);

  //Context
  const { data, setData } = useContext(ModuleContext);

  //URL parameters
  const { search } = useLocation();

  //Refs
  const questionDataRef = useRef<HTMLDivElement>(null);
  const questionAnswerRef = useRef<IForwardRefFunctions>(null); //Access child functions (check, return answer, reset)

  //params
  const params = useParams<IParams>();

  //History
  let history = useHistory();

  //Custom hooks
  const { navigateToNextQuestion } = useQuestionNavigation();

  /* EVENT HANDLERS */
  //Prevent default form submission (reload)
  //TODO Move these into custom hook when I figured out how to update ref value inside hook
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //If the correct answer isn't shown (before first form submit), check if the answer is correct by calling the check method on the questionAnswerRef
    //Else navigate to the next question (before second form submit)
    if (!showAnswer) {
      setAnswerCorrect(questionAnswerRef.current?.checkAnswer() || false);
      setShowAnswer(true);
    } else {
      questionDataRef.current?.scrollTo({ top: 0, behavior: "auto" });

      navigateToNextQuestion();
      setShowAnswer(false);
    }
  };

  const handleResetRetryQuestion = useCallback(() => {
    if (showAnswer) {
      questionAnswerRef.current?.resetAndShuffleOptions();
    } else {
      questionAnswerRef.current?.resetSelection();
    }
    questionDataRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setShowAnswer(false);
  }, [showAnswer, setShowAnswer, questionDataRef]);

  const fetchQuestion = useCallback(() => {
    //Find the correct question in the moduleData context
    const moduleJson = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));

    const question = moduleJson?.questions.find((question) => question.id === params.questionID);

    setQuestion(question);
  }, [params.moduleID, params.questionID]);

  /* UseEffects */
  //Set the question state by finding the correct question with the url parameters
  useEffect(() => {
    if (params.questionID === undefined) {
      return;
    }

    //Guard to refetch context (could for example happen on F5)
    //TODO here
    // Also if data.mode !== new URLSearchParams(search).get("mode")
    // or data.order !== new URLSearchParams(search).get("order")
    if ((data?.questionIds?.length ?? 0) <= 0 && params.moduleID) {
      const mode = new URLSearchParams(search).get("mode");
      const order = new URLSearchParams(search).get("order");

      if (order !== "chronological" && order !== "random") {
        console.error(`${order} is not a valid argument for order! Redirecting to chronological.`);
        history.push({
          pathname: `/module/${params.moduleID}/question/${params.questionID}`,
          search: `?mode=${mode}&order=chronological`,
        });
      }

      switch (mode) {
        case "practice":
          const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));

          let ids = module?.questions.map((question) => question.id);

          if (ids) {
            // Randomize the array but keep the first element the same
            if (order === "random") {
              // get index of current id
              const currentIndex = ids.indexOf(params.questionID);

              // Remove the id from the array
              ids.splice(currentIndex, 1);

              // Shuffle the array
              ids = shuffleArray(ids);

              // Add the current question id in front of the array so it equals the currently viewed question
              ids.unshift(params.questionID);
            }

            setData({ ...data, questionIds: ids, order: order as "chronological" | "random" });
          } else {
            toast.error("Module doesn't exist");
          }
          break;
        case "bookmarked":
          // TODO only add to bookmarkedIds if the id exists in BookmarkQuestions
          let bookmarkedIds = parseJSON<IBookmarkedQuestions>(
            localStorage.getItem(`repeatio-marked-${params.moduleID}`)
          )?.questions;

          //TODO randomize data

          if (bookmarkedIds) {
            if (order === "random") {
              const currentIndex = bookmarkedIds.indexOf(params.questionID);

              if (currentIndex <= -1) {
                toast.error("The current question is not bookmarked!");
                return;
              }

              // Remove the id from the array
              bookmarkedIds.splice(currentIndex, 1);

              // Shuffle the array
              bookmarkedIds = shuffleArray(bookmarkedIds);

              // Add the current question id in front of the array so it equals the currently viewed question
              bookmarkedIds.unshift(params.questionID);
            }

            setData({ ...data, questionIds: bookmarkedIds, order: order as "chronological" | "random" });
          } else {
            console.warn("Found 0 bookmarked questions");
          }

          break;
        default:
          console.error(`${mode} is not a valid argument for mode! Redirecting to practice.`);

          history.push({
            pathname: `/module/${params.moduleID}/question/${params.questionID}`,
            search: `?mode=practice&order=${order}`,
          });

          break;
      }
      return;
    }

    fetchQuestion();
    setLoading(false);

    return () => {
      setQuestion({} as IQuestion);
      setLoading(true);
    };
  }, [params.questionID, params.moduleID, data, search, setData, history, fetchQuestion]);

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
    fetchQuestion,
  } as const;
};
