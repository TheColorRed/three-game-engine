import seedrandom from 'seedrandom';

export interface Rand<T> {
  random(): T;
}

export class Random implements Rand<number> {
  /** Reference to the pseudorandom number generator. */
  private readonly prng: seedrandom.PRNG;

  constructor(seed: string) {
    this.prng = seedrandom(seed);
  }

  random() {
    return this.nextDouble();
  }

  /**
   * Gets the next number as a double
   */
  nextDouble() {
    return this.prng.double();
  }
  /**
   * Gets the next number as an int
   */
  nextInt32() {
    return this.prng.int32();
  }
  /**
   * Gets a number between a max and a min value.
   * @param min The minimum number inclusive.
   * @param max The maximum number inclusive.
   */
  static range(min: number, max: number, round = true) {
    if (min === max) return min;
    const number = Math.random() * (max - min) + min;
    return round ? Math.round(number) : number;
  }
  static rangeFloat(min: number, max: number) {
    return this.range(min, max, false);
  }
  /**
   * Gets a random value from a list of items.
   * @param items An iterable list of items.
   */
  static item<T>(items: Iterable<T>): T | undefined {
    const arr = Array.from(items);
    return arr[Random.range(0, arr.length - 1)] ?? undefined;
  }
  /**
   * Gets a random subset of items from a list of items.
   * @param items An iterable list of items.
   * @param count The number of items to select.
   */
  static items<T>(items: Iterable<T>, count: number) {
    const ret: T[] = [];
    const arr = Array.from(items);
    for (let i = 0; i < count; i++) {
      const idx = Random.range(0, arr.length - 1);
      ret.push(...arr.splice(idx, 1));
    }
    return ret;
  }
  /**
   * Shuffles an array of items in place.
   * @param array The array of items to shuffle.
   */
  static shuffle<T>(array: T[]) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  static isInt(value: number) {
    return !value.toString().includes('.');
  }

  static isFloat(value: number) {
    return !this.isInt(value);
  }
}