import { GameObject } from '../classes';
import { Injectable, Injector, Newable } from '../di';

@Injectable({ providedIn: 'game' })
export class GameObjectManager {
  gameObjects: GameObject[] = [];

  instantiate(item: Newable<GameObject>) {
    const injector = Injector.create(item);
    const gameObject = injector.get(item) as GameObject;

    this.gameObjects.push(gameObject);
    return gameObject;
  }

  static isGameObject(type: GameObject): type is GameObject {
    return type.gameObjectType === 'gameObject';
  }
}