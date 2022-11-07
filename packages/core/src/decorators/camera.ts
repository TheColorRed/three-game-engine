import { Color } from '../classes/color/color';
import { GameCamera } from '../classes/game-camera';
import { Vector2, Vector3 } from '../classes/transforms/vector';
import { GAME_CAMERA } from '../tokens/game-object-tokens';
import { Newable } from '../types';
import { GameObjectOptions } from './game-object';

export type CameraType = 'orthographic' | 'perspective';

export interface CameraOptions extends GameObjectOptions {
  isMainCamera?: boolean;
  size?: Vector2 | number;
  projection?: CameraType;
  near?: number,
  far?: number;
  fov?: number;
  lookAt?: Vector3;
  background?: Color;
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