import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import packageJSON from "../../../../../package.json";

//functions
import { parseJSON } from "../../../../utils/parseJSON";

//Icons
import { MdBookmarkAdd, MdBookmarkRemove } from "react-icons/md";

//Types or Interfaces
import { IParams } from "../../../../utils/types";
import { IQuestion } from "../../../QuestionEditor/QuestionEditor";

export type TBookmarkedQuestionID = IQuestion["id"];

export interface IBookmarkedQuestions {
  id: string;
  type: "bookmark";
  compatibility: string;
  questions: TBookmarkedQuestionID[] | null | undefined;
}

interface IBookmarkQuestionComponent
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  questionID: TBookmarkedQuestionID;
  disabled?: boolean;
}

//Component
export const BookmarkQuestion = ({ questionID, disabled, ...props }: IBookmarkQuestionComponent) => {
  const [bookmarked, setBookmarked] = useState(false);
  const { moduleID } = useParams<IParams>(); //TODO change this

  //Add the Question ID to the bookmark array
  const addQuestionToBookmark = (id: TBookmarkedQuestionID) => {
    //Get the saved questions from the local storage
    const bookmarkLocalStorage = getBookmarkedLocalStorageItem(moduleID);

    if (
      bookmarkLocalStorage !== null &&
      bookmarkLocalStorage !== undefined &&
      bookmarkLocalStorage?.questions &&
      !bookmarkLocalStorage?.questions?.includes(id)
    ) {
      //Append the id to the existing bookmarked questions in the localStorage array
      localStorage.setItem(
        `repeatio-marked-${moduleID}`,
        JSON.stringify({ ...bookmarkLocalStorage, questions: [...bookmarkLocalStorage.questions, id] }, null, "\t")
      );
    } else {
      //Create a new localStorage item with the id saved to the questions array
      //Get comb, set id with params;
      const newBookmarkedItem: IBookmarkedQuestions = {
        id: moduleID || "error", //TODO change this
        type: "bookmark",
        compatibility: packageJSON.version,
        questions: [id],
      };
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify(newBookmarkedItem, null, "\t"));
    }
    //Dispatch event that updates the state
    window.dispatchEvent(new Event("bookmark-event"));
  };

  //Remove the Question ID from the bookmark array
  const removeQuestionFromBookmark = (id: TBookmarkedQuestionID) => {
    //Get the bookmarked item from the local storage
    const bookmarkLocalStorageItem = getBookmarkedLocalStorageItem(moduleID);

    //Remove the id from the bookmark or delete the whole storage item
    if (bookmarkLocalStorageItem?.questions && bookmarkLocalStorageItem?.questions.length > 1) {
      //Remove the id from the bookmark array by filtering out the id

      const newBookmarkedItem: IBookmarkedQuestions = {
        ...bookmarkLocalStorageItem,
        questions: bookmarkLocalStorageItem.questions.filter((qID) => qID !== id),
      };
      //Update the localStorage
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify(newBookmarkedItem, null, "\t"));
    } else {
      //Delete the whole storage item if there was just one item left and it gets removed
      localStorage.removeItem(`repeatio-marked-${moduleID}`);
    }

    //Dispatch event that updates the state
    window.dispatchEvent(new Event("bookmark-event"));
  };

  //Add or remove the question id in the bookmark
  const onBookmarkClick = () => {
    if (!bookmarked) {
      addQuestionToBookmark(questionID);
    } else {
      removeQuestionFromBookmark(questionID);
    }
  };

  //Set the state of the saved state by checking if there is a json value for this module that contains the id
  const setBookmarkedState = useCallback(() => {
    //Get the bookmarked question for a local Storage item
    const bookmarkedQuestionsInItem = getBookmarkedQuestionsFromModule(moduleID);

    //If the bookmark array exists for this module and the array includes the id,
    //set the state to saved else the question is not saved
    if (bookmarkedQuestionsInItem !== null && bookmarkedQuestionsInItem?.includes(questionID)) {
      setBookmarked(true);
    } else {
      setBookmarked(false);
    }
  }, [questionID, moduleID]);

  //Set the state so the correct icon can be displayed
  useEffect(() => {
    //On questionID change check if the id exist in the saved questions
    setBookmarkedState();

    //Add event listener for custom event that should be triggered every time a bookmarked value in the localStorage changes
    window.addEventListener("bookmark-event", setBookmarkedState);

    //Remove event listener and reset the state
    return () => {
      window.removeEventListener("bookmark-event", setBookmarkedState);
      setBookmarked(false);
    };
  }, [questionID, moduleID, setBookmarkedState]);

  //JSX
  return (
    <button
      type='button'
      className='bookmark-question-button'
      aria-label={bookmarked ? "Unsave Question" : "Save Question"}
      onClick={onBookmarkClick}
      disabled={disabled}
      {...props}
    >
      {/* Decide which button to display */}
      {bookmarked ? (
        <MdBookmarkRemove className='bookmark-remove' data-testid='bookmark-remove' />
      ) : (
        <MdBookmarkAdd className='bookmark-add' data-testid='bookmark-add' />
      )}
    </button>
  );
};

/**
 * Returns a JavaScript object of the passed bookmarked item from the localStorage
 * @param moduleID
 */
//Accepts undefined because params may be undefined
export function getBookmarkedLocalStorageItem(moduleID: string | undefined) {
  if (typeof moduleID === "undefined") {
    console.error("ID of module is undefined!");
    return;
  }
  return parseJSON<IBookmarkedQuestions>(localStorage.getItem(`repeatio-marked-${moduleID}`));
}

/**
 *  Returns an array of the passed bookmarked questions from the localStorage
 */
export function getBookmarkedQuestionsFromModule(moduleID: string | undefined): IBookmarkedQuestions["questions"] {
  if (typeof moduleID === "undefined") {
    console.error("ID of module is undefined!");
    return;
  }
  return parseJSON<IBookmarkedQuestions>(localStorage.getItem(`repeatio-marked-${moduleID}`))?.questions;
}
