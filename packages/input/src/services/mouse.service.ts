import { Engine, Injectable, Reflection, Vector2 } from '@engine/core';
import type { GameObject } from '@engine/objects';
import { fromEvent, of, switchMap, tap } from 'rxjs';
import { MouseButton, MouseData } from '../decorators';
import { TOKEN_MOUSE_DOWN, TOKEN_MOUSE_PRESS, TOKEN_MOUSE_UP } from '../tokens';
import { ButtonState } from './keyboard.service';

@Injectable({ providedIn: 'root' })
export class Mouse {

  private mouseX = 0;
  private mouseY = 0;
  private isMouseDown = false;
  mousedown = MouseButton.None;
  mouseup = MouseButton.None;
  mousepress = MouseButton.None;
  keyboardDown$ = fromEvent<MouseEvent>(window, 'mousedown')
    .pipe(
      tap(i => {
        i.preventDefault();
        this.mousedown = i.button;
        this.isMouseDown === false && this.triggerMouse('down');
        this.isMouseDown = true;
      })
    )
    .subscribe();
  keyboardUp$ = fromEvent<MouseEvent>(window, 'mouseup')
    .pipe(
      tap(i => {
        i.preventDefault();
        this.mouseup = i.button;
        this.triggerMouse('up');
        this.mousepress = MouseButton.None;
        this.mousedown = MouseButton.None;
        this.mouseup = MouseButton.None;
        this.isMouseDown = false;
      })
    )
    .subscribe();

  mouseMove$ = fromEvent<MouseEvent>(Engine.canvas, 'mousemove').pipe(
    switchMap(e => of(Engine.canvas.getBoundingClientRect()).pipe(
      tap(r => this.mouseX = Math.min(Engine.canvas.width, Math.max(0, e.clientX - r.left))),
      tap(r => this.mouseY = Math.min(Engine.canvas.height, Math.max(0, e.clientY - r.top)))
    )),
  ).subscribe();

  get position() {
    return new Vector2(this.mouseX, this.mouseY);
  }

  constructor() {
    document.body.addEventListener('contextmenu', i => i.preventDefault());
  }

  triggerMouse(state: ButtonState) {
    const button = state === 'up' ? this.mouseup :
      state === 'down' ? this.mousedown :
        state === 'press' ? this.mousedown : undefined;
    if (typeof button !== 'undefined') this.mouseEvent(button, state);
  }

  private mouseEvent(key: MouseButton, type: ButtonState) {
    for (let obj of Engine.gameObjects) {
      for (let method of obj.methods || []) {
        this.execMouseEvent(key, type, obj, method);
      }
    }
  }

  private execMouseEvent(key: MouseButton, type: ButtonState, obj: GameObject & { [key: string]: any; }, method: string) {
    const keyToken = type === 'down' ? TOKEN_MOUSE_DOWN :
      type === 'up' ? TOKEN_MOUSE_UP :
        type === 'press' ? TOKEN_MOUSE_PRESS :
          undefined;
    Reflection.call<MouseData>(
      action => action.key === key && typeof obj[method] === 'function',
      keyToken ?? '', obj, method
    );
  }

}