import isElectron from "is-electron";
import { fetchModuleFromPublicFolder } from "../../utils/fetchModuleFromPublicFolder";
import { fetchModuleFromFileSystem } from "../../utils/fetchModuleFromFileSystem";
import { parseJSON } from "../../utils/parseJSON";
import { toast } from "react-toastify";

// Interfaces + types
import { IModule } from "../module/module";
import { IFile } from "./ImportModule";
import { TSettings } from "../../utils/types";
import { TModuleSortOption } from "./ModuleSortButton";

/**
 * Gets an array of all modules stored in the browser's local storage.
 *
 * @returns An array of IModule objects.
 */
export function getLocalStorageModules() {
  return Object.keys(localStorage).reduce((accumulator: IModule[], key) => {
    // Modules are identified by keys that start with "repeatio-module".
    if (key.startsWith("repeatio-module")) {
      try {
        // Get module from localStorage
        const module = localStorage.getItem(key);
        const moduleJSON = parseJSON<IModule>(module);

        // Add the parsed module to the accumulator array if it isn't undefined or null
        if (moduleJSON !== undefined && moduleJSON !== null) {
          accumulator.push(moduleJSON);
        } else {
          throw new Error("Couldn't parse module as it is undefined or null");
        }
      } catch (error) {
        if (error instanceof Error) {
          // Show toast on error
          toast.error(`${key}: ${error.message}`);
        }
      }
    }
    return accumulator;
  }, []);
}
/**

Sorts an array of IModule objects based on the provided sort option.
@param localStorageModules - The array of IModule objects to be sorted.
@param sort - The sort option to use.
@throws {Error} if the provided sort value is invalid.
@returns A sorted array of IModule objects.
*/
export function sortLocalStorageModules(localStorageModules: IModule[], sort: TModuleSortOption) {
  switch (sort) {
    case "Name (ascending)":
      return localStorageModules.sort((a, b) => a.name.localeCompare(b.name));
    case "Name (descending)":
      return localStorageModules.sort((a, b) => a.name.localeCompare(b.name)).reverse();
    case "ID (ascending)":
      return localStorageModules.sort((a, b) => a.id.localeCompare(b.id));
    case "ID (descending)":
      return localStorageModules.sort((a, b) => a.id.localeCompare(b.id)).reverse();
    default:
      throw new Error("Provided sort value is invalid");
  }
}

/**
 * Checks if the 'addedExampleModule' property is present in the 'repeatio-settings' object stored in local storage.
 * @param {TSettings | null | undefined} settings - The current settings object retrieved from local storage.
 * @returns {boolean} Returns true if the 'addedExampleModule' property is present in the 'repeatio-settings' object, otherwise false.
 */
export function isExampleModuleAdded(settings: TSettings | null | undefined): boolean {
  // Check if the parsed settings object is truthy and if the 'addedExampleModule' property is truthy
  // Return true if both conditions are met, otherwise false
  return !!settings && !!settings.addedExampleModule;
}

/**
 * Adds the example module data to local storage and updates the settings to indicate that the module has been added.
 * @param {TSettings | null | undefined} settings - The current settings object retrieved from local storage.
 */
export async function addExampleModuleToLocalStorage(settings: TSettings | null | undefined, signal: AbortSignal) {
  // Fetch the example module data from the public folder
  let exampleModuleData: IModule | undefined;

  if (isElectron()) {
    exampleModuleData = await fetchModuleFromFileSystem();
  } else {
  }

  exampleModuleData = await fetchModuleFromPublicFolder(signal);
  // Check if the example module data was retrieved successfully
  if (exampleModuleData) {
    // Update the localStorage with the module data
    localStorage.setItem(`repeatio-module-${exampleModuleData.id}`, JSON.stringify(exampleModuleData, null, "\t"));

    // Update the settings in localStorage to indicate that the example module has been added
    localStorage.setItem(`repeatio-settings`, JSON.stringify({ ...settings, addedExampleModule: true }, null, "\t"));
  }
}

type TGetFilesWithId<T> = {
  acceptedFiles: T[];
  files: IFile[];
};

/**
 * Retrieves files with their corresponding IDs.
 *
 * @template T - The type of the accepted files.
 * @param {TGetFilesWithId<T>} options - The options for getting files with IDs.
 * @returns {Promise<IFile[]>} - A promise that resolves to an array of files with IDs.
 */
export async function getFilesWithId<T extends File>({ acceptedFiles, files }: TGetFilesWithId<T>): Promise<IFile[]> {
  let acceptedFilesWithID: IFile[] = [];
  //Loop through accepted files to add id prop to file and add warning if module is already in storage
  for await (const acceptedFile of acceptedFiles) {
    //get id and type from the file
    const fileTypeAndID = await getFileTypeAndID(acceptedFile);
    //await new Promise((resolve) => setTimeout(resolve, 10000));

    //Check if the imported file is a bookmark file and show error if so
    if (fileTypeAndID.fileType === "marked" || fileTypeAndID.fileType === "bookmark") {
      toast.error(
        `Failed to import the bookmarked questions for "${fileTypeAndID.id}"! Navigate to the module and click import inside the 3 dots found at 'Bookmarked Questions' to import bookmarked Questions!`,
        { autoClose: 12000 }
      );
      continue;
    }

    //Check if file is a old repeatio version
    if (!fileTypeAndID.id) {
      toast.error("The version of this file is incompatible with this version of repeatio! ", { autoClose: 12000 });
      continue;
    }

    //Combine the imported file with the information from inside (id and type)
    let newFile: IFile = Object.assign(acceptedFile, fileTypeAndID);

    //This doesn't work if the user import the same file (but with a different name) at the same time but this isn't really a problem as it will be added to the storage only once (edge case)
    if (!files.find((file) => file.id === newFile.id)) {
      //Check Storage if the file is already in the localStorage
      if (moduleAlreadyInStorage(newFile.id)) {
        newFile = Object.assign(newFile, { alreadyExistInLS: true });
      }
      acceptedFilesWithID.push(newFile);
    } else {
      toast.error(`A file with the same ID (${newFile.id}) is already in your imports! Remove it, to add this file!`);
    }
  }

  return acceptedFilesWithID;
}

/**
 * Checks if a module with the specified ID already exists in the localStorage.
 *
 * @param value - The ID of the module to check.
 * @returns `true` if the module with the specified ID exists in the localStorage, `false` otherwise.
 */
export function moduleAlreadyInStorage(value: string) {
  //Get all keys from the localStorage
  const localStorageKeys = Object.keys(localStorage);

  //Return true if id already in localStorage
  return localStorageKeys.some((key) => key.includes("repeatio-module") && key.split("module-")[1] === value);
}

/**
 * Return module id and type as object by reading file content
 * @param file
 * @returns - {id, type?}
 */
async function getFileTypeAndID(file: File): Promise<Pick<IFile, "id" | "fileType">> {
  const data = await file.text();
  const { id, type } = JSON.parse(data);

  //Always return id, only type if not undefined
  return { id, ...(type !== undefined ? { fileType: type } : undefined) };
}
