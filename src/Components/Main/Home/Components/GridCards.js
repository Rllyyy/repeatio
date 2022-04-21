import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import isElectron from "is-electron";
//import "../Home.css";

import Spinner from "../../../SharedComponents/Spinner/Spinner.js";
import ProgressPie from "./ProgressPie.js";

//Icons
import { BsPlusCircle } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";

const GridCards = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  //Get the modules from the localStorage and set the module state
  //Updates every time localeStorage changes
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

  const inputOnChange = async (e) => {
    try {
      const [file] = e.target.files;
      if (!file) return;
      const data = await file.text();

      //Update localeStorage and tell the window that a new storage event occurred
      localStorage.setItem(`repeatio-module-${JSON.parse(data).id}`, data, { sameSite: "strict", secure: true });
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error(error);
    }
  };

  //Display loading spinner while component loads
  if (loading) {
    return <Spinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <div className='grid-cards'>
      {modules.map((module) => {
        const { id, name, questions } = module;
        return (
          <article className='card' key={id}>
            <div className='title-info'>
              <h2 className='card-title'>
                {name} ({id})
              </h2>
              {/* <p className='card-description'>{description}</p> */}
              <p className='card-total-questions'>{questions.length} Questions</p>
            </div>
            <ProgressPie progress={55} />
            <div className='card-bottom'>
              {/* //!URL might not work with special characters (äöß/#....) */}
              <Link to={`/module/${id}`} className='view-button'>
                <span>VIEW</span>
                <IoIosArrowForward className='view-svg' />
              </Link>
            </div>
          </article>
        );
      })}
      <div className='card-add'>
        <label htmlFor='file-upload' className='custom-file-upload'>
          <BsPlusCircle className='card-add-circle' />
          <h3>Add Module</h3>
        </label>
        <input className='file-input' id='file-upload' type='file' accept='.json' onChange={(e) => inputOnChange(e)} />
      </div>
    </div>
  );
};

export default GridCards;
