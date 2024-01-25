import { saveAs } from "file-saver";
import { toast } from "react-toastify";

export type TSaveFile = {
  file: string;
  name: string;
  showSuccessToast?: boolean;
};

//Download a file as json to user selected location or downloads folder
export async function saveFile({ file, name, showSuccessToast = true }: TSaveFile) {
  //Cypress doesn't support the filePicker API
  if ((window as any).Cypress) {
    const blob = new Blob([file], { type: "application/json" });
    saveAs(blob, `${name}.json`);

    if (showSuccessToast) toast.success(`Downloaded module as "${name}.json"`);
    return;
  }

  //Use the FilePicker api to allow the user to choose a location, if it is not supported use saveAs library
  // https://web.dev/file-system-access/
  //TODO currently using @types/wicg-file-system-access for showSaveFilePicker because there is currently no native Typescript support (see: https://stackoverflow.com/questions/71309058/property-showsavefilepicker-does-not-exist-on-type-window-typeof-globalthis)
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
    if (showSuccessToast) toast.success(`Downloaded module as "${name}.json"`);
  } catch (e) {
    if (e instanceof Error) {
      //If fileHandle isn't supported (firefox/safari/mobile), use save-as library and catch aborted error
      //compatibility: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle#browser_compatibility
      if (e.name === "TypeError") {
        const blob = new Blob([file], { type: "application/json" });
        saveAs(blob, `${name}.json`);
        if (showSuccessToast) toast.success(`Downloaded module as "${name}.json"`);
      } else if (e.name !== "AbortError") {
        toast.warn(e.message);
      }
    }
  }
}
