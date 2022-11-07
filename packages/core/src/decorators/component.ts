import { Injector } from '../di/injector';
import { Newable } from '../types';

export class GameComponentBase {
  instance: any;
  injector: Injector<any>;

  constructor(readonly target: Newable<object>) {
    this.injector = Injector.create(target);
    this.instance = this.injector.get(target);
  }

  onUpdate() { }
  onStart() { }
}


export function Component() {
  return function (target: Newable<object>): any {
    return class GameComponent extends GameComponentBase {
      constructor() {
        super(target);
      }
    };
  };
}