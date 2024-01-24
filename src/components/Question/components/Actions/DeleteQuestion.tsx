import { useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";
import { parseJSON } from "../../../../utils/parseJSON";

//Context
import { IQuestionIdsContext, QuestionIdsContext } from "../../../module/questionIdsContext";

//TODO add moduleID as Component param not useParams

//Icons
import { BiTrash } from "react-icons/bi";

//Components
import { ComponentWithTooltip } from "@components/common/ComponentWithTooltip";

//Interfaces/Types
import { IParams } from "../../../../utils/types";
import { IQuestion, TUseQuestion } from "../../useQuestion";
import { IModule } from "../../../module/module";

interface IDeleteQuestion
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  questionID: IQuestion["id"] | undefined;
  disabled: boolean;
  handleResetQuestionComponent: TUseQuestion["handleResetQuestionComponent"];
}

export const DeleteQuestion = ({ questionID, disabled, handleResetQuestionComponent, ...props }: IDeleteQuestion) => {
  //params
  const params = useParams<IParams>();

  //URL parameters
  const { search } = useLocation();

  //Access History
  let navigate = useNavigate();

  //Access Module
  const { questionIds, setQuestionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //Delete Question from storage
  const handleDelete = () => {
    // Remove question from localStorage
    // Get module from localStorage
    const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${params.moduleID}`));

    if (!module) {
      toast.error("Couldn't find module!");
      return;
    }

    // Get index of question that should be deleted
    const indexInModuleQuestions = module.questions.findIndex((question: IQuestion) => question.id === questionID);

    //If question isn't in moduleData don't modify the storage. In Prod this error should never be shown!
    if (typeof indexInModuleQuestions === "undefined" || indexInModuleQuestions <= -1) {
      toast.error("Couldn't find questionID!");
      return;
    }

    //Remove at given index one element
    module.questions.splice(indexInModuleQuestions, 1);

    // Update localStorage for module
    localStorage.setItem(`repeatio-module-${params.moduleID}`, JSON.stringify(module, null, "\t"));

    // Navigate to new path with new id
    const indexInContextQuestionsIds = questionIds?.findIndex((id) => id === questionID);

    // Reset the question component to reset user selection, hide question correction and scroll to top
    handleResetQuestionComponent();

    if (typeof indexInContextQuestionsIds === "undefined") {
      console.error("ID is not in data.questionIds");
    } else if (indexInContextQuestionsIds >= 1 && questionIds.length >= 2) {
      // Navigate to previous item in array if not at the beginning (0)
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[indexInContextQuestionsIds - 1]}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "practice"}&order=${
          new URLSearchParams(search).get("order") || "chronological"
        }`,
      });
    } else if (indexInContextQuestionsIds === 0 && questionIds.length >= 2) {
      navigate({
        pathname: `/module/${params.moduleID}/question/${questionIds?.[indexInContextQuestionsIds + 1]}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "practice"}&order=${
          new URLSearchParams(search).get("order") || "chronological"
        }`,
      });
    } else {
      /* Push to Module overview if there are no questions left in the current context */
      /* //TODO: in the future this could point to ".../all-questions" but there should be a message like "0 Questions"*/
      navigate({
        pathname: `/module/${params.moduleID}`,
      });
    }

    // Update questionIds context
    setQuestionIds([...(questionIds ?? []).filter((id) => id !== questionID)]);

    //Remove id from saved questions in localStorage
    //Get whole bookmarked item from localStorage
    const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem(params.moduleID);

    //Filter out the deleted question id from the questions array inside the localStorage
    const filteredSavedIDs = bookmarkedLocalStorageItem?.questions?.filter((item) => item !== questionID);

    //Update localStorage with filtered out array. If there is no item left, remove from storage.
    if (filteredSavedIDs && filteredSavedIDs?.length >= 1) {
      //Update the localStorage
      localStorage.setItem(
        `repeatio-marked-${params.moduleID}`,
        JSON.stringify({ ...bookmarkedLocalStorageItem, questions: filteredSavedIDs }, null, "\t")
      );
    } else if (filteredSavedIDs?.length === 0) {
      //Remove localStorage item
      localStorage.removeItem(`repeatio-marked-${params.moduleID}`);
    }
  };

  //JSX
  return (
    <ComponentWithTooltip id='delete-question-tooltip' tooltipText='Delete Question'>
      <button type='button' onClick={handleDelete} disabled={disabled} aria-label='Delete Question' {...props}>
        <BiTrash />
      </button>
    </ComponentWithTooltip>
  );
};
