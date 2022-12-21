import { BehaviorSubject, debounceTime, filter, map, Subject, take, tap } from 'rxjs';
import { FileSystemService } from '../services/fs.service';

export enum DataType {
  Json,
  Text,
  BufferArray,
}

export class FileResource<T extends any> {
  private readonly ready = new BehaviorSubject<boolean>(false);
  ready$ = this.ready.asObservable();

  private content = new BehaviorSubject<string>('');
  /** The content of the file. */
  content$ = this.content.pipe(
    filter(i => i.length > 0),
    map(i => {
      if (this.type === DataType.Json) return JSON.parse(i) as T;
      return i as T;
    })
  );

  private saveResource = new Subject<void>();
  /** An internal resource that limits how often a save takes place. */
  save$ = this.saveResource
    .pipe(
      debounceTime(500),
      tap(() => this.#saveToDisk())
    )
    .subscribe();

  /** Gets the current state. */
  get value() {
    return this.content.value;
  }

  constructor(private readonly path: string, private readonly type: DataType, private readonly fs: FileSystemService) {
    // Load the initial file and close the subscription.
    this.load()
      .pipe(
        tap(i => this.set(i)),
        tap(() => this.ready.next(true)),
        take(1)
      )
      .subscribe();
  }
  /**
   * Sets a string as the current state.
   * @param data The data to set as the current state.
   */
  set(data: string | T) {
    data = typeof data === 'string' ? data : JSON.stringify(data);
    this.content.next(data);
  }
  /**
   * Gets the data base on the data type.
   */
  get() {
    if (this.type === DataType.Json) return JSON.parse(this.value) as T;
    return this.value as T;
  }
  /**
   * Adds a string to the end of the current string.
   * @param data The data to append to the current text.
   */
  append(data: string) {
    const value = `${this.content.value}${data}`;
    this.content.next(value);
  }
  /**
   * Adds a string to the beginning of the current string.
   * @param data The data to prepend to the current text.
   */
  prepend(data: string) {
    const value = `${data}${this.content.value}`;
    this.content.next(value);
  }
  /**
   * Saves the current state to disk.
   *
   * **Note:** Saving of the file is delayed by 500ms.
   */
  save() {
    this.saveResource.next();
  }
  /**
   * Loads the data from disk to create a new state.
   */
  load() {
    return this.fs.read(this.path);
  }
  /**
   * Closes the file resource.
   *
   * **Note:** This does not save the state to disk.
   */
  close() {
    this.save$.unsubscribe();
  }

  #saveToDisk() {
    const value = this.content.value;
    return this.fs.write(this.path, value);
  }
}
