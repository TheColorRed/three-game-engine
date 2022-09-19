import { TIME_CHOICE } from '@engine/core';

/**
 * Randomly chooses a given number to wait until it calls the next choice.
 * @param choices All of the possible choices to choose from.
 * @example
 * \@Choose(1, 2, 3)
 * shoot() {
 *   console.log('Randomly chose 1, 2, or 3');
 * }
 */
export function Choose(...choices: number[]) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TIME_CHOICE, choices, target, prop);
    const original = descriptor.value;
    const random = () => choices[Math.round(Math.random() * choices.length)] * 1000;
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