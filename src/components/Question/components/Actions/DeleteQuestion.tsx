import { useContext } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import isElectron from "is-electron";
import { toast } from "react-toastify";
import { getBookmarkedLocalStorageItem } from "./BookmarkQuestion";

//Context
import { IModuleContext, ModuleContext } from "../../../module/moduleContext";

//TODO add moduleID as Component param not useParams

//Icons
import { BiTrash } from "react-icons/bi";

//Interfaces/Types
import { IParams } from "../../../../utils/types";
import { IQuestion } from "../../../QuestionEditor/QuestionEditor";

interface IDeleteQuestion
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  questionID: IQuestion["id"];
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
  const { moduleData, setModuleData, filteredQuestions } = useContext<IModuleContext>(ModuleContext);

  //Delete Question from storage
  const handleDelete = () => {
    //Don't allow deletion for now when using electron
    if (isElectron()) {
      toast.warn("Can't delete Question in electron at this point in time. Please use the website instead");
      return;
    }

    //Don't allow to edit the basic module
    if (moduleData.id === "types_1") {
      toast.warn("Can't delete Questions of test module");
      return;
    }

    //Don't allow deletion on the last element in the module
    if (moduleData.questions.length <= 1) {
      //TODO fix this
      toast.warn("Can't delete last question in module for now");
      return;
    }

    //Don't allow question editing when using mode random
    if (new URLSearchParams(search).get("mode") === "random") {
      //TODO fix this
      toast.warn("Don't delete questions in mode random for this time.");
      return;
    }

    if (moduleData.questions.length !== filteredQuestions.length) {
      toast.warn(
        "Don't delete questions while viewing just saved questions. This causes too many bugs. I will try to fix this in the future. For now access this question not by using saved questions, but instead find the question with mode chronological or use the question overview to find this question."
      );
    }

    //TODO Refactor the code below when the ModuleContext gets refactored
    const indexInModuleQuestions = moduleData.questions.findIndex((question: IQuestion) => question.id === questionID);

    //If question isn't in moduleData don't modify the storage. In Prod this error should never be shown!
    if (indexInModuleQuestions <= -1) {
      toast.error("Couldn't find questionID!");
      return;
    }

    //Remove at given index one element
    moduleData.questions.splice(indexInModuleQuestions, 1);

    //Update context
    setModuleData({ ...moduleData, questions: moduleData.questions });

    //Navigate to new path with new id
    const indexInFilteredQuestions = filteredQuestions.findIndex((question: IQuestion) => question.id === questionID);

    //Because the Push to new url
    if (indexInFilteredQuestions >= 1) {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[indexInFilteredQuestions - 1].id}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "chronological"}`,
      });
    } else {
      history.push({
        pathname: `/module/${params.moduleID}/question/${filteredQuestions[indexInFilteredQuestions + 1].id}`,
        search: `?mode=${new URLSearchParams(search).get("mode") || "chronological"}`,
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
