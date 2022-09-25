import { TIME_RANDOMLY } from '@engine/common';

/**
 * Randomly calls a method between a min and max interval.
 * @param min The minimum time in seconds to wait before the next call.
 * @param max The maximum time in seconds to wait before the next call.
 * @example
 * \@Randomly(1, 2)
 * shoot() {
 *   console.log('The next shot will be fired at least 1 second from now but no more than 2 seconds from now.');
 * }
 */
export function Randomly(min: number, max: number) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TIME_RANDOMLY, { min, max }, target, prop);
    const original = descriptor.value;
    const random = () => Math.random() * ((max * 1000) - (min * 1000) + 1) + (min * 1000);
    descriptor.value = function (...args: any[]) {
      const invoke = () => {
        original.apply(this, ...args);
        setTimeout(() => invoke(), random());
      };
      setTimeout(() => invoke(), random());
    };
    return descriptor;
  };
}