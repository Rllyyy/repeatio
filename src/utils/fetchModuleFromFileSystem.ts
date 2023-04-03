import { IModule } from "../components/module/module";

// Fetches the example module from the file system when using electron
export async function fetchModuleFromFileSystem() {
  try {
    await requestMainProcess();

    let dataFromProcess: IModule | undefined;

    // Wait for the response from the main process
    await receiveModules()
      .then((data: IModule) => {
        dataFromProcess = data;
      })
      .catch((error: any) => {
        throw new Error(error);
      });

    return dataFromProcess;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// Promisify the API request
function requestMainProcess(): Promise<void> {
  return new Promise((resolve, reject) => {
    (window as any).api.request("toMain");
    resolve();
  });
}

// Promisify the API response
function receiveModules(): Promise<IModule> {
  return new Promise((resolve, reject) => {
    (window as any).api.response("fromMain", (data: IModule | Error) => {
      if (data instanceof Error) {
        reject(data.message);
      } else {
        resolve(data);
      }
    });
  });
}
