import { useContext } from "react";
import { BiTrash } from "react-icons/bi";
import { useParams, useHistory, useLocation } from "react-router-dom";

import isElectron from "is-electron";

//Context
import { ModuleContext } from "../../../../../Context/ModuleContext.js";

const DeleteQuestion = ({ questionID, disabled }) => {
  //params
  const params = useParams();

  //URL parameters
  const { search } = useLocation();

  //Access History
  let history = useHistory();

  //Access Module
  const { moduleData, setModuleData, filteredQuestions } = useContext(ModuleContext);

  //Delete Question from storage
  const handleDelete = () => {
    //Don't allow deletion for now when using electron
    if (isElectron()) {
      console.warn("Can't delete Question in electron at this point in time. Please use the website instead");
      return;
    }

    //Don't allow to edit the basic module
    if (moduleData.id === "types_1") {
      console.warn("Can't delete Questions of test module");
      return;
    }

    //Don't allow deletion on the last element in the module
    if (moduleData.questions.length <= 1) {
      //TODO fix this
      console.warn("Can't delete last question in module for now");
      return;
    }

    //Don't allow question editing when using mode random
    if (new URLSearchParams(search).get("mode") === "random") {
      //TODO fix this
      console.warn("Don't delete questions in mode random for this time.");
      return;
    }

    if (moduleData.questions.length !== filteredQuestions.length) {
      console.warn(
        "Don't delete questions while viewing just saved questions. This causes too many bugs. I will try to fix this in the future. For now access this question not by using saved questions, but instead find the question with mode chronological or use the question overview to find this question."
      );
    }

    //TODO Refactor the code below when the ModuleContext gets refactored
    const indexInModuleQuestions = moduleData.questions.findIndex((question) => question.id === questionID);

    //If question isn't in moduleData don't modify the storage. In Prod this error should never be shown!
    if (indexInModuleQuestions <= -1) {
      console.warn("Couldn't find questionID!");
      return;
    }

    //Remove at given index one element
    moduleData.questions.splice(indexInModuleQuestions, 1);

    //Update context
    setModuleData({ ...moduleData, questions: moduleData.questions });

    //Navigate to new path with new id
    const indexInFilteredQuestions = filteredQuestions.findIndex((question) => question.id === questionID);

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
    //Get item from localStorage and transform to array
    const savedIDs = JSON.parse(localStorage.getItem(`repeatio-marked-${params.moduleID}`));

    //Filter out deleted question id
    const filteredSavedIDs = savedIDs?.filter((item) => item !== questionID);

    //Update localStorage with filtered out array. If there is no item left, remove from storage.
    if (filteredSavedIDs?.length >= 1) {
      //Update the localStorage
      localStorage.setItem(`repeatio-marked-${params.moduleID}`, JSON.stringify(filteredSavedIDs), {
        sameSite: "strict",
        secure: true,
      });
    } else if (filteredSavedIDs?.length === 0) {
      //Remove localStorage item
      localStorage.removeItem(`repeatio-marked-${params.moduleID}`);
    }
  };

  //JSX
  return (
    <button type='button' onClick={handleDelete} disabled={disabled}>
      <BiTrash />
    </button>
  );
};

export default DeleteQuestion;
