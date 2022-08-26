import { useState, useEffect, useContext, useCallback, useLayoutEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "./ModuleContext.js";

//Components
import { GridCards } from "../GridCards/GridCards.jsx";
import { SiteHeading } from "../SiteHeading/SiteHeading";
import { Card, LinkElement, ButtonElement } from "../Card/Card.js";
import { Spinner } from "../Spinner/Spinner";
import { QuestionEditor } from "../QuestionEditor/QuestionEditor";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover.jsx";

//Icons
import { AiOutlineBook } from "react-icons/ai";
import { FaGraduationCap } from "react-icons/fa";
import { BsListOl } from "react-icons/bs";
import { BsPlusCircle } from "react-icons/bs";
import { BsExclamationTriangle } from "react-icons/bs";
import { MdBookmark } from "react-icons/md";
import { BiStats } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { TbFileExport, TbFileImport } from "react-icons/tb";

//functions
import { shuffleArray } from "../../utils/shuffleArray";
import { saveFile } from "../../utils/saveFile.js";

//TODO
// - test if no saved questions but then imported => should enable export

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
      title: "Bookmarked Questions",
      description: "Train with your bookmarked questions",
      icon: <MdBookmark />,
      bottom: <BookmarkedQuestionsBottom />,
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

//Display bottom of BookmarkedQuestions
const BookmarkedQuestionsBottom = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  //History
  let history = useHistory();

  //Params
  const { moduleID } = useParams();

  //Context
  const { setFilteredQuestions, moduleData } = useContext(ModuleContext);

  //Reset anchor if component unmounts
  useLayoutEffect(() => {
    return () => {
      setAnchorEl(null);
    };
  }, []);

  //Update location of popover button
  const handlePopoverButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  //Close popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  //Export saved questions from localStorage
  const handleExport = async () => {
    const file = localStorage.getItem(`repeatio-marked-${moduleID}`);

    if (file) {
      await saveFile({ file: file, name: `repeatio-marked-${moduleID}` });
    } else {
      //TODO notify user
      console.error(`Couldn't find file: repeatio-marked-${moduleID}`);
    }

    handlePopoverClose();
  };

  //Import saved questions from .json file (needs to be onChange on input type file as filePicker api is not supported on firefox/chrome)
  const handleFileImportChange = async (e) => {
    let importedSavedQuestions;
    try {
      const file = e.target.files[0];

      //Get file content and transform to JSON
      if (!file) return;
      const fileContent = await file.text();
      importedSavedQuestions = JSON.parse(fileContent);
    } catch (error) {
      //TODO warn user with error.message

      console.error(error);
      handlePopoverClose();
      return;
    }

    //TODO check file structure (maybe json file that contains type: marked, compatibility: version and saved ids )
    if (!Array.isArray(importedSavedQuestions)) {
      //TODO switch to react toastify
      console.error("Failed to import as the given file does not contain the correct file structure!");
      handlePopoverClose();
      return;
    }

    //Upload the file to the localStorage
    //Don't add ids of questions that are not in this module or duplicates
    let rejectedIDs = [];
    //Get old saved questions from localStorage or provide empty array
    let updatedSavedQuestions = [...(JSON.parse(localStorage.getItem(`repeatio-marked-${moduleID}`)) || [])];

    //Add only ids that are in the module (as question ids) and only if not already in localStorage
    importedSavedQuestions?.forEach((importedID) => {
      //Return if id of the imported saved questions is not in the module
      if (moduleData.questions?.findIndex((question) => question.id === importedID) === -1) {
        rejectedIDs.push(importedID);
        return false;
      }

      //If the item is not already in the localStorage and the localStorage exists, add the item to the new array
      if (updatedSavedQuestions?.indexOf(importedID) === -1) {
        updatedSavedQuestions?.push(importedID);
      }
    });

    //Update localStorage with new array
    if (updatedSavedQuestions?.length > 0) {
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify(updatedSavedQuestions, null, "\t"), {
        sameSite: "strict",
        secure: true,
      });
    }

    //Show ids that are rejected
    //TODO make this a toast with react-toastify
    if (rejectedIDs?.length > 0) {
      console.warn(
        `Failed to import ${rejectedIDs.join(", ")} as ${
          rejectedIDs.length < 2 ? "this id is" : "these ids are"
        } not present in this module!`
      );
    }

    //TODO toastify add success
    handlePopoverClose();
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

  return (
    <>
      <ButtonElement key='saved-questions' buttonText='Start' handleClick={onSavedQuestionsClick} />
      <PopoverButton handleClick={handlePopoverButtonClick} />
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
        <li className='MuiMenuItem-root'>
          <label
            htmlFor='file-upload'
            className='MuiMenuItem-root'
            style={{
              minHeight: "48px",
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TbFileImport />
            <span>Import</span>
          </label>
          <input
            style={{ display: "none" }}
            className='file-input'
            id='file-upload'
            type='file'
            accept='.json'
            onChange={handleFileImportChange}
          />
        </li>
      </PopoverMenu>
    </>
  );
};
