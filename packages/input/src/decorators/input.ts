import { TOKEN_BUTTON_DOWN, TOKEN_BUTTON_PRESS, TOKEN_BUTTON_UP } from '@engine/input';

export function InputUp(key: string) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(TOKEN_BUTTON_UP, key, target, prop);
  };
}
export function InputDown(key: string) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(TOKEN_BUTTON_DOWN, key, target, prop);
  };
}
export function InputPress(key: string) {
  return (target: any, prop: string) => {
    Reflect.defineMetadata(TOKEN_BUTTON_PRESS, key, target, prop);
  };
}