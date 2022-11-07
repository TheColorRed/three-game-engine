import { Newable } from '@engine/core';
import { AnimationOptions } from '../decorators/animation.decorator';


export class Animator {

  constructor(
    readonly target: Newable<object>,
    readonly options?: AnimationOptions
  ) { }
}