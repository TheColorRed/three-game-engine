export class LiveList<T> {
  private readonly _items: T[] = [];

  get(index: number) {
    return this._items.at(index);
  }
  [Symbol.iterator]() {
    let index = -1;
    let data = this._items;

    return {
      next: () => ({ value: data[++index], done: !(index in data) })
    };
  };
}