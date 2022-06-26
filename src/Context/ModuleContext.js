import { createContext, useMemo, useState, useEffect, useCallback } from "react";
import isElectron from "is-electron";

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

  // Callback
  //All questions
  const getDataFromBrowser = useCallback(async () => {
    //Fetch data from public folder
    let dataFromPublic;
    try {
      const data = await fetch("data.json", { mode: "no-cors" });
      dataFromPublic = await data.json();
    } catch (error) {
      console.log(error);
    }

    //Fetch data from the locale Storage
    let storageModules = [];
    Object.entries(localStorage).forEach((key) => {
      if (key[0].startsWith("repeatio-module")) {
        const repeatioModule = localStorage.getItem(key[0]);
        storageModules.push(JSON.parse(repeatioModule));
      }
    });

    //Combine the data from the public folder and the locale storage
    const modules = [...storageModules, dataFromPublic];

    //Find the correct module with the contextID
    const correctModule = modules.find((module) => module.id === moduleContextID);

    //Set the data
    setInitialData(correctModule);
    setFilteredQuestions(correctModule.questions);
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
    if (initialData === undefined || initialData.length < 1 || initialData.id === "types_1") {
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
        console.warn(error.message);
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
