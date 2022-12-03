import React, { useState, useContext, useCallback, useLayoutEffect, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModuleContext } from "./moduleContext.js";
import packageJSON from "../../../package.json";

//Components
import { GridCards } from "../GridCards/GridCards.jsx";
import { SiteHeading } from "../SiteHeading/SiteHeading";
import { Card, LinkElement, ButtonElement } from "../Card/Card";
import { Spinner } from "../Spinner/Spinner";
import { IQuestion, QuestionEditor } from "../QuestionEditor/QuestionEditor";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover";
import { toast } from "react-toastify";
import { ModuleNotFound } from "./ModuleNotFound.jsx";

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

//Interfaces and types
import { IParams } from "../../utils/types.js";
import {
  getBookmarkedLocalStorageItem,
  getBookmarkedQuestionsFromModule,
  IBookmarkedQuestions,
} from "../Question/components/Actions/BookmarkQuestion";

//TODO
// - test if no saved questions but then imported => should enable export

interface IModule {
  id: string;
  name: string;
  lang: "en" | "de";
  compatibility: string;
  questions: IQuestion[];
}

//Component
export const Module = () => {
  //useState
  const [module, setModule] = useState<IModule | {}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  //context
  //TODO fix this any
  const { setFilteredQuestions, moduleData, setContextModuleID } = useContext<any>(ModuleContext);

  //History
  let history = useHistory();

  //Params
  const { moduleID } = useParams<{ moduleID: string }>();

  /* USEEFFECTS */
  //Update the module state by using the data from the context
  useLayoutEffect(() => {
    //Module is loading
    if (moduleData?.length === 0 || moduleData === undefined) {
      setLoading(true);
      setError(false);
      return;
    }

    //Context returned nothing because module wasn't found
    if (moduleData === null) {
      setError(true);
      setLoading(false);
      return;
    }

    //Update module if module was found
    setModule(moduleData);
    setError(false);
    setLoading(false);

    return () => {
      setModule({});
      setError(false);
      setLoading(true);
    };
  }, [moduleData]);

  //Tell the context to update with the new module (id is in the url)
  useLayoutEffect(() => {
    setContextModuleID(moduleID);

    return () => {
      setModule({});
      setError(false);
      setLoading(true);
    };
  }, [moduleID, setContextModuleID]);

  //TODO remove this with v0.5
  useEffect(() => {
    const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem(moduleID);

    if (Array.isArray(bookmarkedLocalStorageItem) && !bookmarkedLocalStorageItem?.compatibility) {
      localStorage.setItem(
        `repeatio-marked-${moduleID}`,
        JSON.stringify({
          id: moduleID,
          type: "bookmark",
          compatibility: packageJSON.version,
          questions: bookmarkedLocalStorageItem,
        })
      );
    }

    return () => {
      //second
    };
  }, [moduleID]);

  /*EVENTS*/
  //Train with all questions in chronological order
  const onChronologicalClick = () => {
    setFilteredQuestions(moduleData.questions);

    if (moduleData.questions !== undefined && moduleData.questions.length >= 1) {
      history.push({
        pathname: `/module/${moduleID}/question/${(module as IModule).questions[0].id}`,
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
  if (loading) {
    return (
      <div className='module-spinner' style={{ marginTop: "80px" }}>
        <Spinner />
      </div>
    );
  }

  if (error || Object.keys(module).length < 1) {
    return <ModuleNotFound />;
  }

  //JSX
  return (
    <div id={`module-${(module as IModule).id}`}>
      <SiteHeading title={`${(module as IModule).name} (${(module as IModule).id})`} />
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  //History
  let history = useHistory();

  //Params
  const { moduleID } = useParams<IParams>();

  //Context
  //TODO fix this
  const { setFilteredQuestions, moduleData } = useContext<any>(ModuleContext);

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
    //TODO
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

    //Get old saved questions from localStorage or provide empty array
    const bookmarkedLocalStorageItem = getBookmarkedLocalStorageItem(moduleID);

    //Get the ids from the bookmarked item or add empty array
    let updatedSavedQuestions = [...(bookmarkedLocalStorageItem?.questions || [])];

    //Add only ids that are in the module (as question ids) and only if not already in localStorage
    importedBookmarkedFile?.questions?.forEach((importedID) => {
      //Return if id of the imported saved questions is not in the module
      if (moduleData.questions?.findIndex((question: IQuestion) => question.id === importedID) === -1) {
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
    //TODO for electron get from filesystem

    //Get the bookmarked ids from the localStorage item
    const bookmarkedQuestionsIDs = getBookmarkedQuestionsFromModule(moduleID);

    //Return if no such element can be found
    if (bookmarkedQuestionsIDs === null || bookmarkedQuestionsIDs === undefined) {
      toast.warn("Found 0 bookmarked questions for this module!", {
        autoClose: 10000,
      });
      return;
    }

    //For each element in the bookmarked array return the question object
    //kinda expensive calculation (array in array) :/
    let bookmarkedQuestions: IQuestion[] = [];
    bookmarkedQuestionsIDs.forEach((item) => {
      const question = moduleData.questions.find((question: IQuestion) => question.id === item);
      //push question object to array if question is found
      if (question !== undefined) {
        bookmarkedQuestions.push(question);
      }
    });

    //Update the context
    setFilteredQuestions(bookmarkedQuestions);

    //Navigate to question component
    history.push({
      pathname: `/module/${moduleID}/question/${bookmarkedQuestions[0].id}`,
      search: "?mode=chronological",
    });
  };

  return (
    <>
      <ButtonElement key='saved-questions' buttonText='Start' handleClick={onBookmarkedQuestionsClick} />
      <PopoverButton handleClick={handlePopoverButtonClick} />
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem handleClick={handleBookmarkedDelete} text='Delete' icon={<BiTrash />} />
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
        <ImportBookmarkedQuestions handleChange={handleFileImportChange} />
      </PopoverMenu>
    </>
  );
};

const ImportBookmarkedQuestions = ({
  handleChange,
}: {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}) => {
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
