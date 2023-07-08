import { useSyncExternalStore } from "react";
import packageJSON from "../../../../../package.json";

//functions
import { parseJSON } from "../../../../utils/parseJSON";

//Icons
import { MdBookmarkAdd, MdBookmarkRemove } from "react-icons/md";

//Types or Interfaces
import { IQuestion } from "../../useQuestion";
import { IModule } from "../../../module/module";

export type TBookmarkedQuestionID = IQuestion["id"];

export interface IBookmarkedQuestions {
  id: string;
  type: "marked";
  compatibility: string;
  questions: TBookmarkedQuestionID[] | null | undefined;
}

interface IBookmarkQuestionComponent
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  moduleID: IModule["id"] | undefined;
  questionID: TBookmarkedQuestionID | undefined;
  disabled?: boolean;
}

//Component
export const BookmarkQuestion = ({ questionID, moduleID, disabled, ...props }: IBookmarkQuestionComponent) => {
  const { isBookmarked, addQuestionToBookmark, removeQuestionFromBookmark } = useBookmarked(questionID, moduleID);

  //Add or remove the question id in the bookmark
  const onBookmarkClick = () => {
    // Exist function if no questionID is given
    if (!questionID) {
      console.warn("questionID is undefined!");
      return;
    }

    if (!isBookmarked) {
      addQuestionToBookmark();
    } else {
      removeQuestionFromBookmark();
    }
  };

  //JSX
  return (
    <button
      type='button'
      className='bookmark-question-button'
      aria-label={isBookmarked ? "Unsave Question" : "Save Question"}
      onClick={onBookmarkClick}
      disabled={disabled}
      {...props}
    >
      {/* Decide which button to display */}
      {isBookmarked ? (
        <MdBookmarkRemove className='bookmark-remove' data-testid='bookmark-remove' />
      ) : (
        <MdBookmarkAdd className='bookmark-add' data-testid='bookmark-add' />
      )}
    </button>
  );
};

function subscribe(onBookmarkChange: () => void) {
  //Add event listener for custom event that should be triggered every time a bookmarked value in the localStorage changes
  window.addEventListener("bookmark-event", onBookmarkChange);

  //Remove event listener
  return () => {
    window.removeEventListener("bookmark-event", onBookmarkChange);
  };
}

function getSnapShot(moduleId: IBookmarkedQuestions["id"] | undefined) {
  if (typeof moduleId === "undefined") {
    console.warn("ID of module is undefined");
    return null;
  }

  return localStorage.getItem(`repeatio-marked-${moduleId}`);
}

const useBookmarked = (
  questionId: TBookmarkedQuestionID | undefined,
  moduleId: IBookmarkedQuestions["id"] | undefined
) => {
  const localStorageValue = useSyncExternalStore(subscribe, () => getSnapShot(moduleId));

  // parse the localStorage string to object
  const bookmarkedQuestions = parseJSON<IBookmarkedQuestions>(localStorageValue)?.questions;

  let isBookmarked: boolean;
  if (bookmarkedQuestions !== null && questionId && bookmarkedQuestions?.includes(questionId)) {
    isBookmarked = true;
  } else {
    isBookmarked = false;
  }

  //Add the Question ID to the bookmark array
  const addQuestionToBookmark = () => {
    if (!questionId) return;
    //Get the saved questions from the local storage
    const bookmarkLocalStorage = getBookmarkedLocalStorageItem(moduleId);

    if (
      bookmarkLocalStorage !== null &&
      bookmarkLocalStorage !== undefined &&
      bookmarkLocalStorage?.questions &&
      !bookmarkLocalStorage?.questions?.includes(questionId)
    ) {
      //Append the id to the existing bookmarked questions in the localStorage array
      localStorage.setItem(
        `repeatio-marked-${moduleId}`,
        JSON.stringify(
          { ...bookmarkLocalStorage, questions: [...bookmarkLocalStorage.questions, questionId] },
          null,
          "\t"
        )
      );
    } else {
      //Create a new localStorage item with the id saved to the questions array
      //Get comb, set id with params;
      const newBookmarkedItem: IBookmarkedQuestions = {
        id: moduleId ?? "error", //TODO change this
        type: "marked",
        compatibility: packageJSON.version,
        questions: [questionId],
      };
      localStorage.setItem(`repeatio-marked-${moduleId}`, JSON.stringify(newBookmarkedItem, null, "\t"));
    }
    //Dispatch event that updates the state
    window.dispatchEvent(new StorageEvent("bookmark-event"));
  };

  //Remove the Question ID from the bookmark array
  const removeQuestionFromBookmark = () => {
    if (!questionId) return;

    //Get the bookmarked item from the local storage
    const bookmarkLocalStorageItem = getBookmarkedLocalStorageItem(moduleId);

    //Remove the id from the bookmark or delete the whole storage item
    if (bookmarkLocalStorageItem?.questions && bookmarkLocalStorageItem?.questions.length > 1) {
      //Remove the id from the bookmark array by filtering out the id

      const newBookmarkedItem: IBookmarkedQuestions = {
        ...bookmarkLocalStorageItem,
        questions: bookmarkLocalStorageItem.questions.filter((qID) => qID !== questionId),
      };
      //Update the localStorage
      localStorage.setItem(`repeatio-marked-${moduleId}`, JSON.stringify(newBookmarkedItem, null, "\t"));
    } else {
      //Delete the whole storage item if there was just one item left and it gets removed
      localStorage.removeItem(`repeatio-marked-${moduleId}`);
    }

    //Dispatch event that updates the state
    window.dispatchEvent(new StorageEvent("bookmark-event"));
  };

  // Return value and functions
  return { isBookmarked, addQuestionToBookmark, removeQuestionFromBookmark } as const;
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
