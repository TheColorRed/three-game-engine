import { Injector, Module } from '@engine/core';
import { World2D } from './services';

@Module({
  startup: () => {
    const world = Injector.get(World2D)!;
    return world.create();
  }
})
export class Physics2DModule { }