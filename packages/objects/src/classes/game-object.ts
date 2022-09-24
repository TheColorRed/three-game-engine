import { GameObjectRef } from '@engine/common';
import { Euler, Injector, ObjectList, OnDestroy, OnStart, OnUpdate, Three, Vector3 } from '@engine/core';
import { GameObjectOptions } from '@engine/objects';
import { Subscription } from 'rxjs';

export abstract class GameObject<T extends { new(...args: any[]): any; } = any> implements OnStart, OnUpdate, OnDestroy {

  injector: Injector<any>;
  instance: any;
  subscriptions: Subscription[] = [];

  readonly gameObjectType: 'gameObject' | 'camera' = 'gameObject';
  name = '';
  markedForDeletion = false;
  isActive = false;

  get position() { return Vector3.fromThree(this.object3d?.position); }
  set position(value: Vector3) { this.object3d?.position.set(...value.toArray()); }

  get rotation() { return Euler.fromThree(this.object3d?.rotation); }
  set rotation(value: Euler) { this.object3d?.rotation.set(...value.toArray()); }

  tag: string = '';
  object3d?: Three.Object3D;
  /** @internal */
  started = false;
  /** @internal */
  startPosition: Three.Vector3 = new Three.Vector3(0, 0, 0);
  /** @internal */
  methods: string[] = [];
  /** @internal */
  children: ObjectList<GameObject> = new ObjectList(this);

  constructor(readonly target: T, options?: GameObjectOptions) {
    this.name = options?.name ?? 'GameObject';
    this.object3d = options?.object?.object?.clone(true) ?? new Three.Object3D();
    this.position = options?.position ?? Vector3.zero;
    this.rotation = options?.rotation ?? Euler.zero;
    this.injector = Injector.create(this.target);
    this.instance = this.injector.get(this.target);

    this.#setGameObjects(this.injector);
  }

  onStart(): void {
    this.started = true;
    this.isActive = true;
  };
  onUpdate(): void { };
  onDestroy(): boolean { return false; };

  #setGameObjects(injector: Injector<any>) {
    const refs = injector.getAll(GameObjectRef);
    refs.forEach(ref => ref.reference = this);
  }
}