import { app, BrowserWindow } from 'electron';
let win: BrowserWindow;


app.on('ready', () => {
  win = new BrowserWindow();
  win.loadURL('http://localhost:4200');
});