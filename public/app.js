const { app, BrowserWindow, Menu } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      enableRemoteModule: true,
    },
  });

  //TODO check if User is developer
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12") {
      win.webContents.openDevTools();
    }
  });

  win.loadURL("http://localhost:3000");
  win.maximize();
  win.show();

  //TODO Only run on port 3000 when in development
  /*yard add electron-is-dev
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  */
}

//Hide the menu bar
Menu.setApplicationMenu(false);

app.on("ready", createWindow);

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
