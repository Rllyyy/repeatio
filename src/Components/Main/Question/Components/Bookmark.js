import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

//Icons
import { MdBookmarkAdd, MdBookmarkRemove } from "react-icons/md";

//Component
const Bookmark = ({ questionID }) => {
  const [saved, setSaved] = useState();
  const { moduleID } = useParams();

  //Add the Question ID to the bookmark array
  const addQuestionToBookmark = (id) => {
    //Get the saved questions from the local storage
    const savedQuestions = JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`));

    if (savedQuestions !== null && !savedQuestions.includes(id)) {
      //Add the id to the localStorage array
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify([...savedQuestions, id]), {
        sameSite: "strict",
        secure: true,
      });
    } else {
      //Create localStorage item
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify([id]), { sameSite: "strict", secure: true });
    }
    setSaved(true);
  };

  //Remove the Question ID from the bookmark array
  const removeQuestionFromBookmark = (id) => {
    //Get the saved questions from the local storage
    const savedQuestions = JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`));

    //Remove the id from the bookmark or delete the whole storage item
    if (savedQuestions.length > 1) {
      //Remove the id from the bookmark array by filtering out the id
      localStorage.setItem(
        `repeatio-marked-${moduleID}`,
        JSON.stringify(
          savedQuestions.filter((qID) => qID !== id),
          { sameSite: "strict", secure: true }
        )
      );
    } else {
      //Delete the whole storage item if there was just one item left and it gets removed
      localStorage.removeItem(`repeatio-marked-${moduleID}`);
    }

    setSaved(false);
  };

  //Add or remove the question id in the bookmark
  const onBookmarkClick = (id) => {
    if (!saved) {
      addQuestionToBookmark(id);
    } else {
      removeQuestionFromBookmark(id);
    }
  };

  //Set the state so the correct icon can be displayed
  useEffect(() => {
    const savedQuestions = JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`));

    //If the bookmark array exists for this module and the array includes the id,
    //set the state to saved else the question is not saved
    if (savedQuestions !== null && savedQuestions.includes(questionID)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [questionID, moduleID]);

  //JSX
  return (
    <button onClick={() => onBookmarkClick(questionID)} className='bookmark-question-button'>
      {/* Decide which button to display */}
      {saved ? (
        <MdBookmarkRemove className='bookmark-remove' data-testid='bookmark-remove' />
      ) : (
        <MdBookmarkAdd className='bookmark-add' data-testid='bookmark-add' />
      )}
    </button>
  );
};

export default Bookmark;
