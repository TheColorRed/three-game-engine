import type { ObjectChildrenOptions } from '@engine/objects';
import { GameObject } from '@engine/objects';
import { Subscription, tap } from 'rxjs';
import { Engine } from '.';

/**
 * A list of game objects.
 */
export class ObjectList<T = GameObject> {

  private _items: T[] = [];
  private dirty = false;
  private _watcher: Subscription;

  get length() { return this._items.length; }
  get first() { return this._items[0]; }
  get last() { return this._items[this._items.length - 1]; }

  constructor(
    private readonly gameObject: GameObject,
    private searchCriteria?: ObjectChildrenOptions<T>
  ) {
    this._watcher = Engine.updated$.pipe(tap(() => this.update())).subscribe();
  }

  /**
   * Destroys the subscription.
   * @returns
   */
  destroy() {
    this._watcher.unsubscribe();
  }

  [Symbol.iterator]() {
    let index = 0;
    let data = this._items;

    return {
      next: function () {
        return { value: data[++index], done: !(index in data) };
      }
    };
  }

  get(index: number) {
    this.map(i => i);
    return this._items[index] ?? undefined;
  }

  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] { return this._items.map(fn); }
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] { return this._items.filter(fn); }
  find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined { return this._items.find(fn); }
  reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U { return this._items.reduce(fn, init); }
  forEach(fn: (item: T, index: number, array: T[]) => void): void { this._items.forEach(fn); }
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean { return this._items.some(fn); }
  toArray(): T[] { return this._items; }

  /**
   * Update the list of items.
   * @internal
   */
  private update() {
    // If the object is not dirty skip the update.
    if (this.dirty === false) return;
    this.dirty = false;
    const itms: T[] = [];
    const current = this.gameObject.object3d;
    for (let gameObject of Engine.gameObjects) {
      // Skip the current game objects since it cant be a parent to itself.
      // The game object must be a child of the current game object.
      if (current !== gameObject.object3d && current === gameObject.object3d?.parent) {
        // If there is search criteria use a filter.
        if (typeof this.searchCriteria !== 'undefined') {
          // If the following is true:
          //  * Search by object type
          //  * Search by object name
          //  * Search by object tag
          if (
            (typeof this.searchCriteria.type !== 'undefined' && gameObject instanceof this.searchCriteria.type) ||
            (typeof this.searchCriteria.name !== 'undefined' && gameObject.name === this.searchCriteria.name) ||
            (typeof this.searchCriteria.tag !== 'undefined' && gameObject.tag === this.searchCriteria.tag)
          ) {
            itms.push(gameObject as T);
          }
        }
        // If there is no search criteria add this item.
        else {
          itms.push(gameObject as T);
        }
      }
    }
    this._items = itms;
  }

  setDirty() {
    this.dirty = true;
  }
}
