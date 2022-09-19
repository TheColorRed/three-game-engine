import { Spacial } from '@engine/core';
import { Object3D, Scene as ThreeScene } from 'three';
import { Sprite } from '../2d';
import { GameCamera } from '../camera';
import { Type } from '../di';
import { Engine } from '../engine';

export interface SceneHierarchy {

}

export interface SceneOptions {
  hierarchy: (SceneHierarchy | Type<any>)[];
  cameras?: Type<GameCamera>[];
}

export interface GameScene {
  /** @internal */
  registeredGameObjects: SceneHierarchy;
  /** @internal */
  registeredCameras: Type<GameCamera>[];
  /** @internal */
  scene: ThreeScene;
  activeScene: boolean;
  addGameObject(gameObject?: Object3D | Sprite | Spacial): ThreeScene | undefined;
}

export function Scene(options?: SceneOptions) {
  return (target: new () => object) => {
    return class extends target implements GameScene {
      registeredGameObjects = options?.hierarchy || [];
      registeredCameras = options?.cameras || [];
      scene = new ThreeScene();
      activeScene = false;

      constructor(activate?: boolean) {
        super();
        Engine.gameScenes.push(this);

        if (activate === true) {
          this.setActive();
        }
      }
      /**
       * Activates the scene and deactivates the others.
       */
      setActive() {
        Engine.gameScenes.forEach(cam => cam.activeScene = false);
        this.activeScene = true;
      }

      addGameObject(gameObject?: Object3D | Sprite) {
        if (typeof gameObject === 'undefined') return;
        if (gameObject instanceof Sprite) {
          if (gameObject.object) return this.scene.add(gameObject.object);
          return;
        }
        return this.scene.add(gameObject);
      }

      setParent(gameObject: Object3D, parentObject: Object3D) {
        if (typeof gameObject === 'undefined' || typeof parentObject === 'undefined') return;
        parentObject.add(gameObject);
      }
    };

  };
}
