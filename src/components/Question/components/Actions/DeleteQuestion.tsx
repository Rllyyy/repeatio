import { useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import isElectron from "is-electron";
import { toast } from "react-toastify";
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";
import { parseJSON } from "../../../../utils/parseJSON";

//Context
import { IModuleContext, ModuleContext } from "../../../module/moduleContext";

//TODO add moduleID as Component param not useParams

//Icons
import { BiTrash } from "react-icons/bi";

//Interfaces/Types
import { IParams } from "../../../../utils/types";
import { IQuestion } from "../../useQuestion";
import { IModule } from "../../../module/module";

interface IDeleteQuestion
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  questionID: IQuestion["id"] | undefined;
  disabled: boolean;
}

export const DeleteQuestion = ({ questionID, disabled, ...props }: IDeleteQuestion) => {
  //params
  const params = useParams<IParams>();

  //URL parameters
  const { search } = useLocation();

  //Access History
  let history = useHistory();

  //Access Module
  const { data, setData } = useContext<IModuleContext>(ModuleContext);

  //Delete Question from storage
  const handleDelete = () => {
    //Don't allow deletion for now when using electron
    if (isElectron()) {
      toast.warn("Can't delete Question in electron at this point in time. Please use the website instead");
      return;
    }

    //Don't allow to edit the basic module
    if (params.moduleID === "types_1") {
      toast.warn("Can't delete Questions of test module");
      return;
    }

    //TODO allow this with history.push to module overview
    //Don't allow deletion on the last element in the module
    if ((data.questionIds?.length || 0) <= 1) {
      toast.warn("Can't delete last question in module for now");
      return;
    }

    //Don't allow question editing when using mode random
    if (new URLSearchParams(search).get("order") === "random") {
      //TODO fix this
      toast.warn("Don't delete questions in mode random for this time.");
      return;
    }

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
    if (!indexInModuleQuestions || indexInModuleQuestions <= -1) {
      toast.error("Couldn't find questionID!");
      return;
    }

    //Remove at given index one element
    module.questions.splice(indexInModuleQuestions, 1);

    // Update localStorage for module
    localStorage.setItem(`repeatio-module-${params.moduleID}`, JSON.stringify(module, null, "\t"));

    // Update questionIds context
    setData({ ...data, questionIds: data.questionIds?.filter((id) => id !== questionID) });

    //Navigate to new path with new id
    const indexInContextQuestionsIds = data.questionIds?.findIndex((id) => id === questionID);

    if (!indexInContextQuestionsIds) throw new Error("ID is not in data.questionsIds");

    // Navigate to previous item in array if not at the beginning (0)
    if (indexInContextQuestionsIds >= 1) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${data.questionIds?.[indexInContextQuestionsIds - 1]}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "practice"}&order=${
          new URLSearchParams(search).get("order") || "chronological"
        }`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${data.questionIds?.[indexInContextQuestionsIds + 1]}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "practice"}&order=${
          new URLSearchParams(search).get("order") || "chronological"
        }`,
      });
    }

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
    <button type='button' onClick={handleDelete} disabled={disabled} aria-label='Delete Question' {...props}>
      <BiTrash />
    </button>
  );
};
