const {app, BrowserWindow, ipcMain, Tray, dialog, systemPreferences} = require('electron')
const electron = require('electron')
const path = require('path')
const utils = require('./utils')
const fs = require('fs');
const text2png = require('text2png');

const assetsDirectory = path.join(__dirname, 'assets')

const appIconPath = path.join(assetsDirectory, 'iconTemplate@3x.png')

const tempDir =  (electron.app || electron.remote.app).getPath('temp');

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
ipcMain.on('window-all-closed', () => {

  let options = {
    type: "question",
    buttons: ["Quit", "Cancel"],
    message: "Quit net-meter ?",
    icon: appIconPath
  }

  function callback (response, checkboxChecked) {
    if (response == 0) {
      app.quit()
    }
  }

  dialog.showMessageBox(null, options, callback)
  
})

const createTray = () => {
  tray = new Tray(appIconPath)
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when control key is pressed
    if (window.isVisible() && process.defaultApp && event.ctrlKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 550,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

ipcMain.on('statistics-updated', (event, statistics) => {
  
  let message_in = utils.numberFormatter.format(statistics.rate_kilobytes_in)
  let message_out = utils.numberFormatter.format(statistics.rate_kilobytes_out)
  let color;

  if (systemPreferences.isDarkMode()) {
    color = 'white'
  } else {
    color = 'black'
  }

  let iconText = ` ${message_out} KB/s ⬆\n ${message_in} KB/s ⬇`

  let iconTextOptions = {
                          color:`${color}`, 
                          font: '12px sans-serif', 
                          textAlign: 'right'
                        }

  fs.writeFileSync(tempDir + 'out.png', text2png(iconText, iconTextOptions));

  tray.setImage(tempDir + 'out.png')

})

