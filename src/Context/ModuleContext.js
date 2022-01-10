import { createContext, useMemo, useState, useEffect } from "react";
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
      //Fetch data from public folder
      //TODO read from localeStorage and switch to async/await
      fetch(path.join(__dirname, "data.json"), { mode: "no-cors" })
        .then((res) => res.json())
        .then((resJSON) => resJSON.find((module) => module.id === moduleContextID))
        .then((resFiltered) => setInitialData(resFiltered));
    }

    //Cleanup
    return () => {
      setInitialData([]);
    };
  }, [moduleContextID]);

  return <ModuleContext.Provider value={{ moduleData: providerValue.initialData, setContextModuleID: setContextModuleID }}>{props.children}</ModuleContext.Provider>;
};
