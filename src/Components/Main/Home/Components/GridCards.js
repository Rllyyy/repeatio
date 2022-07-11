import React, { useState, useEffect, useCallback } from "react";
import isElectron from "is-electron";

//Components
import Card from "../../../SharedComponents/Card/Card.js";
import Spinner from "../../../SharedComponents/Spinner/Spinner.js";
import ProgressPie from "../../../SharedComponents/Card/Components/ProgressPie.jsx";

const GridCards = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  //Get the modules from the localStorage and set the module state
  //Updates every time localeStorage changes
  //TODO getting the public folder is blocking the function on no internet connection
  const modulesFromBrowserStorage = useCallback(async () => {
    //The question types folder from the public folder needs to be combined
    //with every module from the locale storage

    try {
      //Get the data from the public folder
      const publicFolder = await fetch("data.json", { mode: "no-cors" });
      const resJSON = await publicFolder.json();

      //Get modules from the localStorage
      let storageModules = [];
      Object.entries(localStorage).forEach((key) => {
        if (key[0].startsWith("repeatio-module")) {
          const module = localStorage.getItem(key[0]);
          storageModules.push(JSON.parse(module));
        }
      });

      //Update the state
      setModules([...storageModules, resJSON]);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  //Refetch the modules if the localeStorage changes
  const onStorageChange = useCallback(() => {
    setLoading(true);
    modulesFromBrowserStorage();
  }, [modulesFromBrowserStorage]);

  //Fetch data for all modules by reading all repeatio files in documents folder / locale storage (in browser)
  useEffect(() => {
    if (isElectron()) {
      // Send a message to the main process
      window.api.request("toMain", ["getModules"]);

      // Called when message received from main process
      window.api.response("fromMain", (data) => {
        setModules(data);
        setLoading(false);
      });
    } else {
      //Get modules from localStorage and add storage onChange handler
      modulesFromBrowserStorage();
      window.addEventListener("storage", onStorageChange);
    }

    //Reset the modules and remove the handler when the component unmounts
    return () => {
      setModules([]);
      setLoading(true);
      if (!isElectron()) window.removeEventListener("storage", onStorageChange);
    };
  }, [modulesFromBrowserStorage, onStorageChange]);

  //Display loading spinner while component loads
  //TODO switch to suspense maybe (react 18)
  if (loading) {
    return <Spinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <div className='grid-cards'>
      {modules.map((module) => {
        const { id, name, questions, disabled } = module;
        return (
          <Card
            key={id}
            disabled={disabled}
            type='module'
            title={`${name} (${id})`}
            description={`${questions.length} Questions`}
            icon={<ProgressPie progress={55} />}
            leftBottom={{
              type: "link",
              linkTo: `/module/${id}`,
              linkAriaLabel: `View ${name}`,
              linkText: "View",
            }}
          />
        );
      })}
    </div>
  );
};

export default GridCards;
