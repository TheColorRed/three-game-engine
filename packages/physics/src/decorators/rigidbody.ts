import { GAME_OBJECT, PHYSICS_RIGIDBODY } from '@engine/core';
import { World } from '../world';

interface RigidbodyOptions {

}

export function Rigidbody(options?: RigidbodyOptions) {
  return function (target: any) {
    World.create();
    function getData() {
      setTimeout(() => {
        const gameObject = Reflect.getMetadata(GAME_OBJECT, target);
        if (!gameObject) return getData();
        Reflect.defineMetadata(PHYSICS_RIGIDBODY, options, target);
      });
    }
    getData();
  };
}