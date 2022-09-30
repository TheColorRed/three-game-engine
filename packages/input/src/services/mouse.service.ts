import { GameConfig, GameObject, GameObjectManager, Injectable, Injector, OnDestroy, Vector2 } from '@engine/core';
import { GameLoop } from '@engine/core/src/services/game-loop.service';
import { auditTime, fromEvent, of, switchMap, tap } from 'rxjs';
import { MouseButton } from '../enums';
import { MOUSE_DOWN, MOUSE_PRESS, MOUSE_UP } from '../tokens';
import { ButtonState } from './keyboard.service';

@Injectable({ providedIn: 'game' })
export class Mouse implements OnDestroy {

  private readonly gameLoop = Injector.get(GameLoop)!;
  private readonly gom = Injector.get(GameObjectManager)!;
  private readonly canvas = Injector.get(GameConfig)!.get('canvas');

  private mouseX = 0;
  private mouseY = 0;
  private isMouseDown = false;
  mousedown = MouseButton.None;
  mouseup = MouseButton.None;
  mousepress = MouseButton.None;
  mouseDown$ = fromEvent<MouseEvent>(this.canvas, 'mousedown')
    .pipe(
      tap(i => {
        i.preventDefault();
        this.mousedown = i.button;
        this.isMouseDown === false && this.triggerMouse('down');
        this.isMouseDown = true;
      })
    )
    .subscribe();
  mouseUp$ = fromEvent<MouseEvent>(this.canvas, 'mouseup')
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

  mouseMove$ = fromEvent<MouseEvent>(this.canvas, 'mousemove').pipe(
    switchMap(e => of(this.canvas.getBoundingClientRect()).pipe(
      tap(r => this.mouseX = Math.min(this.canvas.width, Math.max(0, e.clientX - r.left))),
      tap(r => this.mouseY = Math.min(this.canvas.height, Math.max(0, e.clientY - r.top)))
    )),
  ).subscribe();

  mousePressed$ = this.gameLoop.updated$.pipe(
    auditTime(1),
    tap(() => {
      this.isMouseDown && this.triggerMouse('press');
    })
  ).subscribe();

  get position() {
    return new Vector2(this.mouseX, this.mouseY);
  }

  constructor() {
    document.body.addEventListener('contextmenu', i => i.preventDefault());
  }

  onDestroy() {
    this.mouseMove$.unsubscribe();
    this.mouseUp$.unsubscribe();
    this.mouseDown$.unsubscribe();
    this.mousePressed$.unsubscribe();
  }

  triggerMouse(state: ButtonState) {
    const button = state === 'up' ? this.mouseup :
      state === 'down' ? this.mousedown :
        state === 'press' ? this.mousedown : undefined;
    if (typeof button !== 'undefined') this.mouseEvent(button, state);
  }

  private mouseEvent(key: MouseButton, type: ButtonState) {
    for (let obj of this.gom.gameObjects) {
      for (let method of obj.methods || []) {
        this.execMouseEvent(key, type, obj, method);
      }
    }
  }

  private execMouseEvent(key: MouseButton, type: ButtonState, obj: GameObject & { [key: string]: any; }, method: string) {
    const keyToken = type === 'down' ? MOUSE_DOWN :
      type === 'up' ? MOUSE_UP :
        type === 'press' ? MOUSE_PRESS :
          undefined;

    const i = Reflect.getMetadata(keyToken, obj.target.prototype, method) as MouseButton[];
    if (Array.isArray(i) && i.includes(key) && typeof obj.instance[method] === 'function') {
      obj.instance[method]();
    }
  }

}