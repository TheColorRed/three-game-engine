import { Engine, Reflection, Spacial, Sprite, TOKEN_GAME_OBJECT, TOKEN_ONCE, TOKEN_REPEAT, Vector3 } from '@engine/core';
import { map, take, takeWhile, timer } from 'rxjs';
import { Object3D } from 'three';
import { GameObject } from '../game-object';

export interface GameObjectOptions {
  name?: string;
  object?: Sprite | Spacial;
  position?: Vector3;
  tag?: string;
}

export function Prefab(options?: GameObjectOptions) {
  return function <T extends { new(...args: any[]): any; }>(target: T) {
    Reflect.defineMetadata(TOKEN_GAME_OBJECT, target, target);
    return class GamePrefab extends target implements GameObject {

      readonly gameObjectType = 'gameObject';
      name = options?.name || 'GameObject';
      markedForDeletion = false;
      isActive = true;
      started = false;
      methods: string[] = [];
      object3d = options?.object?.object?.clone(true) ?? new Object3D();
      tag = options?.tag ?? '';

      get position() {
        return new Vector3(
          this.object3d.position.x,
          this.object3d.position.y,
          this.object3d.position.z
        );
      }
      set position(value: Vector3) {
        this.object3d.position.setX(value.x);
        this.object3d.position.setY(value.y);
        this.object3d.position.setZ(value.z ?? 0);
      }

      constructor(...args: any[]) {
        super(...args);
        this.methods = Reflect.ownKeys(target.prototype) as string[];
        Engine.activeScene.addGameObject(this.object3d);
        this.position = options?.position ?? Vector3.zero;
      }
      /**
       * Run the GameObject's start.
       */
      start() {
        this.started = true;
        typeof super.start === 'function' && super.start();
        this.invokeRepeat();
        this.invokeOnce();
      }
      /**
       * Run the GameObject's updates.
       */
      update() {
        if (this.isActive === false || this.started === false) return;
        typeof super.update === 'function' && super.update();
      }
      /**
       * Runs the GameObject's destroy method.
       */
      destroy() {
        if (this.markedForDeletion === true) {
          typeof super.destroy === 'function' && super.destroy();
          this.object3d.parent?.remove(this.object3d);
          return true;
        }
        return false;
      }

      private invokeRepeat() {
        this.methods.forEach(method => {
          Reflection.call<{ delay?: number; interval?: number; times?: number; }>(
            i => typeof i.delay === 'number' && typeof i.interval === 'number' && typeof i.times === 'number' && typeof super[method] === 'function',
            i => {
              const t = timer(i.delay! * 1000, i.interval! * 1000)
                .pipe(map<number, boolean>(i => super[method](i)));

              (
                (i.times !== Infinity && i.times! > 0) ?
                  t.pipe(take(i.times!)) :
                  t.pipe(takeWhile(i => i !== false))
              ).subscribe();
            },
            TOKEN_REPEAT, target.prototype, method
          );
        });
      }

      private invokeOnce() {
        this.methods.forEach(method => {
          const delay = Reflect.getMetadata(TOKEN_ONCE, target.prototype, method);
          Reflection.call(
            v => typeof super[method] === 'function',
            () => timer(delay * 1000).subscribe(() => super[method]()),
            TOKEN_ONCE, target.prototype, method
          );
          // if (typeof delay === 'number' && typeof super[method] === 'function') {
          //   timer(delay * 1000).subscribe(() => super[method]());
          // }
        });
      }
    };
  };
};