import { createContext, useMemo, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

//Functions
import isElectron from "is-electron";
import { fetchModuleFromPublicFolder } from "../../utils/fetchModuleFromPublicFolder.js";

//Create Question Context
export const ModuleContext = createContext([]);

//Provide the data to all children
export const ModuleProvider = (props) => {
  const [initialData, setInitialData] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [moduleContextID, setContextModuleID] = useState("");

  //Change every time module name changes
  const initialDataProvider = useMemo(() => ({ initialData, setInitialData }), [initialData, setInitialData]);

  const filterProvider = useMemo(
    () => ({ filteredQuestions, setFilteredQuestions }),
    [filteredQuestions, setFilteredQuestions]
  );

  //TODO move setFilteredQuestions/setInitialData into a callback

  //Get the module data from the localStorage of the browser
  const getDataFromBrowser = useCallback(async () => {
    let module;

    if (moduleContextID !== "types_1") {
      //Fetch data from the locale Storage
      try {
        module = JSON.parse(localStorage.getItem(`repeatio-module-${moduleContextID}`));
      } catch (error) {
        toast.warn(error.message);
      }
    } else {
      //Fetch data from public folder
      module = await fetchModuleFromPublicFolder();
    }

    //Set the data
    setInitialData(module);
    setFilteredQuestions(module?.questions);
  }, [moduleContextID]);

  //Get all Questions from the file system / locale storage and provide them
  useEffect(() => {
    if (moduleContextID === "") return;

    //Get the data from the locale file system when using the electron application else (when using the website) get the data from the public folder/browser storage
    if (isElectron()) {
      // Send a message to the main process
      window.api.request("toMain", ["getModule", moduleContextID]);

      // Called when message received from main process
      window.api.response("fromMain", (data) => {
        setInitialData(data);
        setFilteredQuestions(data.questions);
      });
    } else {
      //Not using electron
      getDataFromBrowser();
    }

    //Cleanup
    return () => {
      setInitialData([]);
      setFilteredQuestions([]);
    };
  }, [moduleContextID, getDataFromBrowser]);

  //Update the localStorage/filesystem if initialData changes
  useEffect(() => {
    //Don't update the storage if the data is undefined or from the public folder (id: types_1)
    if (initialData === undefined || initialData?.length < 1 || initialData?.id === "types_1") {
      return;
    }

    //Update filesystem (electron) or localStorage (website)
    if (isElectron()) {
      //TODO save to filesystem
    } else if (!isElectron()) {
      try {
        localStorage.setItem(`repeatio-module-${initialData.id}`, JSON.stringify(initialData, null, "\t"), {
          sameSite: "strict",
          secure: true,
        });
      } catch (error) {
        toast.warn(error.message);
      }
    }
  }, [initialData]);

  return (
    <ModuleContext.Provider
      value={{
        moduleData: initialDataProvider.initialData,
        setModuleData: initialDataProvider.setInitialData,
        setContextModuleID: setContextModuleID,
        filteredQuestions: filterProvider.filteredQuestions,
        setFilteredQuestions: filterProvider.setFilteredQuestions,
      }}
    >
      {props.children}
    </ModuleContext.Provider>
  );
};
