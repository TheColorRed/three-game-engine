// import { Engine, OrthographicCamera } from '@engine/core';
import { Engine, Three, Vector2, Vector3 } from '@engine/core';
import { GameObject, GameObjectOptions } from '@engine/objects';

export type CameraType = 'orthographic' | 'perspective';
export interface GameCamera extends GameObject {
  readonly camera: Three.Camera;
  get aspect(): number;
}

export interface CameraOptions extends GameObjectOptions {
  isMainCamera?: boolean;
  size?: Vector2 | number;
  projection?: CameraType;
  near?: number,
  far?: number;
}

export function Camera(options?: CameraOptions) {
  return function (target: new () => object): any {
    return class GameCameraComponent extends GameObject implements GameCamera {
      override readonly gameObjectType = 'camera';
      readonly camera!: Three.Camera;

      readonly #aspectRatio = Engine.game.aspect ?? 1.7777777777777777;
      readonly #size;
      readonly #width;
      readonly #height;

      /** Whether or not this is the main camera. */
      readonly isMainCamera;
      get aspect() {
        return this.#aspectRatio;
      }

      constructor() {
        super(target, options);

        this.#size = options?.size && typeof options.size === 'object' ?
          options.size.x :
          typeof options?.size === 'number' ?
            options.size : 5;

        this.#width = typeof options?.size === 'number' ?
          options.size :
          options?.size instanceof Vector3 ?
            options.size.x : 5;

        this.#height = typeof options?.size === 'number' ?
          this.#size / this.#aspectRatio :
          options?.size instanceof Vector3 ?
            options.size.y :
            this.#size * this.#aspectRatio;

        const dim = this.#cameraDimensions();

        // Engine.camera.main;

        this.isMainCamera = options?.isMainCamera ?? false;

        // create the Three camera
        this.camera = options?.projection === 'orthographic' || typeof options?.projection === 'undefined' ?
          new Three.OrthographicCamera(dim.left, dim.right, dim.top, dim.bottom, options?.near ?? 0, options?.far ?? 100) :
          new Three.PerspectiveCamera(60, this.#width / this.#height, 0.1, 1000);

        // Set the initial position of the camera
        // this.position = options?.position ?? Vector3.zero;
        // this.startPosition = this.position.three();
      }

      #cameraDimensions() {
        // console.log(this.#width, this.#height, this.#width / this.#height);
        const left = this.#width / -2;
        const right = this.#width / 2;
        const top = this.#height / 2;
        const bottom = this.#height / -2;
        return { left, right, top, bottom };
      }

      // onStart() {
      //   this.started = true;
      // }
      override onUpdate() {
        // console.log(this.markedForDeletion);
      }
    };
  };
}