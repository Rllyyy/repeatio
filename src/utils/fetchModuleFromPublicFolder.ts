import { IModule } from "../components/module/module";

//Fetch the module from the public folder
export async function fetchModuleFromPublicFolder(signal: AbortSignal): Promise<IModule | undefined> {
  try {
    const res = await fetch("/data.json", { mode: "no-cors", signal });

    if (res.ok) {
      const data: IModule = await res.json();
      return data;
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || res.statusText);
    }
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error(error.message);
    }
  }
}
