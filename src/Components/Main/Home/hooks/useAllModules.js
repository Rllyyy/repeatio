import { useState, useEffect, useCallback } from "react";

//Functions
import isElectron from "is-electron";
import fetchModuleFromPublicFolder from "../../../../functions/fetchModuleFromPublicFolder.js";

// Return the whole localStorage
const useAllModules = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [errors, setErrors] = useState([]);

  //Get the modules from the localStorage and set the module state
  //Updates every time localeStorage changes
  const modulesFromBrowserStorage = useCallback(async () => {
    //Setup variables for the module and possible errors
    let localStorageModules = [];
    let moduleErrors = [];

    Object.entries(localStorage).forEach((key) => {
      if (key[0].startsWith("repeatio-module")) {
        //Get item, transform to object, on error add to moduleErrors array
        try {
          const module = localStorage.getItem(key[0]);
          localStorageModules.push(JSON.parse(module));
        } catch (error) {
          console.warn(`${key[0]}: ${error.message}`);
          moduleErrors.push(`${key[0]}: ${error.message}`);
        }
      }
    });

    //get the data from the public folder (types_1)
    const dataFromPublicFolder = await fetchModuleFromPublicFolder();

    //When able to fetch the data from the public folder, combine them else just show localStorage.
    //This is useful for when the user is offline
    if (dataFromPublicFolder !== undefined) {
      setModules([...localStorageModules, dataFromPublicFolder]);
    } else {
      setModules(localStorageModules);
    }

    //Update states
    setErrors(moduleErrors);
    setLoading(false);
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

  return { modules, loading, errors };
};

export default useAllModules;
