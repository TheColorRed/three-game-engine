import { CameraOptions } from '../decorators/camera';
import { Injector } from '../di/injector';
import { Newable } from '../di/types';
import { GameConfig } from '../services/game-config.service';
import { Three } from '../three';
import { Euler } from '../transforms/euler';
import { Vector3 } from '../transforms/vector';


export abstract class GameCamera<T = object> {
  injector: Injector<any>;
  instance: any;
  /** The reference to the threejs game camera. */
  readonly camera!: Three.Camera;
  /** Whether or not this is the main camera. */
  readonly isMainCamera;
  isActive = false;
  #gameConfig = Injector.get(GameConfig)!;
  readonly #aspectRatio = this.#gameConfig.get('aspect') ?? 1.7777777777777777;
  #size = 0;
  #width = 0;
  #height = 0;
  get aspect() {
    return this.#aspectRatio;
  }

  constructor(
    private readonly target: Newable<T>,
    private readonly options?: CameraOptions
  ) {
    this.injector = Injector.create(target);
    this.instance = this.injector.get(target);

    this.isMainCamera = options?.isMainCamera ?? false;
    let camera: Three.Camera;

    if (options?.projection === 'perspective') {
      camera = this.#setupProjectionCamera();
    } else {
      camera = this.#setupOrthographicCamera();
    }

    const lookAt = options?.lookAt ?? Vector3.zero;

    if (options?.position) camera.position.set(...options.position.toArray());
    if (options?.rotation && options.rotation instanceof Euler) camera.rotation.set(...options.rotation.toArray());
    camera.lookAt(...lookAt.toArray());

    this.camera = camera;
  }

  #cameraDimensions() {
    // console.log(this.#width, this.#height, this.#width / this.#height);
    const left = this.#width / -2;
    const right = this.#width / 2;
    const top = this.#height / 2;
    const bottom = this.#height / -2;
    return { left, right, top, bottom };
  }

  #setupProjectionCamera() {
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;
    const options = this.options as CameraOptions;
    return new Three.PerspectiveCamera(options?.fov ?? 60, this.#width / this.#height, options?.near ?? 0.1, options?.far ?? 1000);
  }

  #setupOrthographicCamera() {
    const options = this.options as CameraOptions;
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

    // create the Three camera
    return new Three.OrthographicCamera(dim.left, dim.right, dim.top, dim.bottom, options?.near ?? 0, options?.far ?? 100);
  }
}