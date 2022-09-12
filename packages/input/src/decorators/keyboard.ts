import { Injector } from '@engine/core';
import { Keyboard } from '../services';
import { TOKEN_KEYDOWN, TOKEN_KEYPRESS, TOKEN_KEYUP } from '../tokens';

export enum Key {
  None, // Default state
  // Letters
  A = 'A', B = 'B', C = 'C', D = 'D', E = 'E', F = 'F', G = 'G', H = 'H', I = 'I', J = 'J', K = 'K', L = 'L', M = 'M', N = 'N', O = 'O', P = 'P', Q = 'Q', R = 'R', S = 'S', T = 'T', U = 'U', V = 'V', W = 'W', X = 'X', Y = 'Y', Z = 'Z',
  // Numbers
  Num0 = 'Num0', Num1 = 'Num1', Num2 = 'Num2', Num3 = 'Num3', Num4 = 'Num4', Num5 = 'Num5', Num6 = 'Num6', Num7 = 'Num7', Num8 = 'Num8', Num9 = 'Num9',
  // Number Pad
  NumPad0 = 'NumPad0', NumPad1 = 'NumPad1', NumPad2 = 'NumPad2', NumPad3 = 'NumPad3', NumPad4 = 'NumPad4', NumPad5 = 'NumPad5', NumPad6 = 'NumPad6', NumPad7 = 'NumPad7', NumPad8 = 'NumPad8', NumPad9 = 'NumPad9',
  // Other
  Enter = 'Enter', Tab = 'Tab', Space = 'Space', Shift = 'Shift',
  // Function keys
  F1 = 'F1', F2 = 'F2', F3 = 'F3', F4 = 'F4', F5 = 'F5', F6 = 'F6', F7 = 'F7', F8 = 'F8', F9 = 'F9', F10 = 'F10', F11 = 'F11', F12 = 'F12'
};

export function KeyUp(key: Key) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYUP, key, target, prop);
  };
}
export function KeyDown(key: Key) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYDOWN, key, target, prop);
  };
}
export function KeyPress(key: Key) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYPRESS, key, target, prop);
  };
}
