import React, { useState, useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

//Components
import { GridCards } from "../GridCards/GridCards";
import { SiteHeading } from "../SiteHeading/SiteHeading";
import { Card, LinkElement, ButtonElement } from "../Card/Card";
import { QuestionEditor } from "../QuestionEditor/QuestionEditor";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover";
import { toast } from "react-toastify";
import { ModuleNotFound } from "./ModuleNotFound";
import MenuItem from "@mui/material/MenuItem";
import { DeleteConfirmationModal } from "@components/CustomModal/DeleteConfirmationModal";

//Icons
import { AiOutlineBook, AiOutlineEdit } from "react-icons/ai";
import { BiStats, BiTrash } from "react-icons/bi";
import { BsListOl, BsPlusCircle, BsExclamationTriangle } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa";
import { MdBookmark } from "react-icons/md";
import { TbFileExport, TbFileImport } from "react-icons/tb";

//functions
import { shuffleArray } from "../../utils/shuffleArray";
import { saveFile } from "../../utils/saveFile";
import { parseJSON } from "../../utils/parseJSON";

//Interfaces and types
import { IParams } from "../../utils/types.js";
import {
  getBookmarkedLocalStorageItem,
  getBookmarkedQuestionsFromModule,
  IBookmarkedQuestions,
} from "../Question/components/Actions/BookmarkQuestion";
import { IQuestion } from "../Question/useQuestion";

import { ModuleEditor } from "../ModuleEditor";

//TODO
// - test if no saved questions but then imported => should enable export

export interface IModule {
  id: string;
  name: string;
  type?: "module";
  lang: "en" | "de" | (string & {});
  compatibility: string;
  questions: IQuestion[];
}

interface LocationState {
  name: string | undefined;
}

//Component
export const Module = () => {
  //Access state of link
  const location = useLocation();

  const locationState = location.state as LocationState;

  //Access params
  const { moduleID } = useParams<{ moduleID: string }>();

  // Get modulename from passed link state or localStorage
  const { moduleName, error } = useModuleName(locationState?.name, moduleID);

  const [showModal, setShowModal] = useState(false);

  const [showModuleEditor, setShowModuleEditor] = useState(false);

  //Navigate (previously history)
  let navigate = useNavigate();

  /*EVENTS*/
  //Train with all questions in chronological order starting at the first question
  const onChronologicalClick = () => {
    let questions = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`))?.questions;

    // Navigate to first question if there are questions in the module else show warning
    if (questions !== undefined && questions.length >= 1) {
      navigate({
        pathname: `/module/${moduleID}/question/${questions[0].id}`,
        search: "?mode=practice&order=chronological",
      });
    } else {
      toast.warn("No questions found!");
    }
  };

  //Train with all questions in random order
  const onRandomClick = () => {
    const questions = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`))?.questions;

    if (questions && questions.length >= 1) {
      //If the array isn't spread, it modifies the order of the original data
      const shuffledQuestions = shuffleArray([...questions]);

      //setFilteredQuestions(shuffledQuestions);
      navigate({
        pathname: `/module/${moduleID}/question/${shuffledQuestions[0].id}`,
        search: "?mode=practice&order=random",
      });
    } else {
      toast.warn("No questions found!");
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
      disabled: false,
      description: "",
      icon: <AiOutlineEdit />,
      bottom: [<ButtonElement key='info' buttonText='Edit' handleClick={() => setShowModuleEditor(true)} />],
    },
  ];

  if (error) {
    return <ModuleNotFound />;
  }

  //JSX
  return (
    <div id={moduleName ?? moduleID}>
      <SiteHeading title={`${moduleName} (${moduleID})`} />
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
      <QuestionEditor handleModalClose={handleModalClose} mode={"create"} showModal={showModal} />
      <ModuleEditor
        handleModalClose={() => setShowModuleEditor(false)}
        mode='edit'
        moduleId={moduleID}
        showModal={showModuleEditor}
        navigateOnSuccess={true}
      />
    </div>
  );
};

// Subscribe to any custom storage events (should be triggered if user edits module)
function subscribe(onSettingsChange: () => void) {
  window.addEventListener("storageEvent", onSettingsChange);

  return () => window.removeEventListener("storageEvent", onSettingsChange);
}

// Return localStorage module
function getSnapShot(key: string | undefined) {
  if (typeof key === "undefined" || key === null) return;

  return localStorage.getItem(`repeatio-module-${key}`);
}

// Custom hook to get the module name based on locationStateName and moduleId
const useModuleName = (locationStateName: LocationState["name"], moduleId: string | undefined) => {
  const module = useSyncExternalStore(subscribe, () => getSnapShot(moduleId));

  // Check if locationStateName is provided
  if (locationStateName) {
    // Return locationStateName as moduleName
    return { moduleName: locationStateName };
  } else if (module) {
    /* Refetching the module name if the property is not passed by the router. This is the case when the user directly navigates to the module without navigating through the home modules. */
    const parsedModule = parseJSON<IModule>(module);

    // Check if parsedModule is valid
    if (typeof parsedModule !== "undefined" && parsedModule !== null) {
      // Return parsedModule's name as moduleName
      return { moduleName: parsedModule.name };
    } else {
      // Return an error flag indicating invalid parsedModule
      return { error: true };
    }
  } else {
    // Return an error flag indicating no module found
    return { error: true };
  }
};

