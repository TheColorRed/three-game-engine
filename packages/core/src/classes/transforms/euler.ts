import { Three } from '../../three';
export class Euler {

  readonly x: number;
  readonly y: number;
  readonly z: number;

  /**
   * @param x The horizontal point.
   * @param y The vertical point.
   * @param z The depth point.
   */
  constructor(x: number, y: number, z: number);
  /** @internal */
  constructor(threeVector: Three.Euler);
  constructor();
  constructor(...args:
    [] |
    [x: number, y: number, z: number] |
    [threeVector: Three.Euler]
  ) {
    if (args.length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    } else if (args.length === 3) {
      this.x = args[0];
      this.y = args[1];
      this.z = args[2];
    } else {
      this.x = args[0].x;
      this.y = args[0].y;
      this.z = args[0].z;
    }
  }

  static get zero() { return new Euler(0, 0, 0); }
  static get one() { return new Euler(1, 1, 1); }

  toThree() {
    return new Three.Euler(this.x, this.y, this.z);
  }

  toArray(): [x: number, y: number, z: number] {
    return [this.x, this.y, this.z];
  }

  static fromThree(euler?: Three.Euler) {
    if (euler) return new Euler(euler.x ?? 0, euler.y ?? 0, euler.z ?? 0);
    return Euler.zero;
  }
}