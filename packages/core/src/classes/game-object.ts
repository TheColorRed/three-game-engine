import { auditTime, forkJoin, map, Observable, Subscription, take, takeWhile, tap, timer } from 'rxjs';
import { Euler } from '../classes/transforms/euler';
import { Quaternion } from '../classes/transforms/quaternion';
import { Vector3 } from '../classes/transforms/vector';
import { GameObjectOptions } from '../decorators/game-object';
import { Injector } from '../di/injector';
import { Reflection } from '../di/reflection';
import { OnDestroy, OnStart, OnUpdate } from '../interfaces/event-loop';
import { GameComponentBase } from '../public';
import { Resource } from '../resource/resource';
import { GameLoop } from '../services/game-loop.service';
import { GameObjectRef } from '../services/game-object-ref.service';
import { SceneManager } from '../services/scene-manager.service';
import { Three } from '../three';
import { GAME_OBJECT_CHILDREN } from '../tokens/game-object-tokens';
import { TIME_AUTO_BURST, TIME_CHOICE, TIME_ONCE, TIME_RANDOMLY, TIME_REPEAT, TIME_ROUND_ROBIN } from '../tokens/timing-tokens';
import { Destroyable, Newable } from '../types';
import { ObjectList } from './object-list';

export interface GameObjectAndComponentMethodInfo {
  instance: any;
  prototype: object;
  props: string[];
}

export abstract class GameObjectBase<T extends Newable<T> = any> implements OnStart, OnUpdate, OnDestroy {

  injector: Injector<any>;
  gameLoop = Injector.get(GameLoop)!;
  sceneManager = Injector.get(SceneManager)!;
  instance: any;
  subscriptions: Subscription[] = [];

  readonly gameObjectType = 'gameObject';
  name = '';
  markedForDeletion = false;
  isActive = false;
  /** The position of the object in world space. */
  get localPosition() { return Vector3.fromThree(this.object3d?.position); }
  set localPosition(value: Vector3) { this.object3d?.position.set(...value.toArray()); }
  get position() { return Vector3.fromThree(this.object3d?.getWorldPosition(new Three.Vector3())); }
  set position(value: Vector3) {
    const root = this.sceneManager.rootScene;
    const parent = this.object3d.parent;
    if (root && parent) {
      root.attach(this.object3d);
      this.object3d.position.set(...value.toArray());
      parent.attach(this.object3d);
    }
  }
  /** The rotation of the object in world space. */
  get rotation() {
    let rot = this.object3d?.rotation;
    return Euler.fromThree(rot);
  }
  set rotation(value: Euler) {
    // if (this.object3d instanceof Three.Sprite) {
    //   if (this.name === 'Player') console.log((Math.PI / 180) * value.z);
    //   this.object3d.material.rotation = value.z * (Math.PI / 180);
    // }
    this.object3d?.rotation.set(...value.toArray());
    this.#updateSprite();
  }
  /** The object quaternion. */
  get quaternion() {
    const q = this.object3d?.quaternion;
    return Quaternion.fromThree(q);
  }
  set quaternion(value: Quaternion) {
    this.object3d?.quaternion.set(...value.toArray());
    this.#updateSprite();
    // this.rotation = Euler.fromThree(new Three.Euler().setFromQuaternion(value.toThree()));
  }

  tag: string = '';
  /** The reference to the Three.js object. */
  object3d: Three.Object3D;
  /** The resource for the object. */
  resource?: Resource | (() => Three.Object3D);
  /** @internal */
  started = false;
  /** @internal */
  startPosition: Three.Vector3 = new Three.Vector3(0, 0, 0);
  /** @internal */
  methods: string[] = [];
  /** @internal */
  children: ObjectList<GameObjectBase> = new ObjectList(this);
  components: GameComponentBase[] = [];

  constructor(readonly target: T, protected options?: GameObjectOptions) {
    this.injector = Injector.create(this.target);
    this.instance = this.injector.get(this.target);
    for (let comp of (options?.components ?? [])) {
      const injector = Injector.create(comp);
      const base = injector.get(comp) as GameComponentBase;
      this.#setGameObjectRefs(base.injector);
      this.components.push(base);
    }

    this.name = options?.name ?? 'GameObject';
    this.resource = options?.object;
    this.object3d = this.#getObject();
    this.position = options?.position ?? Vector3.zero;

    this.rotation = (typeof options?.rotation === 'number' ? new Euler(0, 0, options.rotation * Math.PI / 180) : options?.rotation) ?? Euler.zero;

    const p = this.position;
    this.startPosition.set(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);

    this.#setGameObjectRefs(this.injector);
  }

