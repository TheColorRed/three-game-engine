import { NgZone } from '@angular/core';
import { WatchOptions } from 'chokidar';
import * as path from 'path';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { WatchData } from '../services/electron.service';
import { File } from './file';

export class FileWatcher {
  id: string = '';

  private changes = new Subject<WatchData>();
  private files = new BehaviorSubject<Map<string, File>>(new Map());
  private directories = new BehaviorSubject<Map<string, string>>(new Map());

  changes$ = this.changes.pipe();
  files$ = this.files.pipe(
    map(items => Array.from(items).sort(([fileA], [fileB]) => fileA.localeCompare(fileB))),
    map(items => new Map(items))
  );
  directories$ = this.directories.asObservable();

  constructor(
    private readonly channel: string,
    path: string | ReadonlyArray<string>,
    private readonly zone: NgZone,
    options?: WatchOptions
  ) {
    window.api.files.watch(channel, path, options).then(id => (this.id = id));
    window.api.files.changes(channel, (event, data) => this.zone.run(() => this.dataChanges(data)));
  }
  /**
   * Close the watcher and cleanup connections
   */
  close() {
    window.api.files.close(this.id, this.channel);
  }
  /**
   * Ping the files list.
   */
  ping() {
    this.files.next(this.files.value);
  }
  /**
   * Handle file/directory change detection.
   * @param data The watch data
   */
  private dataChanges(data: WatchData) {
    if (data.event === 'add' || data.event === 'addDir') this.added(data);
    else if (data.event === 'unlink' || data.event === 'unlinkDir') this.removed(data);
    else if (data.event === 'change') this.changed(data);
    this.changes.next(data);
  }
  /**
   * When a file/directory is added.
   * @param data The watch data.
   */
  private added(data: WatchData) {
    const filePath = data.path;
    const name = decodeURIComponent(path.basename(new URL(data.path).pathname));
    if (data.stats.isFile) {
      this.files.value.set(filePath, new File(data.path));
      this.files.next(this.files.value);
    } else if (data.stats.isDir) {
      this.directories.value.set(filePath, name);
      this.directories.next(this.directories.value);
    }
  }
  /**
   * When a file/directory is deleted.
   * @param data The watch data.
   */
  private removed(data: WatchData) {
    const filePath = data.path;
    const isFile = this.files.value.delete(filePath);
    const isDir = this.directories.value.delete(filePath);
    isFile && this.files.next(this.files.value);
    isDir && this.directories.next(this.directories.value);
  }
  /**
   * When a file/directory is changed.
   * @param data The watch data.
   */
  private changed(data: WatchData) {
    console.log(data);
  }
}
