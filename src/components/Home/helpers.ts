import { fetchModuleFromPublicFolder } from "../../utils/fetchModuleFromPublicFolder";
import { TSettings } from "../../utils/types";
import { IFile } from "./ImportModule";

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
export async function getFileTypeAndID(file: File): Promise<Pick<IFile, "id" | "fileType">> {
  const data = await file.text();
  const { id, type } = JSON.parse(data);

  //Always return id, only type if not undefined
  return { id, ...(type !== undefined ? { fileType: type } : undefined) };
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
export async function addExampleModuleToLocalStorage(settings: TSettings | null | undefined) {
  // Fetch the example module data from the public folder
  const exampleModuleData = await fetchModuleFromPublicFolder();

  // Check if the example module data was retrieved successfully
  if (exampleModuleData) {
    // Update the localStorage with the module data
    localStorage.setItem(`repeatio-module-${exampleModuleData.id}`, JSON.stringify(exampleModuleData, null, "\t"));

    // Update the settings in localStorage to indicate that the example module has been added
    localStorage.setItem(`repeatio-settings`, JSON.stringify({ ...settings, addedExampleModule: true }, null, "\t"));
  }
}
