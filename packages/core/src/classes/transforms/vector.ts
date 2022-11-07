import { Three } from '../../three';

export abstract class Vector {
  protected _x: number;
  protected _y: number;
  protected _z: number;

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
      this._x = 0;
      this._y = 0;
      this._z = 0;
    } else if (args.length === 3) {
      this._x = args[0];
      this._y = args[1];
      this._z = args[2];
    } else {
      this._x = args[0].x;
      this._y = args[0].y;
      this._z = args[0].z;
    }
  }

  normalize() {
    let { _x, _y, _z } = this;
    let { x, y, z } = new Three.Vector3(_x, _y, _z).normalize();
    return new Vector3(x, y, z);
  }

  three() {
    return new Three.Vector3(this._x, this._y, this._z);
  }
}

/**
 * A vector containing 3 dimensions.
 */
export class Vector3 extends Vector {

  get x() { return this._x; }
  get y() { return this._y; }
  get z() { return this._z; }

  static get zero() { return new Vector3(0, 0, 0); }
  static get one() { return new Vector3(1, 1, 1); }
  static get left() { return new Vector3(-1, 0, 0); }
  static get right() { return new Vector3(1, 0, 0); }
  static get up() { return new Vector3(0, 1, 0); }
  static get down() { return new Vector3(0, -1, 0); }
  static get forward() { return new Vector3(0, 0, -1); }
  static get backward() { return new Vector3(0, 0, 1); }

  toVec2() {
    return new Vector2(this.x, this.y);
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

  toArray(): [x: number, y: number, z: number] {
    return [this.x, this.y, this.z];
  }

  add(amount: number) { return new Vector3(this.x + amount, this.y + amount, this.z + amount); }
  sub(amount: number) { return new Vector3(this.x - amount, this.y - amount, this.z - amount); }
  mul(amount: number) { return new Vector3(this.x * amount, this.y * amount, this.z * amount); }
  div(amount: number) { return new Vector3(this.x / amount, this.y / amount, this.z / amount); }
  addX(amount: number) { return new Vector3(this.x + amount, this.y, this.z); }
  addY(amount: number) { return new Vector3(this.x, this.y + amount, this.z); }
  addZ(amount: number) { return new Vector3(this.x, this.y, this.z + amount); }
  subX(amount: number) { return new Vector3(this.x - amount, this.y, this.z); }
  subY(amount: number) { return new Vector3(this.x, this.y - amount, this.z); }
  subZ(amount: number) { return new Vector3(this.x, this.y, this.z - amount); }
  mulX(amount: number) { return new Vector3(this.x * amount, this.y, this.z); }
  mulY(amount: number) { return new Vector3(this.x, this.y * amount, this.z); }
  mulZ(amount: number) { return new Vector3(this.x, this.y, this.z * amount); }
  divX(amount: number) { return new Vector3(this.x / amount, this.y, this.z); }
  divY(amount: number) { return new Vector3(this.x, this.y / amount, this.z); }
  divZ(amount: number) { return new Vector3(this.x, this.y, this.z / amount); }
}

export class Vector2 extends Vector {

  get x() { return this._x; }
  get y() { return this._y; }

  constructor();
  constructor(x: number, y: number);
  constructor(...args: [] | [x: number, y: number]) {
    if (args.length === 2) {
      super(args[0], args[1], 0);
      return this;
    }
    super(0, 0, 0);
  }

  static get zero() { return new Vector2(0, 0); }
  static get one() { return new Vector2(1, 1); }
  static get left() { return new Vector2(-1, 0); }
  static get right() { return new Vector2(1, 0); }
  static get up() { return new Vector2(0, 1); }
  static get down() { return new Vector2(0, -1); }

  add(amount: number) { return new Vector2(this.x + amount, this.y + amount); }
  sub(amount: number) { return new Vector2(this.x - amount, this.y - amount); }
  mul(amount: number) { return new Vector2(this.x * amount, this.y * amount); }
  div(amount: number) { return new Vector2(this.x / amount, this.y / amount); }
  addX(amount: number) { return new Vector2(this.x + amount, this.y); }
  addY(amount: number) { return new Vector2(this.x, this.y + amount); }
  subX(amount: number) { return new Vector2(this.x - amount, this.y); }
  subY(amount: number) { return new Vector2(this.x, this.y - amount); }
  mulX(amount: number) { return new Vector2(this.x * amount, this.y); }
  mulY(amount: number) { return new Vector2(this.x, this.y * amount); }
  divX(amount: number) { return new Vector2(this.x / amount, this.y); }
  divY(amount: number) { return new Vector2(this.x, this.y / amount); }

  static rotate(degrees: number, axis: 'x' | 'y' | 'z' = 'z') {
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

  toArray(): [x: number, y: number] {
    return [this.x, this.y];
  }

  static fromThree(v: Three.Vector2) {
    return new Vector2(v.x, v.y);
  }
}
