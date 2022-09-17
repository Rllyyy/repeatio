import { useState, useEffect, useContext, useCallback, useLayoutEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "./moduleContext.js";

//Components
import { GridCards } from "../GridCards/GridCards.jsx";
import { SiteHeading } from "../SiteHeading/SiteHeading";
import { Card, LinkElement, ButtonElement } from "../Card/Card.js";
import { Spinner } from "../Spinner/Spinner";
import { QuestionEditor } from "../QuestionEditor/QuestionEditor";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover.jsx";
import { toast } from "react-toastify";

//Icons
import { AiOutlineBook, AiOutlineEdit } from "react-icons/ai";
import { BiStats, BiTrash } from "react-icons/bi";
import { BsListOl, BsPlusCircle, BsExclamationTriangle } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa";
import { MdBookmark } from "react-icons/md";
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
      toast.warn("No questions found!");
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
      toast.warn("No questions found!");
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

  const handleBookmarkedDelete = () => {
    //Get item from storage
    const itemInStorage = Object.keys(localStorage).includes(`repeatio-marked-${moduleID}`);

    //Remove item from localStorage if it is present and dispatch event or show error
    if (itemInStorage) {
      localStorage.removeItem(`repeatio-marked-${moduleID}`);
      toast.success(`Deleted bookmarked questions for "${moduleID}"!`);
      window.dispatchEvent(new Event("storage"));
    } else {
      toast.error(`Failed to delete the bookmarked questions for "${moduleID}" because there are 0 questions saved!`);
    }
    handlePopoverClose();
  };

  //Export saved questions from localStorage
  const handleExport = async () => {
    const file = localStorage.getItem(`repeatio-marked-${moduleID}`);

    if (file) {
      await saveFile({ file: file, name: `repeatio-marked-${moduleID}` });
    } else {
      //Notify user that there are no marked questions
      toast.error(
        `Failed to export the bookmarked questions for "${moduleID}" because there aren't any bookmarked questions!`,
        { autoClose: 12000 }
      );
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
      //Notify user of failed import
      toast.error(error.message);
      handlePopoverClose();
      return;
    }

    //TODO check file structure (maybe json file that contains type: marked, compatibility: version and saved ids )
    if (!Array.isArray(importedSavedQuestions)) {
      //Notify user that import is false file structure
      toast.error("Failed to import because the file does not contain the correct file structure!");
      handlePopoverClose();
      return;
    }

    //Upload the file to the localStorage
    //Don't add ids of questions that are not in this module or duplicates
    let rejectedIDs = [];
    let newIDs = [];
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
        newIDs.push(importedID);
      }
    });

    //Update localStorage with new array
    if (updatedSavedQuestions?.length > 0) {
      localStorage.setItem(`repeatio-marked-${moduleID}`, JSON.stringify(updatedSavedQuestions, null, "\t"), {
        sameSite: "strict",
        secure: true,
      });

      //Show message to user (currently even shows if 0 IDs are actually new)
      toast.success(
        <>
          <p>Imported {newIDs.length} question(s).</p>
          <p>Total saved questions: {updatedSavedQuestions?.length}</p>
        </>,
        { data: `Imported ${newIDs.length} question(s).\nTotal saved questions: ${updatedSavedQuestions?.length}` }
      );
    }

    //Show ids that are rejected as toast and in console
    if (rejectedIDs?.length > 0) {
      const warningText = `Failed to import ${rejectedIDs.join(", ")} as ${
        rejectedIDs.length < 2 ? "this id is" : "these ids are"
      } not present in this module!`;
      toast.warn(warningText, {
        autoClose: warningText.length * 60,
      });
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
    if (savedQuestionsID === null) {
      toast.warn("Found 0 bookmarked questions for this module!", {
        autoClose: 10000,
      });
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
        <PopoverMenuItem handleClick={handleBookmarkedDelete} text='Delete' icon={<BiTrash />} />
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
        <ImportBookmarkedQuestions handleChange={handleFileImportChange} />
      </PopoverMenu>
    </>
  );
};

const ImportBookmarkedQuestions = ({ handleChange }) => {
  return (
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
        onChange={handleChange}
      />
    </li>
  );
};
