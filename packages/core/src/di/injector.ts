import { TOKEN_INJECTABLE, TOKEN_INJECTION } from '../tokens/tokens';
import { Type } from './types';

export type ProvidedIn = 'game' | 'local';

export class Injector {
  private static container = new Map<string, any>();

  static resolve<T>(target: Type<T>): T {
    const injectable = Reflect.getMetadata(TOKEN_INJECTABLE, target);
    // If the service is provided in the root, then make a singleton.
    if (injectable === 'game') {
      // If the instance has already been created return it.
      if (Injector.container.has(target.name)) {
        return Injector.container.get(target.name);
      }
      // The instance has not been created create one.
      return this.create(target, true);
    }
    // Create the instance without saving a reference
    return this.create(target);
  }

  private static create<T>(target: Type<T>, isSingleton = false): T {
    const tokens = Reflect.getMetadata(TOKEN_INJECTION, target) || [];
    const injections = tokens.map((token: Type<any>): any =>
      Injector.resolve(token)
    );
    const instance = new target(...injections);
    if (isSingleton) {
      Injector.container.set(target.name, instance);
    }
    return instance;
  }
}