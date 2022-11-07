import { GameConfig, GameObjectAndComponentMethodInfo, GameObjectManager, Injectable, Injector, OnDestroy } from '@engine/core';
import { GameLoop } from '@engine/core/src/services/game-loop.service';
import { auditTime, filter, from, fromEvent, Subscription, switchMap, tap } from 'rxjs';
import { Key } from '../enums';
import { TOKEN_KEYDOWN, TOKEN_KEYPRESS, TOKEN_KEYUP } from '../tokens';

export type ButtonState = 'up' | 'down' | 'press' | 'release';

@Injectable({ providedIn: 'game' })
export class Keyboard implements OnDestroy {

  private keyState = new Map<Key, ButtonState>();
  private gameLoop = Injector.get(GameLoop)!;
  private gom = Injector.get(GameObjectManager)!;
  private isProduction = Injector.get(GameConfig)!.get('production');

  keyboardDown$ = fromEvent<KeyboardEvent>(window, 'keydown')
    .pipe(
      tap(e => {
        // Allows the developer console to open if in non-production mode.
        if (this.isProduction === false && e.code !== 'F12') {
          e.preventDefault();
        }
        // Don't allow the developer console to open.
        else if (this.isProduction === true) {
          e.preventDefault();
        }
      }),
      // If the key hasn't been added the key state manage add it.
      tap(e => !this.keyState.has(this.getKey(e)) && this.keyState.set(this.getKey(e), 'down')),
      // If the last state for the key was "release" set to "down".
      tap(e => this.keyState.get(this.getKey(e)) === 'release' && this.keyState.set(this.getKey(e), 'down')),
      switchMap(e => from(this.keyState.entries())
        .pipe(
          // Only allow the key to go through if it is in the "down" state.
          filter(([key, state]) => key === this.getKey(e) && state === 'down'),
          tap(([key]) => this.triggerKey(key)),
          // Change the state to "press" so "down" doesn't fire again till "up" is set.
          tap(([key]) => this.keyState.set(key, 'press'))
        )
      )
    );

  keyboardUp$ = fromEvent<KeyboardEvent>(window, 'keyup')
    .pipe(
      tap(e => e.preventDefault()),
      switchMap(e => from(this.keyState.entries())
        .pipe(
          tap(([key]) => key === this.getKey(e) && this.keyState.set(key, 'up')),
          filter(([key]) => key === this.getKey(e)),
          tap(([key]) => this.triggerKey(key)),
          tap(([key]) => this.keyState.set(key, 'release'))
        )
      ),
    );

  keyboardPress$ = this.gameLoop.updated$.pipe(
    auditTime(1),
    switchMap(() => this.keyState.entries()),
    filter(([, state]) => state === 'press'),
    // tap(([key, state]) => console.log('p', key, state)),
    tap(([key]) => this.triggerKey(key))
  );

  private readonly keyboardDownSub: Subscription;
  private readonly keyboardPressSub: Subscription;
  private readonly keyboardUpSub: Subscription;

  constructor() {
    this.keyboardDownSub = this.keyboardDown$.subscribe();
    this.keyboardPressSub = this.keyboardPress$.subscribe();
    this.keyboardUpSub = this.keyboardUp$.subscribe();
  }

  onDestroy() {
    this.keyboardDownSub.unsubscribe();
    this.keyboardPressSub.unsubscribe();
    this.keyboardUpSub.unsubscribe();
  }

  isKeyDown(key: Key) {
    return this.keyState.get(key) === 'down';
  }

  isKeyPressed(key: Key) {
    return this.keyState.get(this.getKey(key)) === 'press';
  }

  isKeyReleased(key: Key) {
    return this.keyState.get(key) === 'release';
  }

  triggerKey(key: Key) {
    for (let obj of this.gom.gameObjects) {
      const methods = obj.getMethodList();
      for (let method of methods || []) {
        for (let prop of method.props) {
          this.execKeyboardEvent(key, method, prop);
        }
      }
    }
  }

  private execKeyboardEvent(key: Key, obj: GameObjectAndComponentMethodInfo, method: string) {
    // private execKeyboardEvent(key: Key, obj: GameObjectBase & { [key: string]: any; }, method: string) {
    const state = this.keyState.get(key);
    if (typeof state === 'undefined') return;
    const keyToken = state === 'down' ? TOKEN_KEYDOWN :
      state === 'up' ? TOKEN_KEYUP :
        state === 'press' ? TOKEN_KEYPRESS :
          undefined;

    const i = Reflect.getMetadata(keyToken, obj.prototype, method) as Key[];
    if (Array.isArray(i) && i.includes(this.getKey(key)) && typeof obj.instance[method] === 'function') {
      obj.instance[method](key);
    }
  }

  private getKey(e: KeyboardEvent | Key) {
    const v = e instanceof KeyboardEvent ? e.code : e;
    const indexOfS = Object.values(Key).indexOf(v as unknown as Key);
    return Key[v as keyof typeof Key] ??
      Object.keys(Key)[indexOfS] as Key;
  }
}