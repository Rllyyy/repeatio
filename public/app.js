const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const path = require("path");
const fs = require("fs");

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

  win.loadURL("http://localhost:3000"); //TODO remove this (see below)
  win.maximize();
  win.show();

  //TODO Only run on port 3000 when in development
  //https://github.com/willjw3/react-electron/blob/master/public/electron.js
  //https://www.youtube.com/watch?v=Cdu2O6o2DCg
  /*yard add electron-is-dev
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  */
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
ipcMain.on("toMain", (event, args) => {
  switch (args) {
    case "getQuestion":
      //Get the data (all questions) from json question file with the file system
      fs.readFile(path.join(__dirname, "data.json"), "utf-8", (error, data) => {
        if (error) {
          throw new Error(error);
        }
        // Send the data back to the renderer
        win.webContents.send("fromMain", JSON.parse(data));
      });
      break;
    default:
      throw new Error("No matching ipcMain type");
      break;
  }
});
