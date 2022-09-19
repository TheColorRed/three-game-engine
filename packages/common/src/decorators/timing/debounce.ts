
/**
 * @example
 * // Pressing the space key really fast will stop "shoot"
 * // from getting called. Once the space key stops getting pressed,
 * // shoot will execute once time after "0.5" seconds has passed.
 * \@KeyDown(Key.Space)
 * \@Debounce(0.5)
 * shoot() {
 *   console.log('shot once the space bar has stopped being pushed');
 * }
 * @param time
 * @returns
 */
export function Debounce(time: number) {
  return (target: any, prop: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    let timer: NodeJS.Timer | undefined;
    descriptor.value = function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => original.apply(this, ...args), time * 1000);
    };
    return descriptor;
  };
}