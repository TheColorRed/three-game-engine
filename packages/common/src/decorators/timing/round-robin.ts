import { TIME_ROUND_ROBIN } from '@engine/core';

/**
 * Calls each item from left to right, and once the last item is called starts over.
 * @param choices All of the possible choices to choose from.
 * @example
 * \@RoundRobin(1, 2, 3)
 * shoot() {
 *   console.log('Wait 1 second, wait 2 seconds, wait 3 seconds, start over.');
 * }
 */
export function RoundRobin(...choices: number[]) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TIME_ROUND_ROBIN, choices, target, prop);
    const original = descriptor.value;
    let current = 0;
    const delay = () => {
      current = current === choices.length ? 0 : current;
      return choices[current++] * 1000;
    };
    descriptor.value = function (...args: any[]) {
      const invoke = () => {
        original.apply(this, ...args);
        setTimeout(() => invoke(), delay());
      };
      setTimeout(() => invoke(), delay());
    };
    return descriptor;
  };
}