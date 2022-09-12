import { Type } from '../di';
import { TOKEN_OBJECT_CHILD, TOKEN_OBJECT_CHILDREN } from '../tokens';

export function ObjectChild<T>(child: Type<T>) {
  return function (target: any, prop: string) {
    Reflect.defineMetadata(TOKEN_OBJECT_CHILD, child, target, prop);
  };
}

export function ObjectChildren<T>(child: Type<T>) {
  return function (target: any, prop: string) {
    Reflect.defineMetadata(TOKEN_OBJECT_CHILDREN, child, target, prop);
  };
}