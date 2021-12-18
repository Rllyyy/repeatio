import { createContext, useMemo, useState, useEffect } from "react";
const path = require("path");
const isElectron = require("is-electron");

//Create Question Context
export const QuestionContext = createContext([]);

//Provide the data to all children
export const QuestionProvider = (props) => {
  const [initialData, setInitialData] = useState([]);

  //Change every time module name changes
  const providerValue = useMemo(() => ({ initialData, setInitialData }), [initialData, setInitialData]);

  //Get all Questions from the file system and provide them
  useEffect(() => {
    //Get the data from the locale file system when using the electron application else (when using the website) get the data from the public folder/browser storage
    if (isElectron()) {
      // Send a message to the main process
      window.api.request("toMain", "getQuestion");

      // Called when message received from main process
      window.api.response("fromMain", (data) => {
        setInitialData(data);
      });
    } else {
      fetch(path.join(__dirname, "data.json"), { mode: "no-cors" })
        .then((res) => res.json())
        .then((jsonResponse) => setInitialData(jsonResponse));
    }

    //Cleanup
    return () => {
      setInitialData([]);
    };
  }, []);

  return <QuestionContext.Provider value={providerValue.initialData}>{props.children}</QuestionContext.Provider>;
};
