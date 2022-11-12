import { GameObjectBase } from '../classes/game-object';
import { Euler } from '../classes/transforms/euler';
import { Vector3 } from '../classes/transforms/vector';
import { Resource } from '../resource/resource';
import { Three } from '../three';
import { GAME_OBJECT } from '../tokens/game-object-tokens';
import { Newable } from '../types';

export interface GameObjectOptions {
  name?: string;
  object?: Resource | (() => Three.Object3D);
  position?: Vector3;
  rotation?: Euler | number;
  tag?: string;
  is2D?: boolean;
  components?: Newable<object>[];
}

export function GameObject(options?: GameObjectOptions) {
  return function (target: Newable<object>): any {
    Reflect.defineMetadata(GAME_OBJECT, options, target);
    return class GameObjectComponent extends GameObjectBase {
      constructor() {
        super(target, options);
        this.methods = Reflect.ownKeys(this.target.prototype) as string[];
      }
    };
  };
};