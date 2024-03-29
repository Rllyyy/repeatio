import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useQuestionNavigation } from "./components/QuestionNavigation/QuestionNavigation";
import { parseJSON } from "../../utils/parseJSON";
import { shuffleArray } from "../../utils/shuffleArray";
import { addExampleModuleToLocalStorage, isExampleModuleAdded } from "../Home/helpers";
import { toast } from "react-toastify";

//Context
import { QuestionIdsContext, IQuestionIdsContext } from "../module/questionIdsContext";

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
import { IExtendedMatchTemp } from "../QuestionEditor/AnswerOptionsEditor/QuestionTypes/ExtendedMatchEditor";
import { TSettings } from "@hooks/useSetting";

export type TAnswerOptions =
  | IMultipleChoice[]
  | IMultipleResponse[]
  | IGapText
  | IGapTextDropdown
  | IGapTextWithTempText
  | IExtendedMatch
  | IExtendedMatchTemp
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
  const { questionIds, setQuestionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //URL parameters
  const { search } = useLocation();

  //Refs
  const questionDataRef = useRef<HTMLDivElement>(null);
  const questionAnswerRef = useRef<IForwardRefFunctions>(null); //Access child functions (check, return answer, reset)

  //params
  const params = useParams<IParams>();

  //Navigate
  let navigate = useNavigate();

  //Custom hooks
  const { navigateToNextQuestion } = useQuestionNavigation();

  /* EVENT HANDLERS */
  /**
   * Scrolls to top, resets the input values and hides the correction
   */
  const handleResetQuestionComponent = () => {
    // Scroll back to top
    questionDataRef.current?.scrollTo({ top: 0, behavior: "auto" });

    // Clear the changes the user made to the question
    questionAnswerRef.current?.resetSelection();

    // Hide the answer correction
    setShowAnswer(false);
  };

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
      handleResetQuestionComponent();
      navigateToNextQuestion();
    }
  };

  const handleResetRetryQuestion = useCallback(() => {
    if (showAnswer) {
      questionAnswerRef.current?.resetAndShuffleOptions();
      questionDataRef.current?.scrollTo({ top: 0, behavior: "auto" });
    } else {
      questionAnswerRef.current?.resetSelection();
    }
    setShowAnswer(false);
  }, [showAnswer, setShowAnswer, questionDataRef]);

  /* Fetch Question from localStorage */
  const fetchQuestion = useCallback(() => {
    //Find the correct question in the moduleData context
    const moduleJson = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));

    const questionFromStorage = moduleJson?.questions.find((question) => question.id === params.questionID);

    setQuestion(questionFromStorage);
  }, [params.moduleID, params.questionID]);

  /* Set context, question and set Module example if needed */
  const fetchAndSetQuestions = useCallback(
    async (signal: AbortSignal) => {
      if (params.questionID === undefined) {
        return;
      }

      /* setExampleModule if it hasn't been added before */
      if (params.moduleID === "types_1" && (questionIds?.length ?? 0) === 0) {
        // Get settings from localStorage
        const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));

        /* Add example module to localStorage if it isn't there and the user hasn't removed it (first ever render) */
        if (!isExampleModuleAdded(settings)) {
          await addExampleModuleToLocalStorage(settings, signal);
        }
      }

      /* Set context if it is empty */
      if ((questionIds?.length ?? 0) <= 0 && params.moduleID) {
        const mode = new URLSearchParams(search).get("mode");
        const order = new URLSearchParams(search).get("order");

        if (order !== "chronological" && order !== "random") {
          console.warn(`${order} is not a valid argument for order! Redirecting to chronological.`);
          navigate({
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

              setQuestionIds([...ids]);
            } else {
              toast.error("Module doesn't exist");
            }
            break;
          case "bookmarked":
            let bookmarkedIds = parseJSON<IBookmarkedQuestions>(
              localStorage.getItem(`repeatio-marked-${params.moduleID}`)
            )?.questions;

            if (bookmarkedIds) {
              const currentIndex = bookmarkedIds.indexOf(params.questionID);

              // Should only happen if the user navigates with the url to ?mode=bookmarked
              if (currentIndex <= -1) {
                if (bookmarkedIds.length >= 1 && !!bookmarkedIds[0]) {
                  navigate(
                    {
                      pathname: `/module/${params.moduleID}/question/${bookmarkedIds[0]}`,
                      search: `?mode=bookmarked&order=${order}`,
                    },
                    { replace: true }
                  );

                  toast.warn(
                    "The previous question is no longer bookmarked! Redirected to first question in bookmarked questions."
                  );
                  return;
                } else {
                  //navigate home
                  navigate(`/module/${params.moduleID}`);
                  toast.warn("Question is no longer bookmarked");
                  return;
                }
              }

              // Get an array of all question IDs from the module in local storage
              const moduleQuestionIds = parseJSON<IModule>(
                localStorage.getItem(`repeatio-module-${params.moduleID}`)
              )?.questions.reduce((acc: string[], question) => {
                acc.push(question.id);
                return acc;
              }, []);

              if (!moduleQuestionIds) return;
              // Find all valid and invalid IDs in bookmarkedQuestionsIDs and log a warning for each invalid one
              let { validIds, invalidIds } = bookmarkedIds.reduce(
                (
                  acc: { validIds: IBookmarkedQuestions["questions"]; invalidIds: IBookmarkedQuestions["questions"] },
                  id
                ) => {
                  if (moduleQuestionIds?.includes(id)) {
                    acc.validIds?.push(id);
                  } else {
                    acc.invalidIds?.push(id);
                  }
                  return acc;
                },
                { validIds: [], invalidIds: [] }
              );

              if (order === "random" && validIds) {
                // Remove the id from the array
                validIds.splice(currentIndex, 1);

                // Shuffle the array
                validIds = shuffleArray(validIds);

                // Add the current question id in front of the array so it equals the currently viewed question
                validIds.unshift(params.questionID);
              }

              // Update the context if there are any valid ids
              if (validIds && validIds.length >= 1) {
                setQuestionIds([...validIds]);
              }

              // Show warning that includes every id that wasn't found
              if (invalidIds && invalidIds?.length >= 1) {
                console.warn(`Couldn't find the following ids: ${invalidIds.join(", ")} `);
              }
            } else {
              toast.warn("Found 0 bookmarked questions");
              navigate(`/module/${params.moduleID}`);
            }

            break;
          default:
            console.warn(`${mode} is not a valid argument for mode! Redirecting to practice.`);

            navigate({
              pathname: `/module/${params.moduleID}/question/${params.questionID}`,
              search: `?mode=practice&order=${order}`,
            });
            break;
        }
      }

      if (questionIds?.length > 0) {
        fetchQuestion();
        setLoading(false);
      }
    },
    [params.questionID, params.moduleID, questionIds, search, setQuestionIds, navigate, fetchQuestion]
  );

  /* UseEffects */
  useEffect(() => {
    // Define abort controller
    const controller = new AbortController();
    const { signal } = controller;

    fetchAndSetQuestions(signal);

    return () => {
      setQuestion({} as IQuestion);
      setLoading(true);
      setShowAnswer(false);
      controller.abort();
    };
  }, [params.questionID, fetchAndSetQuestions]);

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
    handleResetQuestionComponent,
  } as const;
};
