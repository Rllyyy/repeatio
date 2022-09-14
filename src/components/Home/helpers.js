export function moduleAlreadyInStorage({ value }) {
  //Get all keys from the localStorage
  const localStorageKeys = Object.keys(localStorage);

  //Return true if id already in localStorage
  return localStorageKeys.some((key) => key.includes("repeatio-module") && key.split("module-")[1] === value);
}

//Return module id by reading file content
export async function getModuleID({ file }) {
  const data = await file.text();
  const { id } = JSON.parse(data);
  return id;
}
