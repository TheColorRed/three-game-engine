import * as chokidar from 'chokidar';
import { FSWatcher, WatchOptions } from 'chokidar';
import * as crypto from 'crypto';
import { ipcMain } from 'electron';
import * as glob from 'fast-glob';
import * as fs from 'fs/promises';
import { AssetServer } from '../asset-server';

export function fileHandlers() {
  const watchers: { id: string; watcher: FSWatcher; channel: string }[] = [];

  ipcMain.handle(
    'fsWatchOpen',
    (evt, outChannel: string, paths: string | ReadonlyArray<string>, options?: WatchOptions) => {
      const watcher = chokidar.watch(paths, options);
      const id = crypto.randomUUID();
      watchers.push({ id, watcher, channel: outChannel });
      watcher.on('all', (fileEvt, path, stats) => {
        const s = { ...stats, isFile: stats?.isFile(), isDir: stats?.isDirectory() };
        evt.sender.send(outChannel, { event: fileEvt, path, stats: s });
      });
      return id;
    }
  );
  ipcMain.handle('fsWatchClose', async (evt, id: string) => {
    const idx = watchers.findIndex(i => i.id === id);
    if (idx > -1) {
      const watcher = watchers[idx].watcher;
      await watcher.close();
      watchers.splice(idx, 1);
      return true;
    }
    return false;
  });
  ipcMain.handle('fsWatchClear', async () => {
    console.log('Clear Watchers:', watchers.length);
    for (let w of watchers) {
      await w.watcher.close();
    }
    watchers.splice(0, watchers.length);
    console.log('Watchers:', watchers.length);
  });
  ipcMain.handle('fsIsFile', async (evt, path) => {
    const stat = await fs.stat(path);
    return stat.isFile();
  });
  ipcMain.handle('fsIsDirectory', async (evt, path) => {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  });
  ipcMain.handle('fsGlob', async (evt, patterns: string[]) => {
    const paths = await glob(patterns, { absolute: true, cwd: AssetServer.assetsRoot });
    return paths;
  });
}
