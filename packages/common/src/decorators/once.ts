import { Reflection, TOKEN_ONCE } from '@engine/core';

/**
 * Runs a function once after it has been created.
 * @param delay How long in seconds to wait before the function is called.
 * @example
 * \@Once(10)
 * once() {
 *   console.log('Do something after 10 seconds');
 * }
 */
export function Once(delay: number) {
  return function (target: any, prop: string, descriptor: PropertyDescriptor) {
    Reflection.set(TOKEN_ONCE, delay, target, prop);
  };
}