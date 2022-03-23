import { createContext, useMemo, useState, useEffect, useCallback } from "react";
import isElectron from "is-electron";
import path from "path";

//Create Question Context
export const ModuleContext = createContext([]);

//Provide the data to all children
export const ModuleProvider = (props) => {
  const [initialData, setInitialData] = useState([]);
  const [moduleContextID, setContextModuleID] = useState("");

  //provide a state a pass it when it changes, rerender the context

  //Change every time module name changes
  const providerValue = useMemo(() => ({ initialData, setInitialData }), [initialData, setInitialData]);

  const getDataFromBrowser = useCallback(async () => {
    //Fetch data from public folder
    let dataFromPublic;
    try {
      const data = await fetch(path.join(__dirname, "data.json"), { mode: "no-cors" });
      dataFromPublic = await data.json();
    } catch (error) {
      console.log(error);
    }

    //Fetch data from the locale Storage
    let storageModules = [];
    Object.entries(localStorage).forEach((key) => {
      if (key[0].startsWith("repeatio")) {
        const test = localStorage.getItem(key[0]);
        storageModules.push(JSON.parse(test));
      }
    });

    //Combine the data from the public folder and the locale storage
    const modules = [...storageModules, dataFromPublic];

    //Find the correct module with the contextID
    const correctModule = modules.find((module) => module.id === moduleContextID);

    //Set the data
    setInitialData(correctModule);
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
      });
    } else {
      //Not using electron
      getDataFromBrowser();
    }

    //Cleanup
    return () => {
      setInitialData([]);
    };
  }, [moduleContextID, getDataFromBrowser]);

  return (
    <ModuleContext.Provider value={{ moduleData: providerValue.initialData, setContextModuleID: setContextModuleID }}>
      {props.children}
    </ModuleContext.Provider>
  );
};
