import { useState, useLayoutEffect, useEffect, useCallback } from "react";
import isElectron from "is-electron";
import { toast } from "react-toastify";

//Components
import { GridCards } from "../GridCards/GridCards";
import { Card, LinkElement } from "../Card/Card";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover";
import { Spinner } from "../Spinner/Spinner";
import { ProgressPie } from "../Card/ProgressPie";

//Icons
import { TbFileExport } from "react-icons/tb";
import { BiTrash } from "react-icons/bi";

//Functions
import { saveFile } from "../../utils/saveFile";
import { parseJSON } from "../../utils/parseJSON";
import { addExampleModuleToLocalStorage, isExampleModuleAdded } from "./helpers";

//Interfaces and Types
import { IModule } from "../module/module";
import { TSettings } from "../../utils/types";

//Component
export const Modules = () => {
  const { modules, loading } = useAllModules();
  const { handleExport, handleDelete, handlePopoverButtonClick, anchorEl, handlePopoverClose } = useHomePopover();

  //Display loading spinner while component loads
  //TODO switch to suspense maybe (react 18)

  //const MemoedIcon = useMemo(() => <ProgressPie progress={55} />, []);
  if (loading) {
    return <Spinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <GridCards>
      {modules?.map((module) => {
        const { id, name, questions } = module;
        return (
          <Card
            key={id}
            data-cy={`module-${id}`}
            type='module'
            title={`${name} (${id})`}
            description={`${questions?.length} Questions`}
            icon={<ProgressPie progress={55} />}
          >
            <LinkElement
              key={`card-link-${id}`}
              linkTo={{ pathname: `/module/${id}`, state: { name } }}
              linkAriaLabel={`View ${name}`}
              linkText='View'
            />
            <PopoverButton handleClick={handlePopoverButtonClick} target={id} />
          </Card>
        );
      })}
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem handleClick={handleDelete} text='Delete' icon={<BiTrash />} />
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} />
      </PopoverMenu>
    </GridCards>
  );
};

// Return the whole localStorage
const useAllModules = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<IModule[]>([]);

  //Get the modules from the localStorage and set the module state
  //Updates every time localeStorage changes
  const modulesFromBrowserStorage = useCallback(async () => {
    // Get settings from localStorage
    const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));

    // Add example module to localStorage if it isn't there and the user hasn't removed it (first ever render)
    if (!isExampleModuleAdded(settings)) {
      await addExampleModuleToLocalStorage(settings);
    }

    //Setup variables for the module
    let localStorageModules: IModule[] = [];

    Object.entries(localStorage).forEach((key) => {
      if (key[0].startsWith("repeatio-module")) {
        //Get item, transform to object, on error add to moduleErrors array
        try {
          const module = localStorage.getItem(key[0]);
          const moduleJSON = parseJSON<IModule>(module);
          if (moduleJSON !== undefined && moduleJSON !== null) {
            localStorageModules.push(moduleJSON);
          }
        } catch (error) {
          if (error instanceof Error) {
            toast.warn(`${key[0]}: ${error.message}`);
          }
        }
      }
    });

    //Update states
    setModules(localStorageModules);
    setLoading(false);
  }, []);

  //Refetch the modules if the localeStorage changes
  const onStorageChange = useCallback(() => {
    modulesFromBrowserStorage();
  }, [modulesFromBrowserStorage]);

  //Fetch data for all modules by reading all repeatio files in documents folder / locale storage (in browser)
  useEffect(() => {
    if (isElectron()) {
      // Send a message to the main process
      (window as any).api.request("toMain", ["getModules"]);

      // Called when message received from main process
      (window as any).api.response("fromMain", (data: IModule[]) => {
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

  return { modules, loading };
};

//Hook to use the functions inside the Popover component
const useHomePopover = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  //Reset anchor if component unmounts
  useLayoutEffect(() => {
    return () => {
      setAnchorEl(null);
    };
  }, []);

  //Set the anchor
  const handlePopoverButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  //Reset the anchor
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  //Handle deletion of module
  const handleDelete = () => {
    //Get id of module by custom attribute
    const moduleID = anchorEl?.getAttribute("data-target");

    //Prevent deletion if using electron
    if (isElectron()) {
      toast.warn("Can't delete modules from electron!");
      handlePopoverClose();
      return;
    }

    //Check if item is in localStorage
    const itemInStorage = Object.keys(localStorage).includes(`repeatio-module-${moduleID}`);

    //Remove item from localStorage if it is present and dispatch event or show error
    if (itemInStorage) {
      localStorage.removeItem(`repeatio-module-${moduleID}`);
      toast.success(`Deleted module ${moduleID}!`);
      window.dispatchEvent(new Event("storage"));
    } else {
      toast.error(`Couldn't find the file repeatio-module-${moduleID} in the localStorage!`);
    }
    handlePopoverClose();
  };

  //Handle the export of module
  const handleExport = async () => {
    //Return if using electron
    if (isElectron()) {
      toast.warning("This action is not supported in Electron!");
      handlePopoverClose();
      return;
    }

    //Get id of the module from the button
    const moduleID = anchorEl?.getAttribute("data-target");
    const file = localStorage.getItem(`repeatio-module-${moduleID}`);

    if (file) {
      await saveFile({ file: file, name: `repeatio-module-${moduleID}` });
    } else {
      //Notify user and log error if file isn't found
      toast.error(`Couldn't find the file repeatio-module-${moduleID} in the localStorage!`);
    }

    handlePopoverClose();
  };

  return { handleExport, handleDelete, handlePopoverButtonClick, anchorEl, handlePopoverClose };
};
