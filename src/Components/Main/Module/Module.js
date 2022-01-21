import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { ModuleContext } from "../../../Context/ModuleContext.js";
import "./Module.css";

//Icons
import { AiOutlineBook } from "react-icons/ai";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa";
import { BsListOl } from "react-icons/bs";
import { BsPlusCircle } from "react-icons/bs";
import { BsExclamationTriangle } from "react-icons/bs";
import { MdBookmark } from "react-icons/md";
import { BiStats } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";

const Module = ({ match }) => {
  //useState
  const [showPracticeOptions, setShowPracticeOptions] = useState(false);
  const [module, setModule] = useState();

  //context
  const { moduleData, setContextModuleID } = useContext(ModuleContext);

  //events
  const practiceClick = () => {
    setShowPracticeOptions(true);
  };

  /* USEEFFECTS */
  //Update the module state by using the data from the context
  useEffect(() => {
    if (moduleData.length === 0) return;
    setModule(moduleData);
  }, [moduleData]);

  //Tell the context to update with the new module (id is in the url)
  useEffect(() => {
    setContextModuleID(match.params.moduleID);
  }, [match.params.moduleID, setContextModuleID]);

  const hidePracticeOptions = useCallback(
    (e) => {
      if (!showPracticeOptions) return;

      //Check if the event is mousedown (click away) or escape key
      if (
        e.type === "mousedown" &&
        e.target.className !== "practice-chronological" &&
        e.target.parentNode.className !== "practice-chronological" &&
        e.target.className !== "practice-random" &&
        e.target.parentNode.className !== "practice-random"
      ) {
        setShowPracticeOptions(false);
        //keyCode 27 = escape key
      } else if (e.keyCode === 27) {
        setShowPracticeOptions(false);
      }
    },
    [showPracticeOptions]
  );

  useEffect(() => {
    window.addEventListener("mousedown", hidePracticeOptions, false);
    window.addEventListener("keydown", hidePracticeOptions);

    return () => {
      window.removeEventListener("mousedown", hidePracticeOptions, false);
      window.removeEventListener("keydown", hidePracticeOptions);
    };
  }, [showPracticeOptions, hidePracticeOptions]);

  //Prevent the rendering when there is no module set (to prevent hopping ui)
  if (!module) {
    return <></>;
  }

  //JSX
  return (
    <>
      <div className='module-heading-wrapper'>
        <h1 className='module-heading'>{module.name}</h1>
        <div className='heading-underline'></div>
      </div>
      {/* <h3 className='module-description'>{description}</h3> */}
      {/* //TODO Add Bookmark */}
      <div className='module-cards'>
        {/* practice */}
        <div className='card-practice' tabIndex='0'>
          <button className='practice-icon-name' onClick={() => practiceClick()}>
            <AiOutlineBook />
            <h3>Practice</h3>
          </button>
          {showPracticeOptions && (
            <div className='practice-chronological-random-wrapper'>
              <Link
                to={`/module/${match.params.moduleID}/${module.questions[0].id}`}
                className='practice-chronological'
              >
                <RiArrowLeftRightLine />
                <h3>Chronological</h3>
              </Link>
              <button className='practice-random'>
                <GiPerspectiveDiceSixFacesRandom />
                <h3>Random</h3>
              </button>
            </div>
          )}
        </div>
        {/* Exam simulation. Time and total points have to be defined for this to work*/}
        <button className='card-exam'>
          <FaGraduationCap />
          <h3>Exam</h3>
        </button>
        {/* View all Questions*/}
        <button className='card-all-questions'>
          <BsListOl />
          <h3>All Questions</h3>
        </button>
        {/* Add Question */}
        <button className='card-add-question'>
          <BsPlusCircle />
          <h3>Add Question</h3>
        </button>
        {/* View last mistakes */}
        <button className='card-last-mistakes'>
          <BsExclamationTriangle />
          <h3>Last 30 Mistakes</h3>
        </button>
        {/* View saved Questions*/}
        <button className='card-saved-questions'>
          <MdBookmark />
          <h3>Saved Questions</h3>
        </button>
        {/* Statistics */}
        <button className='card-statistics'>
          <BiStats />
          <h3>Statistics</h3>
        </button>
        {/* Edit Module */}
        <button className='card-edit'>
          <AiOutlineEdit />
          <h3>Edit Module</h3>
        </button>
      </div>
    </>
  );
};

export default Module;
