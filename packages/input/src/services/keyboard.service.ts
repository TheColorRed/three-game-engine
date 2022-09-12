import { Engine, Injectable } from '@engine/core';
import type { GameObject } from '@engine/objects';
import { fromEvent, tap } from 'rxjs';
import { Key } from '../decorators';
import { TOKEN_BUTTON_DOWN, TOKEN_BUTTON_PRESS, TOKEN_BUTTON_UP, TOKEN_KEYDOWN, TOKEN_KEYPRESS, TOKEN_KEYUP } from '../tokens';

export type ButtonState = 'up' | 'down' | 'press';

@Injectable({ providedIn: 'root' })
export class Keyboard {

  private isKeyDown = false;
  keydown = Key.None;
  keyup = Key.None;
  keypress = Key.None;
  keyboardDown$ = fromEvent<KeyboardEvent>(window, 'keydown')
    .pipe(
      tap(i => {
        i.preventDefault();
        this.keydown = Key[i.code as keyof typeof Key];
        this.isKeyDown === false && this.triggerKey('down');
        this.isKeyDown = true;
      })
    )
    .subscribe();
  keyboardUp$ = fromEvent<KeyboardEvent>(window, 'keyup')
    .pipe(
      tap(i => {
        i.preventDefault();
        this.keyup = Key[i.code as keyof typeof Key];
        this.triggerKey('up');
        this.keypress = Key.None;
        this.keydown = Key.None;
        this.keyup = Key.None;
        this.isKeyDown = false;
      })
    )
    .subscribe();

  triggerKey(type: ButtonState) {
    const key = type === 'up' ? this.keyup :
      type === 'down' ? this.keydown :
        type === 'press' ? this.keydown : undefined;
    if (typeof key !== 'undefined') this.keyboardEvent(key, type);
  }

  private keyboardEvent(key: Key, type: ButtonState) {
    for (let obj of Engine.gameObjects) {
      for (let method of obj.methods || []) {
        this.execKey(key, type, obj, method);
        this.execButton(key, type, obj, method);
      }
    }
  }

  private execKey(key: Key, type: ButtonState, obj: GameObject & { [key: string]: any; }, method: string) {
    const keyToken = type === 'down' ? TOKEN_KEYDOWN :
      type === 'up' ? TOKEN_KEYUP :
        type === 'press' ? TOKEN_KEYPRESS :
          undefined;
    const methodKey = Reflect.getMetadata(keyToken, obj, method);
    if (typeof methodKey !== 'undefined' && methodKey === key && typeof obj[method] === 'function') {
      obj[method]();
    }
  }

  private execButton(key: Key, type: ButtonState, obj: GameObject & { [key: string]: any; }, method: string) {
    const buttonToken = type === 'down' ? TOKEN_BUTTON_DOWN :
      type === 'up' ? TOKEN_BUTTON_UP :
        type === 'press' ? TOKEN_BUTTON_PRESS :
          undefined;
    const methodKey = Reflect.getMetadata(buttonToken, obj, method);
    if (typeof methodKey !== 'undefined' && methodKey === key && typeof obj[method] === 'function') {
      obj[method]();
    }
  }
}