import { toast } from "react-toastify";

//Fetch the module from the public folder
export async function fetchModuleFromPublicFolder() {
  try {
    const data = await fetch("/data.json", { mode: "no-cors" });

    const toJsObject = await data.json();

    if (data.ok) {
      return toJsObject;
    } else {
      toast.warn(toJsObject.message || toJsObject.statusText);
      return;
    }
  } catch (error) {
    console.warn(error.message);
    return;
  }
}
