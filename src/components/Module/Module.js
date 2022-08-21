import { useState, useEffect, useContext, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "./ModuleContext.js";

//Components
import { GridCards } from "../GridCards/GridCards.jsx";
import { SiteHeading } from "../SiteHeading/SiteHeading";
import { Card, LinkElement, ButtonElement } from "../Card/Card.js";
import { Spinner } from "../Spinner/Spinner";
import { QuestionEditor } from "../QuestionEditor/QuestionEditor";

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
import { shuffleArray } from "../../utils/shuffleArray";

//Component
export const Module = () => {
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
      bottom: [
        <ButtonElement key='practice-chronological' handleClick={onChronologicalClick} buttonText='Start' />,
        <ButtonElement key='practice-random' handleClick={onRandomClick} buttonText='Random' />,
      ],
    },
    {
      title: "Exam",
      disabled: true,
      description: "Simulate an exam",
      icon: <FaGraduationCap />,
      bottom: [<ButtonElement key='exam-start' buttonText='Start' />],
    },
    {
      title: "Question Overview",
      description: "View, filter and sort all questions",
      icon: <BsListOl />,
      bottom: [
        <LinkElement
          key='overview-view'
          linkTo={`/module/${moduleID}/all-questions`}
          linkAriaLabel='View all Questions'
          linkText='View'
        />,
      ],
    },
    {
      title: "Add Question",
      disabled: false,
      description: "Add a missing question",
      icon: <BsPlusCircle />,
      bottom: [<ButtonElement key='add-question' handleClick={handleAddQuestionClick} buttonText='Add' />],
    },
    {
      title: "Last 30 Mistakes",
      disabled: true,
      description: "Train the last 30 mistakes",
      icon: <BsExclamationTriangle />,
      bottom: [<ButtonElement key='30-mistakes' buttonText='Start' />],
    },
    {
      title: "Saved Questions",
      description: "Train with your saved questions",
      icon: <MdBookmark />,
      bottom: [<ButtonElement key='saved-questions' buttonText='Start' handleClick={onSavedQuestionsClick} />],
    },
    {
      title: "Statistics",
      disabled: true,
      description: "",
      icon: <BiStats />,
      bottom: [<ButtonElement key='statistics-view' buttonText='View' />],
    },
    {
      title: "Module Info",
      disabled: true,
      description: "",
      icon: <AiOutlineEdit />,
      bottom: [<ButtonElement key='info' buttonText='View' />],
    },
  ];

  //Show loading while module isn't set
  if (!module) {
    return (
      <div className='module-spinner' style={{ marginTop: "80px" }}>
        <Spinner />
      </div>
    );
  }

  //JSX
  return (
    <div id={`module-${module.id}`}>
      <SiteHeading title={`${module.name} (${module.id})`} />
      <GridCards>
        {moduleCards.map((card) => {
          const { title, disabled, description, icon, bottom } = card;
          return (
            <Card
              key={title}
              data-cy={title}
              disabled={disabled}
              type='module-card'
              title={title}
              description={description}
              icon={icon}
            >
              {bottom}
            </Card>
          );
        })}
      </GridCards>
      {showModal && <QuestionEditor handleModalClose={handleModalClose} />}
    </div>
  );
};
