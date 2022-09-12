/**
 * A vector containing 3 dimensions.
 */
export class Vector3 {
  /**
   * @param x The horizontal point.
   * @param y The vertical point.
   * @param z The depth point.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) { }
  static get zero() { return new Vector3(0, 0, 0); }
  static get one() { return new Vector3(1, 1, 1); }
  static get left() { return new Vector3(-1, 0, 0); }
  static get right() { return new Vector3(1, 0, 0); }
  static get up() { return new Vector3(0, -1, 0); }
  static get down() { return new Vector3(0, 1, 0); }
  static get forward() { return new Vector3(0, 0, -1); }
  static get backward() { return new Vector3(0, 0, 1); }
}

export class Vector2 extends Vector3 {
  constructor(x: number, y: number) {
    super(x, y, 0);
  }

  static override get zero() { return new Vector2(0, 0); }
  static override get one() { return new Vector2(1, 1); }
  static override get left() { return new Vector2(-1, 0); }
  static override get right() { return new Vector2(1, 0); }
  static override get up() { return new Vector2(0, -1); }
  static override get down() { return new Vector2(0, 1); }
}
