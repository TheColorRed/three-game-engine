import { Injector, Module } from '@engine/core';
import { Keyboard, Mouse } from './services';

@Module({
  startup: () => {
    Injector.create(Keyboard);
    Injector.create(Mouse);
  }
})
export class InputModule { }