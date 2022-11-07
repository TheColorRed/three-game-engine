import { GameObjectBase } from '../classes/game-object';
import { Injectable } from '../di/injectable';
import { Injector } from '../di/injector';
import { Resource } from '../resource/resource';
import { GAME_OBJECT_CHILDREN } from '../tokens/game-object-tokens';
import { Newable } from '../types';

@Injectable({ providedIn: 'game' })
export class GameObjectManager {
  gameObjects: GameObjectBase[] = [];

  constructor() {
    // @ts-ignore
    window.gameObjectManager = this;
  }

  instantiate(item: Newable<GameObjectBase>) {
    const injector = Injector.create(item);
    const gameObject = injector.get(item) as GameObjectBase;

    this.gameObjects.push(gameObject);
    return gameObject;
  }

  static isGameObject(type: GameObjectBase): type is GameObjectBase {
    return type.gameObjectType === 'gameObject';
  }

  static isNewableGameObject(item: Newable<any>): item is Newable<GameObjectBase> {
    const namedClasses = ['GameObjectComponent', 'ParticleSystemComponent', 'GameLightComponent'];
    return namedClasses.includes(item.name);
  }

  destroy(obj: GameObjectBase) {
    // try {
    //   import('@engine/physics').then(physics => {
    //     const p = Reflect.getMetadata(physics.PHYSICS_RIGIDBODY, obj.instance.constructor);
    //     if (typeof p !== 'undefined') {
    //       const world = Injector.get(physics.World);
    //       world?.remove(obj);
    //     }
    //   });
    // } catch (e) { console.error(e); }
    this.#deleteAllGameObjectRefs(obj);
    this.removeThreeObject(obj);
    const idx = this.gameObjects.indexOf(obj);
    idx > -1 && this.gameObjects.splice(idx, 1);
  }

  removeThreeObject(gameObject?: GameObjectBase) {
    if (typeof gameObject === 'undefined') return;
    const obj = this.gameObjects.find(go => go === gameObject);
    if (typeof obj === 'undefined') return;
    if (obj.resource instanceof Resource) {
      obj.resource.destroy();
    }
    obj.object3d?.parent?.remove(obj.object3d);
    // obj.object3d = undefined;
  }

  #deleteAllGameObjectRefs(obj: GameObjectBase) {
    for (let gameObject of this.gameObjects) {
      gameObject.children.setDirty();
      for (let method in gameObject) {
        let meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, gameObject, method);
        if (typeof meta !== 'undefined') {
          (gameObject as any)[method].setDirty();
        }
      }
      // gameObject.children.remove(obj);
      // gameObject.children = gameObject.children.filter(i => i !== obj);
    }
  }
}