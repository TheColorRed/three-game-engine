import { Engine, Injectable, Three, Vector3 } from '@engine/core';

@Injectable({ providedIn: 'game' })
export class CameraService {

  get activeCamera() {
    return Engine.activeCamera;
  }

  mouseToWorldPoint(mousePoint: Vector3) {
    if (this.activeCamera) {

      const vec = new Three.Vector3();
      const camera = this.activeCamera.camera;
      var x = 0, y = 0, z = 0;

      // console.log(camera instanceof OrthographicCamera, camera);

      // Calculations using an orthographic camera
      if (camera instanceof Three.OrthographicCamera) {
        vec.set(
          (mousePoint.x / Engine.canvas.width) * 2 - 1,
          - (mousePoint.y / Engine.canvas.height) * 2 + 1,
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