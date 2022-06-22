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

  //TODO move setFilteredQuestions/setInitialData into a calllback

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

  useEffect(() => {
    if (initialData === undefined || initialData.length < 1) {
      return;
    }

    if (isElectron()) {
      //TODO save to filesystem
    } else {
      try {
        localStorage.setItem(`repeatio-module-${initialData.id}`, JSON.stringify(initialData, null, "\t"), {
          sameSite: "strict",
          secure: true,
        });
      } catch (error) {
        console.warn(error.message);
      }
    }

    // console.log(JSON.stringify(initialData, null, "\t"));

    // JSON.stringify(outPut, null, "\t");

    /* localStorage.setItem(`repeatio-module-${JSON.parse(initialData).id}`, initialData, {
      sameSite: "strict",
      secure: true,
    }); */
    //console.log(initialData);

    /* return () => {
      second
    } */
  }, [initialData]);

  //or initialDataProvider.initialData??

  /* 
  1. On Mount an moduleContextID provide data
  2. On initialData change, update the context and reset filtered Questions
  
  
  */

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
