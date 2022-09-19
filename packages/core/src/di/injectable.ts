import { TOKEN_INJECTABLE } from '../tokens/tokens';
import { Type } from './types';

export interface InjectableOptions {
  providedIn: 'game' | 'local';
}

export function Injectable(options?: Partial<InjectableOptions>) {
  return <T>(target: Type<T>) => {
    Reflect.defineMetadata(TOKEN_INJECTABLE, options?.providedIn || 'local', target);
  };
}