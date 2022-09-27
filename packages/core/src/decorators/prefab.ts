import { auditTime, map, take, takeWhile, tap, timer } from 'rxjs';
import { Sprite } from '../2d';
import { Spacial } from '../3d';
import { GameObject } from '../classes';
import { Injector, Reflection } from '../di';
import { Engine } from '../engine';
import { ObjectList } from '../object-list';
import { GameLoop } from '../services/game-loop.service';
import { GAME_OBJECT, GAME_OBJECT_CHILDREN, TIME_AUTO_BURST, TIME_CHOICE, TIME_ONCE, TIME_RANDOMLY, TIME_REPEAT, TIME_ROUND_ROBIN } from '../tokens';
import { Euler, Vector3 } from '../transforms';

export interface GameObjectOptions {
  name?: string;
  object?: Sprite | Spacial;
  position?: Vector3;
  rotation?: Euler;
  tag?: string;
}

export function Prefab(options?: GameObjectOptions) {
  return function <T extends { new(...args: any[]): any; }>(target: T): any {
    Reflect.defineMetadata(GAME_OBJECT, options, target);
    return class GameObjectComponent extends GameObject {

      gameLoop = Injector.get(GameLoop)!;

      constructor() {
        super(target, options);
        this.methods = Reflect.ownKeys(this.target.prototype) as string[];
        // const sceneManger = Injector.get(SceneManager)
        // sceneManger?.add(this.object3d);
        // this.position = options?.position ?? Vector3.zero;
      }
      /**
       * Run the GameObject's start.
       */
      override onStart() {
        super.onStart();
        this.#addPhysicsBodies();
        this.#invokeRepeat();
        this.#invokeOnce();
        this.#watchChildren();
        this.#startAutoBurst();
        this.#startTimers();
        typeof this.instance.onStart === 'function' && this.instance.onStart();
      }
      /**
       * Run the GameObject's updates.
       */
      override onUpdate() {
        if (this.isActive === false || this.started === false) return;
        typeof this.instance.onUpdate === 'function' && this.instance.onUpdate();
      }
      /**
       * Runs the GameObject's destroy method.
       */
      override onDestroy() {
        if (this.markedForDeletion === true) {
          this.children.forEach((child) => child.onDestroy?.());
          typeof this.instance.onDestroy === 'function' && this.instance.onDestroy();
          this.object3d?.parent?.remove(this.object3d);
          // this.destroyServices(this);
          Engine.destroyLocalService(this);
          this.#removeSubscriptions();
          return true;
        }
        return false;
      }

      #removeSubscriptions() {
        Object.keys(this).forEach(method => {
          const meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, this.target.prototype, method);
          if (typeof meta !== 'undefined' && this.instance[method] instanceof ObjectList) {
            this.instance[method].destroy();
          }
        });
        this.subscriptions.forEach(e => e?.unsubscribe());
        this.children.destroy();
      }

      #invokeRepeat() {
        this.methods.forEach(method => {
          Reflection.call<{ delay?: number; interval?: number; times?: number; }>(
            i => typeof i.delay === 'number' && typeof i.interval === 'number' && typeof i.times === 'number' && typeof this.instance[method] === 'function',
            i => {
              const t = timer(i.delay! * 1000, i.interval! * 1000)
                .pipe(map<number, boolean>(i => this.instance[method](i)));

              const sub = (
                (i.times !== Infinity && i.times! > 0) ?
                  // Run until repeat has hit its max.
                  t.pipe(take(i.times!)) :
                  // Run until the callback returns false.
                  t.pipe(takeWhile(i => i !== false))
              ).subscribe();
              this.subscriptions.push(sub);
            },
            TIME_REPEAT, this.target.prototype, method
          );
        });
      }

      #invokeOnce() {
        this.methods.forEach(method => {
          const delay = Reflect.getMetadata(TIME_ONCE, this.target.prototype, method);
          Reflection.call(
            v => typeof this.instance[method] === 'function',
            () => { timer(delay * 1000).subscribe(() => this.instance[method]()); },
            TIME_ONCE, this.target.prototype, method
          );
        });
      }

      #addPhysicsBodies() {
        try {
          import('@engine/physics').then(physics => {
            if (!physics) return;
            if (Reflect.hasMetadata(physics.PHYSICS_RIGIDBODY, this.target)) {
              const world = Injector.create(physics.World).get(physics.World)!;
              world.add(this);
            }
          });
        } catch (e) { }
      }

      #watchChildren() {
        const props = Object.keys(this.instance) as string[];
        for (let prop of props) {
          let meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, this.target.prototype, prop);
          if (typeof meta !== 'undefined') {
            this.instance[prop] = new ObjectList(this, meta);
          }
        }
      }

      #startTimers() {
        this.methods.forEach(method => {
          // Start any randomly timers
          const random = Reflect.getMetadata(TIME_RANDOMLY, this.target.prototype, method);
          if (typeof random !== 'undefined') {
            this.instance[method]();
          }

          // Start choice times
          const choice = Reflect.getMetadata(TIME_CHOICE, this.target.prototype, method);
          if (typeof choice !== 'undefined') {
            this.instance[method]();
          }

          // Start round robin times
          const roundRobin = Reflect.getMetadata(TIME_ROUND_ROBIN, this.target.prototype, method);
          if (typeof roundRobin !== 'undefined') {
            this.instance[method]();
          }
        });
      }

      #startAutoBurst() {
        this.methods.forEach(method => {
          Reflection.call<{ duration: number; rest: number; speed: number; limit: number; }>(
            v => typeof this.instance[method] === 'function',
            v => {
              let isResting = false;
              let time = Date.now();
              let called = 0;
              const sub = this.gameLoop.updated$.pipe(
                auditTime(v.speed * 1000),
                tap(() => {
                  if (!isResting) {
                    this.instance[method]();
                    if (Math.abs(Date.now() - time) >= v.duration * 1000) {
                      isResting = true;
                      time = Date.now();
                    }
                  }
                  if (isResting && Math.abs(Date.now() - time) >= v.rest * 1000) {
                    called++;
                    isResting = false;
                    time = Date.now();
                  }
                }),
                takeWhile(() => called < v.limit)
              ).subscribe();

              this.subscriptions.push(sub);
            },
            TIME_AUTO_BURST, this.target.prototype, method
          );
        });
      };
    };
  };
};