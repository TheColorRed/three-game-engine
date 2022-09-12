import { TOKEN_DEBOUNCE } from '@engine/core';

/**
 * Stops a method from getting called too frequently.
 * @param time The amount of time in seconds between calls.
 * @example
 * \@KeyPress(Key.Space)
 * \@Debounce(0.2)
 * shoot() {
 *   console.log('delayed shoot')
 * }
 * @example
 * \@Debounce(0.2)
 * update() {
 *   console.log('delayed update')
 * }
 */
export function Debounce(time: number) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TOKEN_DEBOUNCE, 0, target, prop);
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const lastCallTime = Reflect.getMetadata(TOKEN_DEBOUNCE, target, prop);
      if ((Date.now() - lastCallTime) >= time * 1000) {
        original.apply(this, ...args);
        Reflect.defineMetadata(TOKEN_DEBOUNCE, Date.now(), target, prop);
      }
    };
    return descriptor;
  };
}