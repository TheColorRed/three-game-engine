import { MouseButton } from '../enums';
import { MOUSE_DOWN, MOUSE_PRESS, MOUSE_UP } from '../tokens';
export type MouseTarget = 'global' | 'self';

export interface MouseData {
  key: MouseButton;
  mouseTarget: MouseTarget;
}

export function ButtonUp(...keys: MouseButton[]) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(MOUSE_UP, keys, target, prop);
  };
}
export function ButtonDown(...keys: MouseButton[]) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(MOUSE_DOWN, keys, target, prop);
  };
}
export function ButtonPress(...keys: MouseButton[]) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(MOUSE_PRESS, keys, target, prop);
  };
}