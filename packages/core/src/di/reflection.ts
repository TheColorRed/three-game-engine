
export class Reflection {
  static set<V, T extends object>(token: string, value: V, target: T, prop?: string) {
    // If the metadata doesn't exist, create an array so it can be added to the array.
    if (!this.has(token, target, prop)) {
      if (typeof prop !== 'undefined') Reflect.defineMetadata(token, [], target, prop);
      else Reflect.defineMetadata(token, [], target);
    }

    // Add the value to the array
    const data = this.get<V>(token, target, prop);
    data?.push(value);

    // Set the new metadata
    if (typeof prop !== 'undefined') Reflect.defineMetadata(token, data, target, prop);
    else Reflect.defineMetadata(token, data, target);
  }

  static get<V, T extends object = object>(token: string, target?: T, prop?: string): V[] | undefined {
    if (typeof target === 'undefined') return [];
    return typeof prop !== 'undefined' ?
      Reflect.getMetadata(token, target, prop) :
      Reflect.getMetadata(token, target);
  }

  static has<T extends object>(token: string, target: T, prop?: string) {
    return typeof prop !== 'undefined' ?
      Reflect.hasMetadata(token, target, prop) :
      Reflect.hasMetadata(token, target);
  }

  static trigger(item: Function, ...args: any[]) {
    item(...args);
  }

  static call<V, T extends { [key: string]: any; } = object>(test: (value: V) => boolean, cb: (value: V) => void, token?: string, target?: T, prop?: string): void;
  static call<V, T extends { [key: string]: any; } = object>(test: (value: V) => boolean, token?: string, target?: T, prop?: string): void;
  static call<V, T extends { [key: string]: any; } = object>(...args:
    [test: (value?: V) => boolean, cb: (value?: V) => void, token?: string, target?: T, prop?: string] |
    [test: (value?: V) => boolean, token?: string, target?: T, prop?: string]
  ) {
    const test = args[0];
    const cb = args.length === 5 ? args[1] : () => { };
    const token = args.length === 5 ? args[2] : args[1] as string;
    const target = args.length === 5 ? args[3] : args[2] as T;
    const prop = args.length === 5 ? args[4] : args[3] as string;
    const data = Reflection.get<V | undefined>(token ?? '', target, prop);
    data?.forEach(action => {
      if (test(action) && typeof target !== 'undefined' && typeof prop === 'string') {
        if (args.length === 5) cb(action);
        else target[prop]();
      }
    });
  }
}