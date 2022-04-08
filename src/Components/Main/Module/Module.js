import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "../../../Context/ModuleContext.js";

//css
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

//functions
import shuffleArray from "../../../functions/shuffleArray.js";

//Component
const Module = ({ match }) => {
  //useState
  const [showPracticeOptions, setShowPracticeOptions] = useState(false);
  const [module, setModule] = useState();

  //context
  const { setFilteredQuestions, moduleData, setContextModuleID } = useContext(ModuleContext);

  //History
  let history = useHistory();

  //Params
  const { moduleID } = useParams();

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

  //Add/remove event listener to hide the practice options
  useEffect(() => {
    window.addEventListener("mousedown", hidePracticeOptions, false);
    window.addEventListener("keydown", hidePracticeOptions);

    return () => {
      window.removeEventListener("mousedown", hidePracticeOptions, false);
      window.removeEventListener("keydown", hidePracticeOptions);
    };
  }, [showPracticeOptions, hidePracticeOptions]);

  /*EVENTS*/
  //Show the practice options
  const handlePracticeClick = () => {
    setShowPracticeOptions(true);
  };

  //Train with all questions in chronological order
  const onChronologicalClick = () => {
    setFilteredQuestions(moduleData.questions);
    history.push({
      pathname: `/module/${match.params.moduleID}/question/${module.questions[0].id}`,
      search: "?mode=chronological",
    });
  };

  //Train with all questions in random order
  const onRandomClick = () => {
    const shuffledQuestions = shuffleArray(moduleData.questions);
    setFilteredQuestions(shuffledQuestions);
    history.push({
      pathname: `/module/${match.params.moduleID}/question/${shuffledQuestions[0].id}`,
      search: "?mode=random",
    });
  };

  //Train with only the saved Questions
  const onSavedQuestionsClick = () => {
    const savedQuestionsID = JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`));

    if (savedQuestionsID === null) {
      return;
    }

    const savedQuestions = moduleData.questions.filter((question) => savedQuestionsID.includes(question.id));

    setFilteredQuestions(savedQuestions);
    history.push({
      pathname: `/module/${match.params.moduleID}/question/${savedQuestions[0].id}`,
      search: "?mode=chronological",
    });
  };

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
      <div className='module-cards'>
        {/* practice */}
        <div className='card-practice' tabIndex='0'>
          <button className='practice-icon-name' onClick={handlePracticeClick}>
            <AiOutlineBook />
            <h3>Practice</h3>
          </button>
          {showPracticeOptions && (
            <div className='practice-chronological-random-wrapper'>
              <button className='practice-chronological' onClick={onChronologicalClick}>
                <RiArrowLeftRightLine />
                <h3>Chronological</h3>
              </button>
              <button
                /* to={`/module/${match.params.moduleID}/question/${module.questions[randomIndex].id}?mode=random`} */
                onClick={onRandomClick}
                className='practice-random'
              >
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
          <Link to={`/module/${match.params.moduleID}/all-questions`}>
            <BsListOl />
            <h3>All Questions</h3>
          </Link>
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
        <button className='card-saved-questions' onClick={onSavedQuestionsClick}>
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
