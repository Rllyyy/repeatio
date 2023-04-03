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
      webSecurity: true, //!set to false if you want to load local images
      //!Change to this in the future https://stackoverflow.com/a/60251400/14602331
      //https://www.electronjs.org/docs/latest/api/protocol
      //https://stackoverflow.com/questions/8499633/how-to-display-base64-images-in-html
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
//This may result in a manifest v3 error
//https://github.com/MarshallOfSound/electron-devtools-installer
app.whenReady().then(() => {
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log("An error occurred: ", err));
  }
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
  /* If app is packed by electron, use the build folder, instead use the public folder */
  const filePath = app.isPackaged ? path.join(process.resourcesPath, "build/data.json") : "public/data.json";

  try {
    // Read file from build folder
    const moduleInfo = await fs.promises.readFile(filePath, "utf-8");
    // Send back module data
    win.webContents.send("fromMain", JSON.parse(moduleInfo));
  } catch (error) {
    // Send back error
    win.webContents.send("fromMain", error);
  }
});
