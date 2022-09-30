import { GameObject } from '../classes/game-object';
import { CameraOptions } from '../decorators/camera';
import { Injector } from '../di';
import { GameConfig } from '../services';
import { Three } from '../three';
import { Vector3 } from '../transforms';


export abstract class GameCamera<T = object> extends GameObject {
  override readonly gameObjectType = 'camera';
  readonly camera!: Three.Camera;
  /** Whether or not this is the main camera. */
  readonly isMainCamera;
  readonly #aspectRatio = Injector.get(GameConfig)?.get('aspect') ?? 1.7777777777777777;
  readonly #size;
  readonly #width;
  readonly #height;
  get aspect() {
    return this.#aspectRatio;
  }

  constructor(target: T, options?: CameraOptions) {
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
}