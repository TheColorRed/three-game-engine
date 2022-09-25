import { Three } from '@engine/core';

/**
 * A vector containing 3 dimensions.
 */
export class Vector3 {

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
  constructor(threeVector: Three.Vector3);
  constructor();
  constructor(...args:
    [] |
    [x: number, y: number, z: number] |
    [threeVector: Three.Vector3]
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
  static get zero() { return new Vector3(0, 0, 0); }
  static get one() { return new Vector3(1, 1, 1); }
  static get left() { return new Vector3(-1, 0, 0); }
  static get right() { return new Vector3(1, 0, 0); }
  static get up() { return new Vector3(0, -1, 0); }
  static get down() { return new Vector3(0, 1, 0); }
  static get forward() { return new Vector3(0, 0, -1); }
  static get backward() { return new Vector3(0, 0, 1); }

  normalize() {
    var { x, y, z } = this;
    var { x, y, z } = new Three.Vector3(x, y, z).normalize();
    return new Vector3(x, y, z);
  }

  three() {
    return new Three.Vector3(this.x, this.y, this.z);
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  static fromThree(vector?: Three.Vector3) {
    if (vector) return new Vector3(vector.x, vector.y, vector.z);
    return Vector3.zero;
  }

  static rotate(axis: { x?: number, y?: number, z?: number; }): Vector3;
  static rotate(degrees: number): Vector3;
  static rotate(...args:
    [degrees: number] |
    // [degrees: number, axis: 'x' | 'y' | 'z'] |
    [axis: { x?: number, y?: number, z?: number; }]
  ) {
    const vec = new Three.Vector3(1, 0, 0);
    const axisVec = new Three.Vector3();
    if (typeof args[0] === 'number') {
      axisVec.set(args[0], args[0], args[0]);
      var angle = args[0] * (Math.PI / 180);
      vec.applyAxisAngle(axisVec, angle);
    } else {
      // TODO: apply angle on all axises
      // const { x, y, z } = args[0];
      // axisVec.set(x ?? 0, y ?? 0, z ?? 0);
      // vec.applyAxisAngle()
    }
    return new Vector3(vec.x, vec.y, vec.z).normalize();
  }
  /**
   * Gets the distance between two objects.
   * @param other The other object to check
   */
  distance(other: Vector3) {
    const currentVec = new Three.Vector3(this.x, this.y, this.z);
    const otherVec = new Three.Vector3(...other.toArray());
    return currentVec.distanceTo(otherVec);
  }
}

// @ts-ignore
export class Vector2 extends Vector3 {
  constructor(x: number, y: number) {
    super(x, y, 0);
  }

  static override get zero() { return new Vector2(0, 0); }
  static override get one() { return new Vector2(1, 1); }
  static override get left() { return new Vector2(-1, 0); }
  static override get right() { return new Vector2(1, 0); }
  static override get up() { return new Vector2(0, 1); }
  static override get down() { return new Vector2(0, -1); }

  static override rotate(degrees: number, axis: 'x' | 'y' | 'z' = 'z') {
    const vec = new Three.Vector3(1, 0, 0);
    var axisVec = new Three.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    var angle = degrees * (Math.PI / 180);
    vec.applyAxisAngle(axisVec, angle);
    return new Vector2(vec.x, vec.y).normalize();
  }
}
