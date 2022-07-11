import { useState, useEffect, useContext, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "../../../Context/ModuleContext.js";

//Components
import SiteHeading from "../../SharedComponents/SiteHeading/SiteHeading.jsx";
import Card from "../../SharedComponents/Card/Card.js";
import Spinner from "../../SharedComponents/Spinner/Spinner.js";
import QuestionEditor from "../../SharedComponents/QuestionEditor/QuestionEditor.js";

//css
import "./Module.css";

//Icons
import { AiOutlineBook } from "react-icons/ai";
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
const Module = () => {
  //useState
  const [module, setModule] = useState();
  const [showModal, setShowModal] = useState(false);

  //context
  const { setFilteredQuestions, moduleData, setContextModuleID } = useContext(ModuleContext);

  //History
  let history = useHistory();

  //Params
  const { moduleID } = useParams();

  /* USEEFFECTS */
  //Update the module state by using the data from the context
  useEffect(() => {
    if (moduleData?.length === 0 || moduleData === undefined) return;
    setModule(moduleData);
  }, [moduleData]);

  //Tell the context to update with the new module (id is in the url)
  useEffect(() => {
    setContextModuleID(moduleID);
  }, [moduleID, setContextModuleID]);

  /*EVENTS*/
  //Train with all questions in chronological order
  const onChronologicalClick = () => {
    setFilteredQuestions(moduleData.questions);

    if (moduleData.questions !== undefined && moduleData.questions.length >= 1) {
      history.push({
        pathname: `/module/${moduleID}/question/${module.questions[0].id}`,
        search: "?mode=chronological",
      });
    } else {
      console.warn("No questions found!");
      return;
    }
  };

  //Train with all questions in random order
  const onRandomClick = () => {
    //If the array isn't spread, it modifies the order of the original data
    const shuffledQuestions = shuffleArray([...moduleData.questions]);
    if (shuffledQuestions.length >= 1) {
      setFilteredQuestions(shuffledQuestions);
      history.push({
        pathname: `/module/${moduleID}/question/${shuffledQuestions[0].id}`,
        search: "?mode=random",
      });
    } else {
      console.warn("No questions found!");
      return;
    }
  };

  //Train with only the saved Questions
  const onSavedQuestionsClick = () => {
    //Get the data from the localStorage
    //TODO for electron get from filesystem
    const savedQuestionsID = JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`));

    //Return if no such element can be found
    //TODO give user response that no saved questions are defined (maybe with toast)
    if (savedQuestionsID === null) {
      console.warn("No saved Questions found!");
      return;
    }

    //For each element in the array return the question object
    //kinda expensive calculation (array in array) :/
    let savedQuestions = [];
    savedQuestionsID.forEach((questionID) => {
      const question = moduleData.questions.find((question) => question.id === questionID);
      //push question object to array if question is found
      if (question !== undefined) {
        savedQuestions.push(question);
      }
    });

    //Update the context
    setFilteredQuestions(savedQuestions);

    //Navigate to question component
    history.push({
      pathname: `/module/${moduleID}/question/${savedQuestions[0].id}`,
      search: "?mode=chronological",
    });
  };

  const handleAddQuestionClick = () => {
    setShowModal(true);
  };

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  //All cards
  const moduleCards = [
    {
      title: "Practice",
      description: "Practice all questions in chronological or random order",
      icon: <AiOutlineBook />,
      leftBottom: {
        type: "button",
        buttonText: "Chronological",
        function: onChronologicalClick,
      },
      rightBottom: {
        type: "button",
        buttonText: "Random",
        function: onRandomClick,
      },
    },
    {
      title: "Exam",
      disabled: true,
      description: "Simulate an exam",
      icon: <FaGraduationCap />,
      leftBottom: {
        type: "button",
        buttonText: "Start",
      },
    },
    {
      title: "Question Overview",
      description: "View, filter and sort all questions",
      icon: <BsListOl />,
      leftBottom: {
        type: "link",
        linkTo: `/module/${moduleID}/all-questions`,
        linkAriaLabel: "View all Questions",
        linkText: "View",
      },
    },
    {
      title: "Add Question",
      disabled: false,
      description: "Add a missing question",
      icon: <BsPlusCircle />,
      leftBottom: {
        type: "button",
        buttonText: "Add",
        function: handleAddQuestionClick,
      },
    },
    {
      title: "Last 30 Mistakes",
      disabled: true,
      description: "Train the last 30 mistakes",
      icon: <BsExclamationTriangle />,
      leftBottom: {
        type: "button",
        buttonText: "Start",
      },
    },
    {
      title: "Saved Questions",
      description: "Train with your saved questions",
      icon: <MdBookmark />,
      leftBottom: {
        type: "button",
        buttonText: "Start",
        function: onSavedQuestionsClick,
      },
    },
    {
      title: "Statistics",
      disabled: true,
      description: "",
      icon: <BiStats />,
      leftBottom: {
        type: "button",
        buttonText: "View",
      },
    },
    {
      title: "Info",
      disabled: true,
      description: "",
      icon: <AiOutlineEdit />,
      leftBottom: {
        type: "button",
        buttonText: "Edit",
      },
    },
  ];

  //Show loading while module isn't set
  if (!module) {
    return (
      <div className='module-spinner'>
        <Spinner />
      </div>
    );
  }

  //JSX
  return (
    <div id={`module-${module.id}`}>
      <SiteHeading title={`${module.name} (${module.id})`} />
      <div className='module-cards'>
        {moduleCards.map((card) => {
          const { title, disabled, description, icon, leftBottom, rightBottom } = card;
          return (
            <Card
              key={title}
              disabled={disabled}
              type='module-card'
              title={title}
              description={description}
              icon={icon}
              leftBottom={leftBottom}
              rightBottom={rightBottom}
            />
          );
        })}
      </div>
      {showModal && <QuestionEditor handleModalClose={handleModalClose} />}
    </div>
  );
};

export default Module;
