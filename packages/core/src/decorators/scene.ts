import type { GameCamera, Spacial, Type } from '..';
import { Engine, Sprite, Three } from '..';

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
  scene: Three.Scene;
  activeScene: boolean;
  addGameObject(gameObject?: Three.Object3D | Sprite | Spacial): Three.Scene | undefined;
}

export function Scene(options?: SceneOptions) {
  return (target: new () => object) => {
    return class extends target implements GameScene {
      registeredGameObjects = options?.hierarchy || [];
      registeredCameras = options?.cameras || [];
      scene = new Three.Scene();
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

      addGameObject(gameObject?: Three.Object3D | Sprite) {
        if (typeof gameObject === 'undefined') return;
        if (gameObject instanceof Sprite) {
          if (gameObject.object) return this.scene.add(gameObject.object);
          return;
        }
        return this.scene.add(gameObject);
      }

      setParent(gameObject: Three.Object3D, parentObject: Three.Object3D) {
        if (typeof gameObject === 'undefined' || typeof parentObject === 'undefined') return;
        parentObject.add(gameObject);
      }
    };

  };
}
