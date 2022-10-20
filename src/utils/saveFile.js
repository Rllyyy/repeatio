import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import isElectron from "is-electron";

//Download a file as json to user selected location or downloads folder
export async function saveFile({ file, name }) {
  //Cypress/Electron don't support the filePicker API
  if (window.Cypress || isElectron()) {
    const blob = new Blob([file], { type: "application/json" });
    saveAs(blob, `${name}.json`);
    toast.success(`Downloaded module as "${name}.json"`);
    return;
  }

  //Use the FilePicker api to allow the user to choose a location, if it is not supported use saveAs library
  // https://web.dev/file-system-access/
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `${name}.json`,
      types: [{ description: "JSON File", accept: { "application/json": [".json"] } }],
    });
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the content of the file to the stream.
    await writable.write(file);
    // Close the file and write the contents to disk.
    await writable.close();
    toast.success(`Downloaded module as "${fileHandle.name}"`);
  } catch (e) {
    //If fileHandle isn't supported (firefox/safari/mobile), use save-as library and catch aborted error
    //compatibility: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle#browser_compatibility
    if (e.name === "TypeError") {
      const blob = new Blob([file], { type: "application/json" });
      saveAs(blob, `${name}.json`);
      toast.success(`Downloaded module as "${name}.json"`);
    } else if (e.name !== "AbortError") {
      toast.warn(e.message);
    }
  }
}
