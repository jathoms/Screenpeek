const {
  app,
  BrowserWindow,
  webContents,
  session,
  ipcMain,
  desktopCapturer,
  Menu,
} = require("electron");

// const moveMouse = require("robotjs");
const path = require("path");

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 500,
    width: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    minHeight: 60,
    minWidth: 350,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#131313",
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          // "default-src ws://localhost/ 'self' https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css 'unsafe-eval' 'unsafe-inline' data: 'unsafe-eval' 'unsafe-inline'"
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:",
        ],
      },
    });
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
let max;

ipcMain.on("X", () => {
  BrowserWindow.getFocusedWindow()?.close();
});
ipcMain.on("min", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});
ipcMain.on("max", () => {
  max = BrowserWindow.getFocusedWindow()?.isMaximized();
  if (!max) {
    BrowserWindow.getFocusedWindow()?.maximize();
  } else {
    BrowserWindow.getFocusedWindow()?.restore();
  }
});
ipcMain.on("GET_SOURCES", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    sources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
  videoOptionsMenu.popup();
});
const selectSource = async (source) => {
  webContents.getFocusedWebContents().send("SOURCE_SEND", source.id);
};
ipcMain.on("MOVE", async (e, X, Y) => {
  // moveMouse(X, Y);
  return;
});
