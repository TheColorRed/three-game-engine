import { Key } from '../enums';
import { TOKEN_KEYDOWN, TOKEN_KEYPRESS, TOKEN_KEYUP } from '../tokens';


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
    Reflect.defineMetadata(TOKEN_KEYPRESS, keys, target, prop);
  };
}
