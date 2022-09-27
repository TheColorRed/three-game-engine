import { TOKEN_INJECTABLE } from '../tokens';
import { Newable } from './types';

export interface InjectableOptions {
  providedIn: 'game' | 'local';
}

export function Injectable(options?: Partial<InjectableOptions>) {
  return <T>(target: Newable<T>) => {
    Reflect.defineMetadata(TOKEN_INJECTABLE, options?.providedIn || 'local', target);
  };
}