//Display bottom of BookmarkedQuestions
const BookmarkedQuestionsBottom = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showDeletionConfirmation, setShowDeletionConfirmation] = useState(false);

  //Navigate (previously history)
  let navigate = useNavigate();

  //Params
  const { moduleID } = useParams<IParams>();

  //Reset anchor if component unmounts
  useLayoutEffect(() => {
    return () => {
      setAnchorEl(null);
    };
  }, []);

  //Update location of popover button
  const handlePopoverButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //Close popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handlePopoverDeleteBookmarkedQuestions = () => {
    const bookmarkedQuestionsIDs = getBookmarkedQuestionsFromModule(moduleID);

    if (bookmarkedQuestionsIDs) {
      setShowDeletionConfirmation(true);
    } else {
      toast.warn("Found 0 bookmarked questions for this module!", {
        autoClose: 10000,
      });
    }

    handlePopoverClose();
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
    setShowDeletionConfirmation(false);
  };

  //Export saved questions from localStorage
  const handleExport = async (): Promise<void> => {
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
  const handleFileImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let importedBookmarkedFile: IBookmarkedQuestions;

    try {
      const file = e.target.files?.[0];

      //Get file content and transform to JSON
      if (!file) return;
      const fileContent = await file.text();
      importedBookmarkedFile = JSON.parse(fileContent);
    } catch (error) {
      //Notify user of failed import
      if (error instanceof Error) {
        toast.error(error.message);
      }
      handlePopoverClose();
      return;
    }

    //If bookmarked file has old file structure (just array) show error
    if (Array.isArray(importedBookmarkedFile)) {
      //Notify user that import is false file structure
      toast.error("Failed to import because the file does not contain the correct file structure!");
      handlePopoverClose();
      return;
    }

    //Upload the file to the localStorage
    //Don't add ids of questions that are not in this module or duplicates
    let rejectedIDs: IBookmarkedQuestions["questions"] = [];
    let newIDs: IBookmarkedQuestions["questions"] = [];

    //Get module from localStorage
    const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`));

    //Get old saved questions from localStorage or provide empty array
    const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem(moduleID);

    //Get the ids from the bookmarked item or add empty array
    let updatedSavedQuestions = [...(bookmarkedLocalStorageItem?.questions || [])];

    //Add only ids that are in the module (as question ids) and only if not already in localStorage
    importedBookmarkedFile?.questions?.forEach((importedID) => {
      //Return if id of the imported saved questions is not in the module
      if (module?.questions?.findIndex((question: IQuestion) => question.id === importedID) === -1) {
        rejectedIDs?.push(importedID);
        return false;
      }

      //If the item is not already in the localStorage and the localStorage exists, add the item to the new array
      if (updatedSavedQuestions?.indexOf(importedID) === -1) {
        updatedSavedQuestions?.push(importedID);
        newIDs?.push(importedID);
      }
    });

    //Update localStorage with the combined bookmarked questions
    if (updatedSavedQuestions?.length > 0) {
      //Add new Ids to the existing bookmark item or use the data (id, compatibility, type) from the import for the new bookmark
      if (bookmarkedLocalStorageItem) {
        localStorage.setItem(
          `repeatio-marked-${moduleID}`,
          JSON.stringify({ ...bookmarkedLocalStorageItem, questions: updatedSavedQuestions }, null, "\t")
        );
      } else {
        localStorage.setItem(
          `repeatio-marked-${moduleID}`,
          JSON.stringify({ ...importedBookmarkedFile, questions: updatedSavedQuestions }, null, "\t")
        );
      }

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
  const onBookmarkedQuestionsClick = () => {
    //Get the bookmarked ids from the localStorage item
    const bookmarkedQuestionsIDs = getBookmarkedQuestionsFromModule(moduleID);

    //Return if no such element can be found
    if (bookmarkedQuestionsIDs === null || bookmarkedQuestionsIDs === undefined) {
      toast.warn("Found 0 bookmarked questions for this module!", {
        autoClose: 10000,
      });
      return;
    }

    // Get an array of all question IDs from the module in local storage
    const allIds = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`))?.questions.reduce(
      (acc: string[], question) => {
        acc.push(question.id);
        return acc;
      },
      []
    );

    // Find the first valid ID in bookmarkedQuestionsIDs that exists in allIds
    const validId = bookmarkedQuestionsIDs.find((id) => allIds?.includes(id));

    if (validId) {
      //Navigate to question component
      navigate({
        pathname: `/module/${moduleID}/question/${validId}`,
        search: "?mode=bookmarked&order=chronological",
      });
    } else {
      toast.error("Bookmarked Questions only include invalid ids! Please contact the developer on GitHub!");
    }
  };

  return (
    <>
      <ButtonElement key='saved-questions' buttonText='Start' handleClick={onBookmarkedQuestionsClick} />
      <PopoverButton handleClick={handlePopoverButtonClick} />
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem handleClick={handlePopoverDeleteBookmarkedQuestions} text='Delete' icon={<BiTrash />} />
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
        <ImportBookmarkedQuestions handleChange={handleFileImportChange} />
      </PopoverMenu>
      <DeleteConfirmationModal
        showModal={showDeletionConfirmation}
        deleteButtonText='Remove bookmarked Questions'
        handleCloseModal={() => setShowDeletionConfirmation(false)}
        message='Are you sure you want to remove all bookmarks for this module? Note that the questions themselves will not be deleted. This action cannot be undone!'
        onConfirmDelete={handleBookmarkedDelete}
        title='Remove bookmarked Questions?'
      />
    </>
  );
};

interface IImportBookmarkedQuestions {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ImportBookmarkedQuestions: React.FC<IImportBookmarkedQuestions> = ({ handleChange }) => {
  return (
    <MenuItem className='MuiMenuItem-root' disableRipple disableGutters sx={{ padding: "0" }}>
      <label
        htmlFor='file-upload'
        style={{
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
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
    </MenuItem>
  );
};
