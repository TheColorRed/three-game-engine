import { Reflection, TOKEN_REPEAT } from '@engine/core';
/**
 * Repeats a function indefinitely or until the function returns false or the number of times has been reached.
 * @param interval How often the function should be called.
 * @param delay How long to wait before the first time is called.
 * @param times How many times the action should repeat, defaults to Infinity
 * @example
 * \@Repeat(1)
 * repeat(count: number) {
 *   console.log(count);
 * }
 */
export function Repeat(interval: number, delay = 0, times = Infinity) {
  return function (target: any, prop: string, descriptor: PropertyDescriptor) {
    Reflection.set(TOKEN_REPEAT, { interval, delay, times }, target, prop);
  };
}