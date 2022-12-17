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
