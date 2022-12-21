import { Injectable, NgZone } from '@angular/core';
import { WatchOptions } from 'chokidar';
import { IpcRenderer } from 'electron';
import type { Stats } from 'fs';
import type * as fs from 'fs/promises';
import type * as os from 'os';
import { from, map, take } from 'rxjs';
import { File } from '../classes/file';

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

export interface SelectFileOptions {
  /** Select multiple items from the dialog. */
  multi?: boolean;
  /** The file types that can be selected. */
  filter?: Electron.FileFilter[];
}

export type WatchData = {
  event: FileWatchEvent;
  path: string;
  stats: Omit<Stats, 'isFile'> & { isFile: boolean; isDir: boolean };
};

export type FileWatchEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';

declare global {
  interface Window {
    electron: {
      dialogOpen: <T, U extends keyof Electron.Dialog = keyof Electron.Dialog>(
        name: U,
        ...options: Parameters<Electron.Dialog[U]>
      ) => Promise<T>;
      path: (path: PathType) => Promise<string>;
    };
    api: {
      os: typeof os;
      fs: typeof fs;
      ipcRenderer: IpcRenderer;
      assets: {
        setProjectRoot: (path: string) => Promise<void>;
      };
      files: {
        glob: (patterns: string[]) => Promise<string[]>;
        isFile: (path: string) => Promise<boolean>;
        isDirectory: (path: string) => Promise<boolean>;
        watch: (outChannel: string, paths: string | ReadonlyArray<string>, options?: WatchOptions) => Promise<string>;
        close: (id: string, channel: string) => Promise<boolean>;
        clear: () => Promise<void>;
        changes: (channel: string, func: (event: any, data: WatchData) => void) => void;
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
  /** The users home directory. */
  readonly home$ = from(window.electron.path('home'));
  /** The operating system platform name. Usually `win32`, `darwin`, or `linux` */
  readonly platform$ = from(window.api.os.platform());
  /** The separator used for the operating system. Either '\\' or '/' */
  readonly separator$ = this.platform$.pipe(map(i => (i === 'win32' ? '\\' : '/')));
  /** Shows the open folder dialog. */

  constructor(private readonly zone: NgZone) {
    window.api.files.clear();
  }

  selectFolder() {
    return from(
      window.electron.dialogOpen<{ filePaths: string[] }>('showOpenDialog', { properties: ['openDirectory'] })
    ).pipe(
      map(i => i.filePaths?.[0] ?? ''),
      take(1)
    );
  }
  /**
   * Opens a file selection dialog.
   * @param options Additional options for the dialog.
   */
  selectFile(options?: SelectFileOptions) {
    return from(
      window.electron.dialogOpen<{ filePaths: string[] }>('showOpenDialog', {
        properties: ['openFile', ...(options?.multi ? (['multiSelections'] as ['multiSelections']) : [])],
        ...(options?.filter && { filters: options?.filter }),
      })
    ).pipe(map(files => files.filePaths.map(path => new File(path))));
  }
}
