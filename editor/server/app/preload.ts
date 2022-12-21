import { WatchOptions } from 'chokidar';
import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'fs/promises';
import * as os from 'os';

export type PathType =
  | 'home'
  | 'appData'
  | 'userData'
  | 'sessionData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps';

contextBridge.exposeInMainWorld('electron', {
  dialogOpen: (method: string, options: any) => ipcRenderer.invoke('dialog', method, options),
  path: (path: PathType) => ipcRenderer.invoke('getPath', path),
});

contextBridge.exposeInMainWorld('api', {
  os: os,
  fs: fs,
  assets: {
    setProjectRoot: (path: string) => ipcRenderer.invoke('setAssetRoot', path),
  },
  files: {
    glob: (patterns: string[]) => ipcRenderer.invoke('fsGlob', patterns),
    isFile: (path: string) => ipcRenderer.invoke('fsIsFile', path),
    isDirectory: (path: string) => ipcRenderer.invoke('fsIsDirectory', path),
    watch: (outChannel: string, paths: string | ReadonlyArray<string>, options?: WatchOptions) =>
      ipcRenderer.invoke('fsWatchOpen', outChannel, paths, options),
    close: (id: string, channel: string) => {
      ipcRenderer.invoke('fsWatchClose', id);
      ipcRenderer.removeAllListeners(channel);
    },
    clear: () => ipcRenderer.invoke('fsWatchClear'),
    changes: (channel: string, func: Function) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
  },
});
