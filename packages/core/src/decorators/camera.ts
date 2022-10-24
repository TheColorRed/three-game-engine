import { GameCamera } from '../classes/game-camera';
import { Newable } from '../di/types';
import { GAME_CAMERA } from '../tokens/game-object-tokens';
import { Vector2, Vector3 } from '../transforms/vector';
import { GameObjectOptions } from './prefab';

export type CameraType = 'orthographic' | 'perspective';

export interface CameraOptions extends GameObjectOptions {
  isMainCamera?: boolean;
  size?: Vector2 | number;
  projection?: CameraType;
  near?: number,
  far?: number;
  fov?: number;
  lookAt?: Vector3;
}

export function Camera(options?: CameraOptions) {
  return function (target: Newable<object>): any {
    Reflect.defineMetadata(GAME_CAMERA, options, target);
    return class GameCameraComponent extends GameCamera {
      constructor() {
        super(target, options);
      }
    };
  };
}