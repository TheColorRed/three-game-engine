import { Injectable, NgZone } from '@angular/core';
import { WatchOptions } from 'chokidar';
import * as path from 'path';
import { catchError, concat, concatMap, filter, first, from, map, merge, of, tap } from 'rxjs';
import { DataType, FileResource } from '../classes/file-resource';
import { FileWatcher } from '../classes/file-watcher';

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  constructor(private readonly zone: NgZone) {}
  /**
   * Opens a file resource for reading/writing and other manipulations.
   * @param path The path to the resource.
   * @param dataType The type of data that the resource contains.
   */
  createResource<T>(path: string, dataType: DataType) {
    return new FileResource(path, dataType, this) as FileResource<T>;
  }
  /**
   * Reads a file from disk and attempts to parse the json.
   * @param path The file to read.
   */
  readJson(path: string, encoding: BufferEncoding = 'utf-8') {
    return this.read(path, encoding).pipe(map(i => JSON.parse(i)));
  }
  /**
   * Writes to a file to disk saving the data as json.
   * @param path The file to write.
   * @param data The data to write to the file.
   */
  writeJson<T>(path: string, data: T, format = true) {
    return this.write(path, JSON.stringify(data, undefined, format ? 2 : undefined));
  }
  /**
   * Reads a file from disk.
   * @param path The file to read.
   */
  read(path: string, encoding: BufferEncoding = 'utf-8') {
    const data = window.api.fs.readFile(path, { encoding });
    return from(data).pipe(first());
  }
  /**
   * Writes data to a file on disk.
   * @param path The file to write.
   * @param data The data to write to the file.
   */
  write(path: string, data: string) {
    return from(window.api.fs.writeFile(path, data, { encoding: 'utf-8' }));
  }
  /**
   * Creates a folder without recursion (all parent folders must exist).
   * @param path The path to the folder.
   */
  mkdir(path: string) {
    return from(window.api.fs.mkdir(path, { recursive: false }));
  }
  /**
   * Creates all the missing parent folders.
   * @param path The path to the folder.
   */
  mkdirp(path: string) {
    return from(window.api.fs.mkdir(path, { recursive: true }));
  }
  /**
   * Copies a file from one location to another.
   * @param src The source file to copy.
   * @param dest The destination for the copied file.
   * @param destIsDir If the destination path is a directory.
   */
  copy(src: string, dest: string, destIsDir = false) {
    if (destIsDir) {
      console.log(src);
      const fileName = path.parse(new URL(src).pathname).base;
      dest = path.join(dest, fileName);
    }
    const dir = path.dirname(dest);
    return concat(this.mkdirp(dir), from(window.api.fs.copyFile(src, dest)));
  }
  /**
   * Moves a file from one location to another.
   * @param src The source file to move.
   * @param dest The destination to move the file to.
   */
  move(src: string, dest: string) {
    const dir = path.dirname(dest);
    return concat(this.mkdirp(dir), from(window.api.fs.rename(src, dest)));
  }
  /**
   * Deletes files and directories.
   * @param path The path to delete.
   * @param isDir If the path is a directory this must be `true`.
   */
  delete(path: string, isDir = false) {
    const deleteFile$ = (path: string) =>
      from(window.api.files.isFile(path)).pipe(
        filter(i => i === true),
        tap(() => window.api.fs.rm(path))
      );
    const deleteDir$ = (path: string) =>
      from(window.api.files.isDirectory(path)).pipe(
        filter(i => i === true && isDir === true),
        tap(() => window.api.fs.rmdir(path))
      );
    return merge(deleteFile$(path), deleteDir$(path));
  }
  /**
   * Checks to see if a file or folder exists on disk.
   * @param path The path to check.
   */
  exists(path: string) {
    return from(window.api.fs.access(path)).pipe(
      concatMap(() => of(true)),
      catchError(() => of(false))
    );
  }
  /**
   * Watches a folder for changes.
   * @param channel The channel to watch on.
   * @param path The path to watch.
   * @param options The watching options.
   */
  watch(channel: string, path: string | ReadonlyArray<string>, options?: WatchOptions) {
    return new FileWatcher(channel, path, this.zone, options);
  }
}
