import { Vector2 } from 'three';
import { GameCamera } from '../classes';
import { Newable } from '../di';
import { GAME_CAMERA } from '../tokens';
import { GameObjectOptions } from './prefab';

export type CameraType = 'orthographic' | 'perspective';

export interface CameraOptions extends GameObjectOptions {
  isMainCamera?: boolean;
  size?: Vector2 | number;
  projection?: CameraType;
  near?: number,
  far?: number;
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