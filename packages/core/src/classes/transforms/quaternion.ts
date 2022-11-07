import { Three } from '../../three';

export class Quaternion {

  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;

  /**
   * @param x The horizontal point.
   * @param y The vertical point.
   * @param z The depth point.
   */
  constructor(x: number, y: number, z: number, w: number);
  /** @internal */
  constructor(threeVector: Three.Quaternion);
  constructor();
  constructor(...args:
    [] |
    [x: number, y: number, z: number, w: number] |
    [threeVector: Three.Quaternion]
  ) {
    if (args.length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    } else if (args.length === 4) {
      this.x = args[0];
      this.y = args[1];
      this.z = args[2];
      this.w = args[3];
    } else {
      this.x = args[0].x;
      this.y = args[0].y;
      this.z = args[0].z;
      this.w = args[0].w;
    }
  }

  static get zero() { return new Quaternion(0, 0, 0, 0); }
  static get one() { return new Quaternion(1, 1, 1, 1); }

  static fromThree(quaternion?: Three.Quaternion) {
    if (quaternion) return new Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    return Quaternion.zero;
  }

  toArray(): [x: number, y: number, z: number, w: number] {
    return [this.x, this.y, this.z, this.w];
  }

  toThree(): Three.Quaternion {
    return new Three.Quaternion(this.x, this.y, this.z, this.w);
  }
}