import { createContext, useMemo, useState, useEffect } from "react";
const path = require("path");

//Create Question Context
export const QuestionContext = createContext([]);

//Provide the data to all children
export const QuestionProvider = (props) => {
  const [initialData, setInitialData] = useState([]);

  //Change every time module name changes
  const providerValue = useMemo(() => ({ initialData, setInitialData }), [initialData, setInitialData]);

  //Get all Questions from the file system and provide them
  useEffect(() => {
    let canReadThroughIPC = true;
    try {
      // Send a message to the main process
      window.api.request("toMain", "getQuestion");

      // Called when message received from main process
      window.api.response("fromMain", (data) => {
        setInitialData(data);
      });
    } catch (error) {
      canReadThroughIPC = false;
    }

    //TODO: Read the data from the public folder (future maybe from localeStorage) and not through ipc
    if (!canReadThroughIPC) {
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
