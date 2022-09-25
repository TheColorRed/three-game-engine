import { Engine, Injectable, Three, Vector3 } from '@engine/core';
import { GameCamera, GameObject } from '@engine/objects';

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
  main?: GameObject;
  /** The camera that is currently active. */
  activeCamera?: GameCamera;
  /** All of the current cameras. */
  get cameras() { return Engine.gameObjects.filter(o => o.gameObjectType === 'camera'); }

  constructor() {
    this.main = Engine.gameObjects.find(o => o.gameObjectType === 'camera' && 'isMainCamera' in o && o.isMainCamera === true);
    this.activeCamera = Engine.gameObjects.find(o => o.gameObjectType === 'camera' && o.isActive) as GameCamera;
  }
  /**
   * Disables all other cameras and makes this the active one.
   * @param gameObject The camera to make active.
   * @returns
   */
  setActiveCamera(gameObject: GameObject) {
    if (gameObject.gameObjectType !== 'camera') return;
    this.cameras.forEach(cam => cam.isActive = false);
    gameObject.isActive = true;
  }
  /**
   * Gets a world point from a coordinate on the canvas (Requires an active camera).
   * @param point The position of a point on the canvas.
   * @returns
   */
  canvasToWorldPoint(point: Vector3) {
    if (this.activeCamera) {
      const vec = new Three.Vector3();
      const camera = this.activeCamera.camera;
      var x = 0, y = 0, z = 0;

      // Calculations using an orthographic camera
      if (camera instanceof Three.OrthographicCamera) {
        vec.set(
          (point.x / Engine.canvas.width) * 2 - 1,
          - (point.y / Engine.canvas.height) * 2 + 1,
          0.5
        );
        var { x, y, z } = vec.unproject(camera);
      }
      // Calculations using a perspective camera
      else {
        const pos = new Three.Vector3();
        vec.sub(camera.position).normalize();
        const distance = - camera.position.z / vec.z;
        var { x, y, z } = pos.copy(camera.position).add(vec.multiplyScalar(distance));
      }
      return new Vector3(x, y, z);
    }
    return Vector3.zero;
  }
}