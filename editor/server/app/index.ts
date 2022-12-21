import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { AssetServer } from './asset-server';
import { appHandlers } from './handlers/app.handler';
import { fileHandlers } from './handlers/file.handler';

// require('electron-reload')(__dirname, {
//   electron: path.join(
//     __dirname,
//     '..',
//     '..',
//     'node_modules',
//     '.bin',
//     os.platform() === 'win32' ? 'electron.cmd' : 'electron'
//   ),
//   paths: [__dirname],
// });

let win: BrowserWindow;

app.on('ready', () => {
  win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      allowRunningInsecureContent: true,
      webSecurity: false,
    },
  });
  win.loadURL('http://localhost:4200');

  // start the asset server.
  // AssetServer.start();
  // assetServer();

  // Attach api handlers.
  ipcMain.handle('setAssetRoot', (evt, path: string) => AssetServer.setRoot(path));
  fileHandlers();
  appHandlers();
  console.log('hi');
});

// function assetServer() {
// AssetServer.start();
// }

// function handlers() {
//   const watchers: { id: string; watcher: FSWatcher; channel: string }[] = [];

//   ipcMain.handle('dialog', (evt, method: string, ...params: any[]) => (<any>dialog)[method](...params));
//   ipcMain.handle('getPath', (evt, path: PathType) => app.getPath(path));
//   ipcMain.handle(
//     'fsWatchOpen',
//     (evt, outChannel: string, paths: string | ReadonlyArray<string>, options?: WatchOptions) => {
//       const watcher = chokidar.watch(paths, options);
//       const id = crypto.randomUUID();
//       watchers.push({ id, watcher, channel: outChannel });
//       watcher.on('all', (fileEvt, path, stats) => {
//         const s = { ...stats, isFile: stats?.isFile(), isDir: stats?.isDirectory() };
//         evt.sender.send(outChannel, { event: fileEvt, path, stats: s });
//       });
//       return id;
//     }
//   );
//   ipcMain.handle('fsWatchClose', async (evt, id: string) => {
//     const idx = watchers.findIndex(i => i.id === id);
//     if (idx > -1) {
//       const watcher = watchers[idx].watcher;
//       await watcher.close();
//       watchers.splice(idx, 1);
//       return true;
//     }
//     return false;
//   });
//   ipcMain.handle('fsWatchClear', async () => {
//     console.log('Clear Watchers:', watchers.length);
//     for (let w of watchers) {
//       await w.watcher.close();
//     }
//     watchers.splice(0, watchers.length);
//     console.log('Watchers:', watchers.length);
//   });
//   ipcMain.handle('fsIsFile', async (evt, path) => {
//     const stat = await fs.stat(path);
//     return stat.isFile();
//   });
//   ipcMain.handle('fsIsDirectory', async (evt, path) => {
//     const stat = await fs.stat(path);
//     return stat.isDirectory();
//   });
// }
