const electron = require('electron');
const { app, Tray, Menu, BrowserWindow } = electron;
const path = require('path');
const iconPath = path.join(__dirname, 'iconTemplate@3x.png');
let appIcon = null;
let win = null;

app.on('ready', () => {
        win = new BrowserWindow({show: false});
        appIcon = new Tray(iconPath);
        var contextMenu = Menu.buildFromTemplate([
            {
            label: "Download:",
            click: function() {
                
                }
            },
            {
            label: "Upload:",
            click: function() {
                
                }
            },
            {type: 'separator'},
            { label: 'Quit',
            accelerator: 'CommandOrControl+Q',
            selector: 'terminate:',
            click: function() {
                    app.quit();
                    app.exit();
                }
            }
        ]);
        appIcon.setToolTip('net-meter');
        appIcon.setContextMenu(contextMenu);
    });
app.on('quit', () => {
    app.quit();
    app.exit();
});