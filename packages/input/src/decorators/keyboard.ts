import { Injector } from '@engine/core';
import { Keyboard } from '../services';
import { TOKEN_KEYDOWN, TOKEN_KEYPRESS, TOKEN_KEYUP } from '../tokens';

export enum Key {
  None, // Default state
  // Letters
  A = 'KeyA', B = 'KeyB', C = 'KeyC', D = 'KeyD', E = 'KeyE', F = 'KeyF', G = 'KeyG', H = 'KeyH', I = 'KeyI', J = 'KeyJ', K = 'KeyK', L = 'KeyL', M = 'KeyM', N = 'KeyN', O = 'KeyO', P = 'KeyP', Q = 'KeyQ', R = 'KeyR', S = 'KeyS', T = 'KeyT', U = 'KeyU', V = 'KeyV', W = 'KeyW', X = 'KeyX', Y = 'KeyY', Z = 'KeyZ',
  // Numbers
  Num0 = 'Num0', Num1 = 'Num1', Num2 = 'Num2', Num3 = 'Num3', Num4 = 'Num4', Num5 = 'Num5', Num6 = 'Num6', Num7 = 'Num7', Num8 = 'Num8', Num9 = 'Num9',
  // Number Pad
  NumPad0 = 'NumPad0', NumPad1 = 'NumPad1', NumPad2 = 'NumPad2', NumPad3 = 'NumPad3', NumPad4 = 'NumPad4', NumPad5 = 'NumPad5', NumPad6 = 'NumPad6', NumPad7 = 'NumPad7', NumPad8 = 'NumPad8', NumPad9 = 'NumPad9',
  // Other
  Enter = 'Enter', Tab = 'Tab', Space = 'Space', Shift = 'Shift',
  // Arrow keys
  Left = 'ArrowLeft', Right = 'ArrowRight', Up = 'ArrowUp', Down = 'ArrowDown',
  // Function keys
  F1 = 'F1', F2 = 'F2', F3 = 'F3', F4 = 'F4', F5 = 'F5', F6 = 'F6', F7 = 'F7', F8 = 'F8', F9 = 'F9', F10 = 'F10', F11 = 'F11', F12 = 'F12'
};

/**
 * Executes a function when the keyboard key is released.
 * @param keys The key that will trigger the event.
 * @example
 * \@KeyUp(Key.Space)
 * printMessage() {
 *   console.log('Key was released');
 * }
 * @returns
 */
export function KeyUp(...keys: Key[]) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYUP, keys, target, prop);
  };
}
/**
 * Executes a function when the keyboard key is pressed down one time.
 * @param keys The key that will trigger the event.
 * @example
 * \@KeyDown(Key.Space)
 * printMessage() {
 *   console.log('Key was pressed');
 * }
 * @returns
 */
export function KeyDown(...keys: Key[]) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYDOWN, keys, target, prop);
  };
}
/**
 * Executes a function when the keyboard key is held down.
 * @param keys The key that will trigger the event.
 * @example
 * \@KeyPress(Key.Space)
 * printMessage() {
 *   console.log('Key is held down');
 * }
 * @returns
 */
export function KeyPress(...keys: Key[]) {
  return (target: any, prop: string) => {
    Injector.resolve(Keyboard);
    Reflect.defineMetadata(TOKEN_KEYPRESS, keys, target, prop);
  };
}
