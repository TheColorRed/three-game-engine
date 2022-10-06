import { Injector, Module } from '@engine/core';
import { Keyboard, Mouse } from './services';

@Module({
  bootstrap: () => {
    Injector.create(Keyboard);
    Injector.create(Mouse);
  }
})
export class InputModule { }