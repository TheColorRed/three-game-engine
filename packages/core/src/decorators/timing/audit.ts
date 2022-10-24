import { TIME_AUDIT } from '../../tokens/timing-tokens';

/**
 * Stops a method from getting called too frequently.
 * This enforces rate limiting on a method.
 * @param time The amount of time in seconds between calls.
 * @example
 * \@KeyPress(Key.Space)
 * \@Audit(0.2)
 * shoot() {
 *   console.log('delayed shot');
 * }
 * @example
 * \@Audit(0.2)
 * update() {
 *   console.log('delayed update');
 * }
 */
export function Audit(time: number) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TIME_AUDIT, 0, target, prop);
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const lastCallTime = Reflect.getMetadata(TIME_AUDIT, target, prop);
      if ((Date.now() - lastCallTime) >= time * 1000) {
        original.apply(this, ...args);
        Reflect.defineMetadata(TIME_AUDIT, Date.now(), target, prop);
      }
    };
    return descriptor;
  };
}