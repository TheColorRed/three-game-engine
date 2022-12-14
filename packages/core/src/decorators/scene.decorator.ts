// export interface SceneHierarchy { }

import { GameCamera } from '../classes/game-camera';
import { GameScene } from '../classes/game-scene';
import { Newable, Type } from '../types';

export interface SceneOptions {
  hierarchy: Newable<any>[];
  cameras?: Type<GameCamera>[];
  name: string;
}

export function Scene(options?: SceneOptions) {
  return (target: Newable<object>): any => {
    return class GameSceneComponent extends GameScene<object> {
      constructor() {
        super(target, options);
        // if (activate === true) {
        //   this.setActive();
        // }
      }
    };
  };
}
