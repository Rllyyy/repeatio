import { useState, useLayoutEffect, useEffect } from "react";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";

//Components
import { GridCards } from "../GridCards/GridCards";
import { Card, LinkElement } from "../Card/Card";
import { PopoverButton, PopoverMenu, PopoverMenuItem } from "../Card/Popover";
import { CircularTailSpinner } from "../Spinner";
import { ProgressPie } from "../Card/ProgressPie";
import { ModuleEditor } from "../ModuleEditor";

//Icons
import { TbFileExport } from "react-icons/tb";
import { BiTrash } from "react-icons/bi";
import { MdOutlineEdit } from "react-icons/md";

//Functions
import { saveFile } from "../../utils/saveFile";
import { parseJSON } from "../../utils/parseJSON";
import {
  addExampleModuleToLocalStorage,
  getLocalStorageModules,
  isExampleModuleAdded,
  sortLocalStorageModules,
} from "./helpers";

//Interfaces and Types
import { IModule } from "../module/module";
import { TSettings } from "@hooks/useSetting";
import { TModuleSortOption } from "./ModuleSortButton";
import { DeleteConfirmationModal } from "@components/CustomModal/DeleteConfirmationModal";

interface IModules {
  sort: TModuleSortOption;
}
//Component
export const Modules: React.FC<IModules> = ({ sort }) => {
  const { modules, loading } = useAllModules(sort);
  const {
    handleExport,
    handleDelete,
    handlePopoverButtonClick,
    anchorEl,
    handlePopoverClose,
    showModuleEditor,
    handleOpenEditor,
    setShowModuleEditor,
    setShowDeletionConfirmModal,
    showDeletionConfirmModal,
  } = useHomePopover();

  //Display loading spinner while component loads
  //TODO switch to suspense maybe (react 18)

  if (loading) {
    return <CircularTailSpinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <GridCards>
      <AnimatePresence initial={false}>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              <LinkElement
                key={`card-link-${id}`}
                linkTo={`/module/${id}`}
                state={{ name }}
                linkAriaLabel={`View ${name}`}
                linkText='View'
              />
              <PopoverButton handleClick={handlePopoverButtonClick} target={id} />
            </Card>
          );
        })}
      </AnimatePresence>
      <PopoverMenu anchorEl={anchorEl} handlePopoverClose={handlePopoverClose}>
        <PopoverMenuItem
          handleClick={() => {
            setShowDeletionConfirmModal(anchorEl?.getAttribute("data-target"));
            handlePopoverClose();
          }}
          text='Delete'
          icon={<BiTrash />}
          aria-label='Delete Module'
        />
        <PopoverMenuItem handleClick={handleOpenEditor} text='Edit' icon={<MdOutlineEdit />} aria-label='Edit Module' />
        <PopoverMenuItem handleClick={handleExport} text='Export' icon={<TbFileExport />} aria-label='Export Module' />
      </PopoverMenu>
      <ModuleEditor
        mode='edit'
        moduleId={showModuleEditor}
        showModal={!!showModuleEditor}
        handleModalClose={() => setShowModuleEditor(null)}
        navigateOnSuccess={false}
      />
      <DeleteConfirmationModal
        showModal={!!showDeletionConfirmModal}
        title='Delete Module?'
        message='Are you sure you want to delete this Module? This action cannot be undone.'
        deleteButtonText='Delete Module'
        onConfirmDelete={() => handleDelete({ moduleID: showDeletionConfirmModal })}
        handleCloseModal={() => setShowDeletionConfirmModal(null)}
      />
    </GridCards>
  );
};

// Return the whole localStorage
const useAllModules = (sort: TModuleSortOption) => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<IModule[]>([]);

  //Get the modules from the localStorage, set and sort the module state
  //Updates every time localeStorage changes
  useEffect(() => {
    // Define abort controller
    const controller = new AbortController();
    const { signal } = controller;

    const onStorageChange = async () => {
      const settings = parseJSON<TSettings>(localStorage.getItem("repeatio-settings"));

      // Add example module to localStorage if it isn't there and the user hasn't removed it (first ever render)
      if (!isExampleModuleAdded(settings)) {
        await addExampleModuleToLocalStorage(settings, signal);
      }

      //Setup variables for the module
      const localStorageModules: IModule[] = getLocalStorageModules();

      const sortedLocalStorageModules = sortLocalStorageModules(localStorageModules, sort);

      //Update states
      setModules(sortedLocalStorageModules);
      setLoading(false);
    };

    onStorageChange();
    window.addEventListener("storage", onStorageChange);

    //Reset the modules, remove the handler and send abort signal when the component unmounts
    return () => {
      setModules([]);
      setLoading(true);
      window.removeEventListener("storage", onStorageChange);
      controller.abort();
    };
  }, [sort]);

  return { modules, loading };
};

//Hook to use the functions inside the Popover component
const useHomePopover = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showModuleEditor, setShowModuleEditor] = useState<IModule["id"] | null>(null);
  const [showDeletionConfirmModal, setShowDeletionConfirmModal] = useState<IModule["id"] | null | undefined>(null);

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
  const handleDelete = ({ moduleID }: { moduleID: IModule["id"] | undefined | null }) => {
    //Get id of module by custom attribute
    //const moduleID = anchorEl?.getAttribute("data-target");

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
    setShowDeletionConfirmModal(null);
  };

  //Handle the export of module
  const handleExport = async () => {
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

  // Handle opening of module editor
  const handleOpenEditor = () => {
    // Close popover
    handlePopoverClose();

    // Get module id update showModuleEditor state to id
    const moduleID = anchorEl?.getAttribute("data-target");
    if (typeof moduleID === "undefined") return;
    setShowModuleEditor(moduleID);
  };

  return {
    handleExport,
    handleDelete,
    handlePopoverButtonClick,
    anchorEl,
    handlePopoverClose,
    showModuleEditor,
    setShowModuleEditor,
    handleOpenEditor,
    showDeletionConfirmModal,
    setShowDeletionConfirmModal,
  } as const;
};
