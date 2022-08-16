import { useState, useLayoutEffect, useEffect, useCallback } from "react";
import { saveAs } from "file-saver";
import isElectron from "is-electron";
import fetchModuleFromPublicFolder from "../../../../functions/fetchModuleFromPublicFolder.js";

//Components
import { Card, LinkElement } from "../../../SharedComponents/Card/Card.js";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../../../SharedComponents/Card/Popover.jsx";
import Spinner from "../../../SharedComponents/Spinner/Spinner.js";
import ProgressPie from "../../../SharedComponents/Card/Components/ProgressPie.jsx";

//Icons
import { TbFileExport } from "react-icons/tb";

//Component
const GridCards = () => {
  const { modules, loading } = useAllModules();
  const { handleExport, handlePopoverButtonClick, anchorEl, handlePopoverClose } = useHomePopover();

  //Display loading spinner while component loads
  //TODO switch to suspense maybe (react 18)

  if (loading) {
    return <Spinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <div className='grid-cards'>
      {modules?.map((module) => {
        const { id, name, questions, disabled } = module;
        return (
          <Card
            key={id}
            data-cy={`module-${id}`}
            disabled={disabled}
            type='module'
            title={`${name} (${id})`}
            description={`${questions?.length} Questions`}
            icon={<ProgressPie progress={55} />}
          >
            <LinkElement
              key={`card-link-${id}`}
              linkTo={`/module/${id}`}
              linkAriaLabel={`View ${name}`}
              linkText='View'
            />
            <PopoverButton handleClick={handlePopoverButtonClick} target={id} />
          </Card>
        );
      })}
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
      </PopoverMenu>
    </div>
  );
};

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

//Hook to use the functions inside the Popover component
const useHomePopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  //Reset anchor if component unmounts
  useLayoutEffect(() => {
    return () => {
      setAnchorEl(null);
    };
  }, []);

  const handlePopoverButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async () => {
    //Return if using electron
    if (isElectron()) {
      console.warn("Action is not supported in Electron!");
      return;
    }

    //Get id of the module from the button
    const moduleID = anchorEl.getAttribute("data-target");
    let file;

    if (moduleID !== "types_1") {
      //Get module item from localStorage
      file = localStorage.getItem(`repeatio-module-${moduleID}`);
    } else {
      const publicModule = await fetchModuleFromPublicFolder();
      file = JSON.stringify(publicModule, null, "\t");
    }

    if (!file) {
      console.error(`Couldn't find file: repeatio-module-${moduleID}`);
      handlePopoverClose();
      return;
    }

    //Cypress doesn't support the filePicker API
    if (window.Cypress) {
      const blob = new Blob([file], { type: "application/json" });
      saveAs(blob, `repeatio-module-${moduleID}.json`);
      handlePopoverClose();
      return;
    }

    //showSaveFilePicker only works with Chrome/Edge/Opera
    try {
      // https://web.dev/file-system-access/
      const fileHandle = await window.showSaveFilePicker({ suggestedName: `repeatio-module-${moduleID}.json` });
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable();
      // Write the content of the file to the stream.
      await writable.write(file);
      // Close the file and write the contents to disk.
      await writable.close();
    } catch (e) {
      //If fileHandle isn't supported, use save-as library and catch aborted error
      if (e.name === "TypeError") {
        const blob = new Blob([file], { type: "application/json" });
        saveAs(blob, `repeatio-module-${moduleID}.json`);
      } else if (e.name !== "AbortError") {
        console.warn(e.message);
      }
    }

    handlePopoverClose();
  };

  return { handleExport, handlePopoverButtonClick, anchorEl, handlePopoverClose };
};

export default GridCards;
