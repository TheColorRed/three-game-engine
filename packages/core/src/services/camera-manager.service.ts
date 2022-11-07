import { Vector2 } from '@engine/core';
import { Subject } from 'rxjs';
import { GameCamera } from '../classes/game-camera';
import { Vector3 } from '../classes/transforms/vector';
import { Injectable } from '../di/injectable';
import { Injector } from '../di/injector';
import { GameConfig } from '../services/game-config.service';
import { Three } from '../three';
import { Newable } from '../types';

/**
 * The camera service is a singleton service that provides features for accessing, managing, and manipulating game cameras.
 *
 * @example
 * export class Example {
 *   constructor(private readonly camera: CameraService) { }
 * }
 */
@Injectable({ providedIn: 'game' })
export class CameraManager {
  /** The main camera. */
  get main() { return this.#gameCameras.find(o => o.isMainCamera) as GameCamera; }
  /** A list of camera instances. */
  #gameCameras: GameCamera[] = [];
  /** All of the current cameras. */
  get cameras() { return this.#gameCameras; }
  /** Gets an array of all active cameras. */
  get activeCameras() { return this.#gameCameras.filter(o => o.isActive) as GameCamera[]; }

  private cameraChange = new Subject<GameCamera>();
  cameraChange$ = this.cameraChange.asObservable();

  private config = Injector.get(GameConfig)!;

  instantiate(item: Newable<GameCamera>, makeActive: boolean = false) {
    const injector = Injector.create(item);
    const camera = injector.get(item) as GameCamera;

    this.#gameCameras.push(camera);
    (makeActive || camera.isMainCamera) && this.setActiveCamera(camera);

    return camera;
  }
  /**
   * Checks to see if the game object is a camera type of game object.
   * @param object The object to check.
   * @returns
   */
  static isCamera(object: any): object is GameCamera {
    return 'gameObjectType' in object && object.gameObjectType === 'camera';
  }

  static isNewableGameCamera(item: Newable<any>): item is Newable<GameCamera<any>> {
    const namedClasses = ['GameCameraComponent'];
    return namedClasses.includes(item.name);
  }
  /**
   * Disables all other cameras and makes this the active one.
   * @param gameObject The camera to make active.
   * @returns
   */
  setActiveCamera(gameObject: GameCamera, disableOthers = false) {
    disableOthers && this.cameras.forEach(cam => cam.isActive = false);
    gameObject.isActive = true;
    this.cameraChange.next(gameObject);
  }
  /**
   * Gets a world point from a coordinate on the canvas (Requires an active camera).
   * @param point The position of a point on the canvas.
   * @returns
   */
  canvasToWorldPoint(point: Vector2, camera?: GameCamera) {
    camera = typeof camera === 'undefined' ? this.main : camera;
    if (!camera?.camera) return Vector3.zero;
    const vec = new Three.Vector3();
    const pos = new Three.Vector3();
    // const camera = this.activeCamera.camera;
    var x = 0, y = 0, z = 0;

    // Calculations using an orthographic camera
    if (camera.camera instanceof Three.OrthographicCamera) {
      // vec.set(
      //   (point.x / Engine.canvas.width) * 2 - 1,
      //   - (point.y / Engine.canvas.height) * 2 + 1,
      //   0.5
      // );
      var { x, y, z } = vec.unproject(camera.camera);
    }
    // Calculations using a perspective camera
    else {
      const canvas = this.config.get('canvas');
      vec.set(
        (point.x / canvas.width) * 2 - 1,
        -(point.y / canvas.height) * 2 + 1,
        0.5
      );


      vec.unproject(camera.camera);
      vec.sub(camera.camera.position);
      const distance = - camera.camera.position.z / vec.z;
      return Vector3.fromThree(pos.copy(camera.camera.position).add(vec.multiplyScalar(distance)));


      // const pos = new Three.Vector3();
      // vec.sub(camera.camera.position).normalize();
      // const distance = - camera.camera.position.z / vec.z;
      // var { x, y, z } = pos.copy(camera.camera.position).add(vec.multiplyScalar(distance));
      // console.log(x, y, z);
    }
    return new Vector3(x, y, z);
    // return Vector3.zero;
  }
}