  #getObject() {
    if (typeof this.resource === 'function') {
      return this.resource();
    }
    return this.resource?.object.clone() ?? new Three.Object3D();
  }

  #updateSprite() {
    if (this.object3d instanceof Three.Sprite) {
      this.object3d.material.rotation = this.rotation.z;
    }
  }

  #setGameObjectRefs(injector: Injector<any>) {
    const refs = injector.getAll(GameObjectRef);
    refs.forEach(ref => ref.reference = this);
  }
  /**
   * Run the GameObject's start.
   */
  onStart() {
    // super.onStart();
    this.started = true;
    forkJoin([this.#addPhysics3D(), this.#addPhysics2D()]).pipe(
      tap(() => {
        typeof this.instance.onStart === 'function' && this.instance.onStart();
        this.#startComponents();
        this.isActive = true;
        this.#invokeRepeat();
        this.#invokeOnce();
        this.#watchChildren();
        this.#startAutoBurst();
        this.#startTimers();
      })
    ).subscribe();
  }
  /**
   * Run the GameObject's updates.
   */
  onUpdate() {
    this.#startComponents();
    if (this.isActive === false || this.started === false) return;
    typeof this.instance.onUpdate === 'function' && this.instance.onUpdate();
    for (let comp of this.components) {
      typeof comp.instance.onUpdate === 'function' && comp.instance.onUpdate();
    }
  }
  /**
   * Run the GameObject's animation frames.
   */
  onFrame() {
    if (this.isActive === false || this.started === false) return;
    typeof this.instance.onFrame === 'function' && this.instance.onFrame();
  }
  /**
   * Runs the GameObject's destroy method.
   */
  onDestroy() {
    if (this.markedForDeletion === true) {
      this.children.forEach((child) => child.onDestroy?.());
      for (let comp of this.components) {
        typeof comp.instance.onDestroy === 'function' && comp.instance.onDestroy();
      }
      // Destroy the GameObject last.
      typeof this.instance.onDestroy === 'function' && this.instance.onDestroy();

      // this.destroyServices(this);
      this.#removeBody2D();
      this.#destroyLocalService(this.injector);
      this.#removeSubscriptions();
      return true;
    }
    return false;
  }

  addComponent(comp: Newable<object>) {
    const injector = Injector.create(comp);
    const component = injector.get(comp) as GameComponentBase;
    this.#setGameObjectRefs(injector);
    this.components.push(component);
    return component.instance;
  }

  #startComponents() {
    for (let comp of this.components) {
      if (comp.started === false) {
        comp.started = true;
        typeof comp.instance.onStart === 'function' && comp.instance.onStart();
      }
    }
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
    const methods = this.getMethodList();
    methods.forEach(method => {
      const prototype = method.prototype;
      const instance = method.instance;
      method.props.forEach(prop => {
        const i = Reflect.getMetadata(TIME_REPEAT, prototype, prop);
        if (typeof i !== 'undefined') {
          const t = timer(i.delay! * 1000, i.interval! * 1000)
            .pipe(map<number, boolean>(i => instance[prop](i)));

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
    });
  }

  #invokeOnce() {
    const methods = this.getMethodList();
    methods.forEach(method => {
      const prototype = method.prototype;
      const instance = method.instance;
      method.props.forEach(prop => {
        const delay = Reflect.getMetadata(TIME_ONCE, prototype, prop);
        if (typeof delay === 'number' && typeof instance[prop] === 'function') {
          timer(delay * 1000).subscribe(() => instance[prop]());
        }
      });
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
    const methods = this.getMethodList();
    methods.forEach(method => {
      const prototype = method.prototype;
      const instance = method.instance;
      method.props.forEach(prop => {
        // Start any randomly timers
        const random = Reflect.getMetadata(TIME_RANDOMLY, prototype, prop);
        if (typeof random !== 'undefined') {
          instance[prop]();
        }

        // Start choice times
        const choice = Reflect.getMetadata(TIME_CHOICE, prototype, prop);
        if (typeof choice !== 'undefined') {
          instance[prop]();
        }

        // Start round robin times
        const roundRobin = Reflect.getMetadata(TIME_ROUND_ROBIN, prototype, prop);
        if (typeof roundRobin !== 'undefined') {
          instance[prop]();
        }
      });
    });
  }

  #startAutoBurst() {
    const methods = this.getMethodList();
    methods.forEach(method => {
      const prototype = method.prototype;
      const instance = method.instance;
      method.props.forEach(prop => {
        Reflection.call<{ duration: number; rest: number; speed: number; limit: number; }>(
          v => typeof instance[prop] === 'function',
          v => {
            let isResting = false;
            let time = Date.now();
            let called = 0;
            const sub = this.gameLoop.updated$.pipe(
              auditTime(v.speed * 1000),
              tap(() => {
                if (!isResting) {
                  instance[prop]();
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
          TIME_AUTO_BURST, prototype, prop
        );
      });
    });
  };
  /**
   * Gets information about the instance and all of its components.
   */
  getMethodList() {
    const components = this.components.map(c => ({
      prototype: Object.getPrototypeOf(c.instance),
      instance: c.instance,
      props: Object.getOwnPropertyNames(Object.getPrototypeOf(c.instance))
    }));
    components.push({
      prototype: this.target.prototype,
      instance: this.instance,
      props: Object.getOwnPropertyNames(this.target.prototype)
    });
    return components as GameObjectAndComponentMethodInfo[];
  }
}