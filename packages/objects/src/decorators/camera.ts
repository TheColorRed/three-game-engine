// import { Engine, OrthographicCamera } from '@engine/core';
import { Engine, Euler, ObjectList, OnStart, Three, Vector2, Vector3 } from '@engine/core';
import { GameObject } from '../game-object';

export type CameraType = 'orthographic' | 'perspective';

export interface CameraOptions {
  position: Vector3;
  size?: Vector2 | number;
  projection?: CameraType;
  name?: string;
  near?: number,
  far?: number;
  tag?: string | 'MainCamera';
}

export function Camera(options?: CameraOptions) {
  return function (target: new () => object) {
    return class GameCamera extends target implements GameObject, GameCamera, OnStart {
      readonly gameObjectType = 'camera';
      readonly camera!: Three.Camera;

      tag = options?.tag ?? 'MainCamera';
      name = options?.name || 'GameObject';
      markedForDeletion = false;
      isActive = true;
      started = false;
      methods: string[] = [];
      object3d = this.camera;
      children: ObjectList<any> = new ObjectList(this);
      startPosition = new Three.Vector3();

      readonly #aspectRatio = Engine.game.aspect ?? 1.7777777777777777;
      readonly #size = options?.size && typeof options.size === 'object' ?
        options.size.x :
        typeof options?.size === 'number' ?
          options.size : 5;

      readonly #width = typeof options?.size === 'number' ?
        options.size :
        options?.size instanceof Vector3 ?
          options.size.x : 5;

      readonly #height = typeof options?.size === 'number' ?
        this.#size / this.#aspectRatio :
        options?.size instanceof Vector3 ?
          options.size.y :
          this.#size * this.#aspectRatio;

      /** Whether or not this is the main camera. */
      get isMainCamera() {
        return this.tag === 'MainCamera';
      }
      get aspect() {
        return this.#aspectRatio;
      }

      get position() { return Vector3.fromThree(this.object3d?.position); }
      set position(value: Vector3) { this.object3d?.position.set(...value.toArray()); }

      get rotation() { return Euler.fromThree(this.object3d?.rotation); }
      set rotation(value: Euler) { this.object3d?.rotation.set(...value.toArray()); }

      constructor() {
        super();
        const dim = this.#cameraDimensions();

        // create the Three camera
        this.camera = options?.projection === 'orthographic' || typeof options?.projection === 'undefined' ?
          new Three.OrthographicCamera(dim.left, dim.right, dim.top, dim.bottom, options?.near ?? 0, options?.far ?? 100) :
          new Three.PerspectiveCamera(60, this.#width / this.#height, 0.1, 1000);

        // Set the initial position of the camera
        this.position = options?.position ?? Vector3.zero;
        this.startPosition = this.position.three();
      }

      #cameraDimensions() {
        // console.log(this.#width, this.#height, this.#width / this.#height);
        const left = this.#width / -2;
        const right = this.#width / 2;
        const top = this.#height / 2;
        const bottom = this.#height / -2;
        return { left, right, top, bottom };
      }

      onStart() {
        this.started = true;
      }
    };
  };
}