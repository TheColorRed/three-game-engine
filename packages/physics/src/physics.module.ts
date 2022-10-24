import { Injector, Module } from '@engine/core';
import { World } from './services';

@Module({
  startup: () => {
    const world = Injector.get(World)!;
    return world.create();
  }
})
export class PhysicsModule { }