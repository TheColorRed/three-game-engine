import { Injector, Reflection } from '@engine/core';
import { TOKEN_MOUSE_DOWN, TOKEN_MOUSE_PRESS, TOKEN_MOUSE_UP } from '@engine/input';
import { Mouse } from '../services';
export enum MouseButton { None = -1, Left = 0, Right = 2, Middle = 1 }
export type MouseTarget = 'global' | 'self';

export interface MouseData {
  key: MouseButton;
  mouseTarget: MouseTarget;
}

export function ButtonUp(key: MouseButton, mouseTarget: MouseTarget = 'self') {
  return (target: any, prop: string) => {
    Injector.resolve(Mouse);
    Reflect.defineMetadata(TOKEN_MOUSE_UP, { key, mouseTarget }, target, prop);
  };
}
export function ButtonDown(key: MouseButton, mouseTarget: MouseTarget = 'self') {
  return (target: any, prop: string) => {
    Injector.resolve(Mouse);
    Reflection.set(TOKEN_MOUSE_DOWN, { key, mouseTarget }, target, prop);
  };
}
export function ButtonPress(key: MouseButton, mouseTarget: MouseTarget = 'self') {
  return (target: any, prop: string) => {
    Injector.resolve(Mouse);
    Reflect.defineMetadata(TOKEN_MOUSE_PRESS, { key, mouseTarget }, target, prop);
  };
}