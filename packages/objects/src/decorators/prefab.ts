import { Engine, Euler, GAME_OBJECT, GAME_OBJECT_CHILDREN, Injector, ObjectList, PHYSICS_RIGIDBODY, Reflection, Spacial, Sprite, Three, TIME_AUTO_BURST, TIME_CHOICE, TIME_ONCE, TIME_RANDOMLY, TIME_REPEAT, TIME_ROUND_ROBIN, Vector3 } from '@engine/core';
import { World } from '@engine/physics';
import { auditTime, map, Subscription, take, takeWhile, tap, timer } from 'rxjs';
import { GameObject } from '../game-object';

export interface GameObjectOptions {
  name?: string;
  object?: Sprite | Spacial;
  position?: Vector3;
  tag?: string;
}

export function Prefab(options?: GameObjectOptions) {
  return function <T extends { new(...args: any[]): any; }>(target: T) {
    Reflect.defineMetadata(GAME_OBJECT, target, target);
    return class GamePrefab extends target implements GameObject {

      readonly gameObjectType = 'gameObject';
      name = options?.name || 'GameObject';
      markedForDeletion = false;
      isActive = true;
      started = false;
      methods: string[] = [];
      object3d = options?.object?.object?.clone(true) ?? new Three.Object3D();
      tag = options?.tag ?? '';
      children: ObjectList<GameObject> = new ObjectList(this);
      startPosition = new Three.Vector3();

      #subscriptions: Subscription[] = [];

      get position() { return Vector3.fromThree(this.object3d?.position); }
      set position(value: Vector3) { this.object3d?.position.set(...value.toArray()); }

      get rotation() { return Euler.fromThree(this.object3d?.rotation); }
      set rotation(value: Euler) { this.object3d?.rotation.set(...value.toArray()); }

      constructor(...args: any[]) {
        super(...args);
        this.methods = Reflect.ownKeys(target.prototype) as string[];
        Engine.activeScene.addGameObject(this.object3d);
        this.position = options?.position ?? Vector3.zero;
      }
      /**
       * Run the GameObject's start.
       */
      onStart() {
        this.started = true;
        const p = this.object3d.position;
        this.startPosition.set(p.x, p.y, p.z);
        typeof super.onStart === 'function' && super.onStart();
        this.#addPhysicsBodies();
        this.#invokeRepeat();
        this.#invokeOnce();
        this.#watchChildren();
        this.#startAutoBurst();
        this.#startTimers();
      }
      /**
       * Run the GameObject's updates.
       */
      onUpdate() {
        if (this.isActive === false || this.started === false) return;
        typeof super.onUpdate === 'function' && super.onUpdate();
      }
      /**
       * Runs the GameObject's destroy method.
       */
      onDestroy() {
        if (this.markedForDeletion === true) {
          this.children.forEach((child) => child.onDestroy?.());
          typeof super.onDestroy === 'function' && super.onDestroy();
          this.object3d.parent?.remove(this.object3d);
          // this.destroyServices(this);
          Engine.destroyLocalService(this);
          this.#removeSubscriptions();
          return true;
        }
        return false;
      }

      #removeSubscriptions() {
        Object.keys(this).forEach(method => {
          const meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, target.prototype, method);
          if (typeof meta !== 'undefined' && this[method] instanceof ObjectList) {
            this[method].destroy();
          }
        });
        this.#subscriptions.forEach(e => e?.unsubscribe());
        this.children.destroy();
      }

      #invokeRepeat() {
        this.methods.forEach(method => {
          Reflection.call<{ delay?: number; interval?: number; times?: number; }>(
            i => typeof i.delay === 'number' && typeof i.interval === 'number' && typeof i.times === 'number' && typeof super[method] === 'function',
            i => {
              const t = timer(i.delay! * 1000, i.interval! * 1000)
                .pipe(map<number, boolean>(i => super[method](i)));

              const sub = (
                (i.times !== Infinity && i.times! > 0) ?
                  // Run until repeat has hit its max.
                  t.pipe(take(i.times!)) :
                  // Run until the callback returns false.
                  t.pipe(takeWhile(i => i !== false))
              ).subscribe();
              this.#subscriptions.push(sub);
            },
            TIME_REPEAT, target.prototype, method
          );
        });
      }

      #invokeOnce() {
        this.methods.forEach(method => {
          const delay = Reflect.getMetadata(TIME_ONCE, target.prototype, method);
          Reflection.call(
            v => typeof super[method] === 'function',
            () => { timer(delay * 1000).subscribe(() => super[method]()); },
            TIME_ONCE, target.prototype, method
          );
        });
      }

      #addPhysicsBodies() {
        import('@engine/physics').then(physics => {
          if (!physics) return;
          if (Reflect.hasMetadata(PHYSICS_RIGIDBODY, target)) {
            const world = Injector.create(physics.World).get(physics.World) as World;
            world.add(this);
          }
        });
      }

      #watchChildren() {
        const props = Object.keys(this) as string[];
        for (let prop of props) {
          let meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, target.prototype, prop);
          if (typeof meta !== 'undefined') {
            this[prop] = new ObjectList(this, meta);
          }
        }
      }

      #startTimers() {
        this.methods.forEach(method => {
          // Start any randomly timers
          const random = Reflect.getMetadata(TIME_RANDOMLY, target.prototype, method);
          if (typeof random !== 'undefined') {
            super[method]();
          }

          // Start choice times
          const choice = Reflect.getMetadata(TIME_CHOICE, target.prototype, method);
          if (typeof choice !== 'undefined') {
            super[method]();
          }

          // Start round robin times
          const roundRobin = Reflect.getMetadata(TIME_ROUND_ROBIN, target.prototype, method);
          if (typeof roundRobin !== 'undefined') {
            super[method]();
          }
        });
      }

      #startAutoBurst() {
        this.methods.forEach(method => {
          Reflection.call<{ duration: number; rest: number; speed: number; limit: number; }>(
            v => typeof super[method] === 'function',
            v => {
              let isResting = false;
              let time = Date.now();
              let called = 0;
              const sub = Engine.updated$.pipe(
                auditTime(v.speed * 1000),
                tap(() => {
                  if (!isResting) {
                    super[method]();
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

              this.#subscriptions.push(sub);
            },
            TIME_AUTO_BURST, target.prototype, method
          );
        });
      };
    };
  };
};