import { auditTime, forkJoin, map, Observable, take, takeWhile, tap, timer } from 'rxjs';
import { GameObject } from '../classes/game-object';
import { ObjectList } from '../classes/object-list';
import { Injector } from '../di/injector';
import { Reflection } from '../di/reflection';
import { Destroyable } from '../di/types';
import { Resource } from '../resource/resource';
import { GameLoop } from '../services/game-loop.service';
import { Three } from '../three';
import { GAME_OBJECT, GAME_OBJECT_CHILDREN } from '../tokens/game-object-tokens';
import { TIME_AUTO_BURST, TIME_CHOICE, TIME_ONCE, TIME_RANDOMLY, TIME_REPEAT, TIME_ROUND_ROBIN } from '../tokens/timing-tokens';
import { Euler } from '../transforms/euler';
import { Vector3 } from '../transforms/vector';

export interface GameObjectOptions {
  name?: string;
  object?: Resource | (() => Three.Object3D);
  position?: Vector3;
  rotation?: Euler | number;
  tag?: string;
  is2D?: boolean;
}

export function Prefab(options?: GameObjectOptions) {
  return function <T extends { new(...args: any[]): any; }>(target: T): any {
    Reflect.defineMetadata(GAME_OBJECT, options, target);
    return class GameObjectComponent extends GameObject {

      gameLoop = Injector.get(GameLoop)!;

      constructor() {
        super(target, options);
        this.methods = Reflect.ownKeys(this.target.prototype) as string[];
      }
      /**
       * Run the GameObject's start.
       */
      override onStart() {
        forkJoin([this.#addPhysics3D(), this.#addPhysics2D()]).pipe(
          tap(() => {
            this.#invokeRepeat();
            this.#invokeOnce();
            this.#watchChildren();
            this.#startAutoBurst();
            this.#startTimers();
            super.onStart();
            typeof this.instance.onStart === 'function' && this.instance.onStart();
          })
        ).subscribe();
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
          // this.destroyServices(this);
          this.#removeBody2D();
          this.#destroyLocalService(this.injector);
          this.#removeSubscriptions();
          return true;
        }
        return false;
      }

      #destroyLocalService(injector: Injector<any>) {
        const injections = injector.getLocal() as Destroyable[];

        for (let i of injections) {
          if (typeof i.onDestroy === 'function') {
            i.onDestroy();
            // this.#destroyLocalService(i as unknown as Injector<any>);
          }
        }
        // console.log(i);
        // for (let [key, obj] of Object.entries(gameObject)) {
        //   if (typeof obj === 'object') {
        //     const isInjectable = Reflect.hasMetadata(TOKEN_INJECTABLE, obj.constructor);
        //     const meta = Reflect.getMetadata(TOKEN_INJECTABLE, obj.constructor);
        //     if (meta === 'local' && isInjectable && typeof gameObject[key].onDestroy === 'function') {
        //       gameObject[key].onDestroy();
        //     }
        //     if (isInjectable) {
        //       this.#destroyLocalService(obj);
        //     }
        //   }
        // }
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
          const i = Reflect.getMetadata(TIME_REPEAT, target.prototype, method);
          if (typeof i !== 'undefined') {
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
          }
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

      #addPhysics3D() {
        return new Observable<void>(sub => {
          sub.next();
          try {
            import('@engine/physics').then(physics => {
              if (!physics) return sub.complete();
              if (Reflect.hasMetadata(physics.PHYSICS_RIGIDBODY, this.target)) {
                const world = Injector.get(physics.World);
                world?.add(this);
              }
              return sub.complete();
            }).catch(() => sub.complete());
          } catch (e) { sub.complete(); }
        });
      }

      #addPhysics2D() {
        return new Observable<void>(sub => {
          sub.next();
          try {
            import('@engine/physics2d').then(physics => {
              if (!physics) return sub.complete();
              if (Reflect.hasMetadata(physics.PHYSICS2D_RIGIDBODY, this.target)) {
                const world = Injector.get(physics.World2D);
                world?.add(this);
              }
              return sub.complete();
            }).catch(() => sub.complete());
          } catch (e) { sub.complete(); }
        });
      }

      #removeBody2D() {
        try {
          import('@engine/physics2d').then(physics => {
            const world = Injector.get(physics.World2D)!;
            world.remove(this);
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