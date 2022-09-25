import type { Type } from '@engine/core';
import { Engine } from '@engine/core';
import { GameCamera, GameScene } from '@engine/objects';

export interface SceneHierarchy { }

export interface SceneOptions {
  hierarchy: (SceneHierarchy | Type<any>)[];
  cameras?: Type<GameCamera>[];
}

export function Scene(options?: SceneOptions) {
  return (target: new () => object) => {
    return class extends GameScene<object> {
      constructor(activate?: boolean) {
        super(target, options);
        Engine.gameScenes.push(this);

        if (activate === true) {
          this.setActive();
        }
      }
    };
  };
}
