import { TOKEN_INJECTABLE, Type } from '@engine/core';

export interface InjectableOptions {
  providedIn: 'game' | 'local';
}

export function Injectable(options?: Partial<InjectableOptions>) {
  return <T>(target: Type<T>) => {
    Reflect.defineMetadata(TOKEN_INJECTABLE, options?.providedIn || 'local', target);
  };
}