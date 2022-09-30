import { Subscription } from 'rxjs';
import { GameObjectOptions } from '../decorators/prefab';
import { Injector } from '../di';
import { OnDestroy, OnStart, OnUpdate } from '../interfaces';
import { ObjectList } from '../object-list';
import { GameObjectRef } from '../services/game-object-ref.service';
import { Three } from '../three';
import { Quaternion } from '../transforms';
import { Euler } from '../transforms/euler';
import { Vector3 } from '../transforms/vector';

export abstract class GameObject<T extends { new(...args: any[]): any; } = any> implements OnStart, OnUpdate, OnDestroy {

  injector: Injector<any>;
  instance: any;
  subscriptions: Subscription[] = [];

  readonly gameObjectType: 'gameObject' | 'camera' = 'gameObject';
  name = '';
  markedForDeletion = false;
  isActive = false;
  /** The position of the object in world space. */
  get position() { return Vector3.fromThree(this.object3d?.position); }
  set position(value: Vector3) { this.object3d?.position.set(...value.toArray()); }
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
    this.injector = Injector.create(this.target);
    this.instance = this.injector.get(this.target);
    this.name = options?.name ?? 'GameObject';
    this.object3d = options?.object?.object?.clone(true) ?? new Three.Object3D();
    this.position = options?.position ?? Vector3.zero;

    this.rotation = (typeof options?.rotation === 'number' ? new Euler(0, 0, options.rotation) : options?.rotation) ?? Euler.zero;

    const p = this.position;
    this.startPosition.set(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);
    // console.log(this.name, p);

    this.#setGameObjects(this.injector);
  }

  #updateSprite() {
    if (this.object3d instanceof Three.Sprite) {
      this.object3d.material.rotation = this.rotation.z;
    }
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