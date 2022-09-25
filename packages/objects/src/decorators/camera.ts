// import { Engine, OrthographicCamera } from '@engine/core';
import { Vector2 } from '@engine/core';
import { GameCamera, GameObjectOptions } from '@engine/objects';

export type CameraType = 'orthographic' | 'perspective';

export interface CameraOptions extends GameObjectOptions {
  isMainCamera?: boolean;
  size?: Vector2 | number;
  projection?: CameraType;
  near?: number,
  far?: number;
}

export function Camera(options?: CameraOptions) {
  return function (target: new () => object): any {
    return class GameCameraComponent extends GameCamera {
      constructor() {
        super(target, options);
      }
    };
  };
}