import { Color } from '../classes/color/color';
import { GameObjectBase } from '../classes/game-object';
import { Three } from '../three';
import { GAME_LIGHT } from '../tokens/game-object-tokens';
import { Newable } from '../types';
import { GameObjectOptions } from './game-object';


export type LightType = 'directional' | 'ambient' | 'spot' | 'point';

export class GameLight extends GameObjectBase {
  type: LightType;
  color: Color;
  intensity: number;

  constructor(target: Newable<object>, options?: GameLightOptions) {
    super(target, options);
    this.type = options?.type ?? 'directional';
    this.color = options?.color ?? Color.white;
    this.intensity = options?.intensity ?? 1;

    this.object3d = new Three.DirectionalLight(this.color.threeColor, this.intensity);
  }

}

export interface GameLightOptions extends GameObjectOptions {
  type?: LightType;
  color?: Color;
  intensity?: number;
}

export function Light(options?: GameLightOptions) {
  return function (target: Newable<object>): any {
    Reflect.defineMetadata(GAME_LIGHT, options, target);
    return class GameLightComponent extends GameLight {
      constructor() {
        super(target, options);
      }
    };
  };
}