import { app, ipcMain } from 'electron';
import { PathType } from '../preload';

export function appHandlers() {
  ipcMain.handle('getPath', (evt, path: PathType) => app.getPath(path));
}
