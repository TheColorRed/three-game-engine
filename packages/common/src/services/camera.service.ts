import { Engine, Injectable, Vector3 } from '@engine/core';
import { OrthographicCamera, Vector3 as ThreeVector3 } from 'three';

@Injectable({ providedIn: 'root' })
export class Camera {

  get activeCamera() {
    return Engine.activeCamera;
  }

  mouseToWorldPoint(mousePoint: Vector3) {
    if (this.activeCamera) {

      const vec = new ThreeVector3();
      const camera = this.activeCamera.camera;
      var x = 0, y = 0, z = 0;

      // Calculations using an orthographic camera
      if (camera instanceof OrthographicCamera) {
        vec.set(
          (mousePoint.x / Engine.canvas.width) * 2 - 1,
          - (mousePoint.y / Engine.canvas.height) * 2 + 1,
          0.5
        );
        var { x, y, z } = vec.unproject(camera);
      }
      // Calculations using a perspective camera
      else {
        const pos = new ThreeVector3();
        vec.sub(camera.position).normalize();
        const distance = - camera.position.z / vec.z;
        var { x, y, z } = pos.copy(camera.position).add(vec.multiplyScalar(distance));
      }
      return new Vector3(x, y, z);
    }
    return Vector3.zero;
  }

}