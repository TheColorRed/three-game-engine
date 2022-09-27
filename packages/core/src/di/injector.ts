import { TOKEN_INJECTABLE, TOKEN_INJECTION } from '../tokens';
import { Type } from './types';

export type ProvidedIn = 'game' | 'local';

export class Injector<T> {

  constructor(
    private readonly instance: T,
    private readonly injections: any[]
  ) { }

  private static container = new Map<Type<any>, Injector<any>>();

  static create<T>(target: Type<T>): Injector<T> {
    const injectable = Reflect.getMetadata(TOKEN_INJECTABLE, target);
    // If the service is provided in the root, then make a singleton.
    if (injectable === 'game') {
      // If the instance has already been created return it.
      if (Injector.container.has(target)) {
        return Injector.container.get(target) as Injector<T>;
      }
      // The instance has not been created create one.
      return this.#create(target, true);
    }
    // Create the instance without saving a reference
    return this.#create(target, false);
  }

  /**
   * Get a singleton service.
   * @param item The item to search for.
   * @returns
   */
  static get<T>(item: Type<T>): T | undefined {
    const ref = Injector.container.get(item);
    return ref?.instance ?? this.create(item).get(item);
  }

  static #create<T>(target: Type<T>, isSingleton: boolean) {
    const tokens = Reflect.getMetadata(TOKEN_INJECTION, target) || [];
    const injections = tokens.map((token: Type<any>) => Injector.create(token).get(token));
    const instance = new target(...injections) as T;
    const injector = new Injector(instance, injections);
    if (isSingleton) {
      Injector.container.set(target, injector);
    }

    return injector;
  }

  /**
   * Get a service within the injectable.
   * @param item The item to search for.
   * @returns
   */
  get<T>(item: Type<T>): T | undefined {
    if (this.instance instanceof item) return this.instance;
    return (this.injections.find(i => i.instance instanceof item)?.instance as T) ?? Injector.get(item);
  }

  getAll<T>(item: Type<T>): T[] {
    const found: T[] = [];
    function find(instance: any) {
      if (instance instanceof item) found.push(instance);
      const keys = Object.entries<object>(instance);
      for (let [key, obj] of keys) {
        if (typeof obj === 'object') {
          const isInjectable = Reflect.hasMetadata(TOKEN_INJECTABLE, obj.constructor);
          if (isInjectable) find(obj);
        }
      }
    }
    this.injections.forEach(i => find(i));
    return found;
  }

  each(cb: (value: object, index: number, array: object[]) => void) {
    this.injections.forEach(cb);
  }
}