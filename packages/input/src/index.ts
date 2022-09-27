import { Injector } from '@engine/core';
import { Keyboard, Mouse } from './services';

export * from './decorators';
export * from './enums';
export * from './services';
export * from './tokens';

Injector.create(Keyboard);
Injector.create(Mouse);