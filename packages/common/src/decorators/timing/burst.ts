import { Reflection, TIME_AUTO_BURST, TIME_BURST } from '@engine/core';

/**
 * Executes a method for a defined duration then stops for a defined duration.
 * @param duration The amount of time in seconds to burst for.
 * @param rest The amount of time in seconds to rest for.
 * @param speed The speed at which to limit the bursts.
 * @param limit The number of times to burst; defaults to Infinity.
 * @example
 * \@AutoBurst(2, 2, 0.2)
 * autoBurst() {
 *   console.log('on for 2 seconds')
 * }
 */
export function AutoBurst(duration: number, rest: number, speed: number, limit = Infinity) {
  return function (target: any, prop: string) {
    Reflection.set(TIME_AUTO_BURST, { duration, rest, speed, limit }, target, prop);
  };
}

/**
 * Only allows a method to get called periodically in bursts.
 * @param duration The amount of time in seconds to burst for.
 * @param rest The amount of time in seconds to rest for.
 * @param speed The speed at which to limit the bursts.
 * @example
 * \@KeyPress(Key.Space)
 * \@Burst(2, 2, 0.25)
 * autoBurst() {
 *   console.log('on for 2 seconds')
 * }
 */
export function Burst(duration: number, rest: number, speed: number) {
  return function (target: any, prop: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(TIME_BURST, { isResting: false, time: Date.now(), last: 0 }, target, prop);
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const burst = Reflect.getMetadata(TIME_BURST, target, prop) as { isResting: boolean, time: number; last: number; };
      if (!burst.isResting) {
        if ((Date.now() - burst.last) >= speed * 1000) {
          original.apply(this, ...args);
          burst.last = Date.now();
        }
        if (Math.abs(Date.now() - burst.time) >= duration * 1000) {
          burst.isResting = true;
          burst.time = Date.now();
        }
      }
      if (burst.isResting && Math.abs(Date.now() - burst.time) >= rest * 1000) {
        burst.isResting = false;
        burst.time = Date.now();
      }
      Reflect.defineMetadata(TIME_BURST, burst, target, prop);
    };
    return descriptor;
  };
}