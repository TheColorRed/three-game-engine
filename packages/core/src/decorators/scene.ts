import { GameCamera, GameScene } from '../classes';
import { Newable, Type } from '../di';

export interface SceneHierarchy { }

export interface SceneOptions {
  hierarchy: (SceneHierarchy | Type<any>)[];
  cameras?: Type<GameCamera>[];
}

export function Scene(options?: SceneOptions) {
  return (target: Newable<object>) => {
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
