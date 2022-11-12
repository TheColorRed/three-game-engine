import { Injector } from '../di/injector';
import { GAME_OBJECT_COMPONENT } from '../tokens/game-object-tokens';
import { Newable } from '../types';

export class GameComponentBase {
  instance: any;
  injector: Injector<any>;

  started = false;

  constructor(readonly target: Newable<object>) {
    this.injector = Injector.create(target);
    this.instance = this.injector.get(target);
  }

  onUpdate() { }
  onStart() { }
}


export function Component() {
  return function (target: Newable<object>): any {
    const c = class GameComponent extends GameComponentBase {
      constructor() {
        super(target);
      }
    };
    Reflect.defineMetadata(GAME_OBJECT_COMPONENT, target, c);
    return c;
  };
}