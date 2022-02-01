const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //TODO check if User is developer
  //Open developer tools
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12") {
      win.webContents.openDevTools();
    }
  });

  //Reload the page (useful for electron because the app doesn't update/refresh sometimes)
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F5") {
      win.webContents.reloadIgnoringCache();
    }
  });

  //Start on localhost if using development else run build folder
  win.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);

  win.maximize();
  win.show();

  win.on("closed", () => (win = null));
}

//Hide the menu bar
Menu.setApplicationMenu(false);

app.on("ready", createWindow);

//Add react dev devtools
//TODO check if user is dev
//https://github.com/MarshallOfSound/electron-devtools-installer
app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* Inter Process Communication between the main process (this file) and the renderer */
ipcMain.on("toMain", async (event, args) => {
  //args is an array of first a get method and second a parameter
  const firstArg = args[0];
  let data;
  switch (firstArg) {
    case "getModules":
      const repeatioModuleFolder = path.join(app.getPath("documents"), "repeatio/modules");

      //Check if repeatio folder exists
      if (!fs.existsSync(repeatioModuleFolder)) {
        //Create empty directory
        //TODO check if user wants a different directory so it doesn't get create every time
        fs.mkdirSync(repeatioModuleFolder, { recursive: true });
      }

      /* 
      1. For all folders in modules
      2. Check if folder is directory
      3. Read file
      4. Push all to array
      */

      data = [];
      const folders = await getModuleFolders();

      //https://stackoverflow.com/a/51738717/14602331
      //Crossing my fingers that this actually runs async because the gods of so said async is better here.
      //Use map instead of forEach to run async because
      await Promise.all(
        folders.map(async (folder) => {
          //Check if folder really is a folder
          let isFolder = false;
          try {
            isFolder = await checkIfFolder(folder);
          } catch (error) {
            console.log(error);
          }

          //Get module info from json file
          if (isFolder) {
            try {
              const info = await getModuleInfo(folder);
              data.push(info);
            } catch (error) {
              console.log(error);
            }
          }
        })
      );

      //Send the data back to the render process
      win.webContents.send("fromMain", data);
      break;
    case "getModule":
      const moduleID = args[1];
      data = await getModuleInfo(moduleID);
      win.webContents.send("fromMain", data);
      break;
    default:
      throw new Error("No matching ipcMain type");
      break;
  }
});

/* Functions */

//Return the all files and folders that are located in the modules folder (../Documents/repeatio/modules)
async function getModuleFolders() {
  const allModulesFolder = path.join(app.getPath("documents"), "repeatio/modules");
  try {
    const modules = await fs.promises.readdir(allModulesFolder);
    return modules;
  } catch (error) {
    console.log(error);
  }
}

//Return if file really is a folder
async function checkIfFolder(folder) {
  const moduleFolder = path.join(app.getPath("documents"), "repeatio/modules", folder);
  try {
    const fileInfo = await fs.promises.lstat(moduleFolder);
    const isItDirectory = fileInfo.isDirectory();
    return isItDirectory;
  } catch (error) {
    console.log(error);
  }
}

//Return module info
async function getModuleInfo(folder) {
  const file = path.join(app.getPath("documents"), "repeatio/modules", folder, "data.json");
  try {
    const moduleInfo = await fs.promises.readFile(file, "utf-8");
    return JSON.parse(moduleInfo);
  } catch (error) {
    console.log(error);
  }
}
