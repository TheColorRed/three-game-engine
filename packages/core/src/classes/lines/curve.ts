import { Three } from '../../three';
import { Mathf } from '../math/math';
import { Vector2 } from '../transforms/vector';


export abstract class Curve {
  /** The three.js curve. */
  protected curve!: Three.Curve<Three.Vector>;
  /**
   * Moves along the curve in time.
   * @param t The amount of time to move along the curve where `0` is the start of the curve and `1` is the end of the curve.
   */
  lerp(t: number) {
    const v = new Three.Vector2();
    t = Mathf.clamp01(t);
    this.curve.getPoint(t, v);
    return Vector2.fromThree(v);
  }
  /**
   * Gets a 3d object that can be drawn in the world.
   * @param color The color to use
   */
  draw(color: Three.ColorRepresentation = 0x00ff00) {
    const points = this.curve.getPoints(50) as Three.Vector2[];
    const geometry = new Three.BufferGeometry().setFromPoints(points);

    const material = new Three.LineBasicMaterial({ color });

    // Create the final object to add to the scene
    return new Three.Line(geometry, material);
  }
  /**
   * Gets an arch curve using a starting point and end point.
   * @param start The starting value of the arch.
   * @param length The length of the arch.
   * @param offset The offset of the start and end values.
   * @param midpoint The height of the arch's midpoint.
   */
  static arch(start: number, length: number, offset: number, midpoint: number): QuadraticBezierCurve;
  /**
   * Gets an arch curve using a starting point and ending point. The offset of the starting and ending points start at zero.
   * @param start The starting value of the arch.
   * @param length The length of the arch.
   * @param midpoint The height of the arch's midpoint.
   */
  static arch(start: number, length: number, midpoint: number): QuadraticBezierCurve;
  static arch(...args: [number, number, number, number] | [number, number, number]) {
    const start = args[0];
    const length = args[1];
    const height = args.length === 4 ? args[2] : 0;
    const midpoint = args.length === 4 ? args[3] : args[2];
    return new QuadraticBezierCurve(
      new Vector2(start, height),
      new Vector2(length, height),
      new Vector2((start + length) / 2, height + midpoint),
    );
  }
  /**
   * Creates an "S-Shaped" curve.
   * @param x1 The x start point.
   * @param y1 The y start point.
   * @param x2 The x end point.
   * @param y2 The y end point.
   */
  static sCurve(x1: number, y1: number, x2: number, y2: number): CubicBezierCurve;
  /**
   * Creates an "S-Shaped" curve starting at zero and ending at the length.
   * @param y1 The y start point.
   * @param length The length of the curve.
   * @param y2 The y end point.
   */
  static sCurve(y1: number, length: number, y2: number): CubicBezierCurve;
  /**
   * An "S-Shaped" curve that starts at zero with a zero value and ends at the length with a y value.
   * @param length
   * @param y2
   */
  static sCurve(length: number, y2: number): CubicBezierCurve;
  /**
   * Creates an "S-Shaped" curve using vectors.
   * @param start The starting vector.
   * @param end The ending vector.
   */
  static sCurve(start: Vector2, end: Vector2): CubicBezierCurve;
  static sCurve(...args: [number, number, number, number] | [number, number, number] | [number, number] | [Vector2, Vector2]) {
    const start = args.length === 4 ? new Vector2(args[0], args[1]) :
      args.length === 3 ? new Vector2(0, args[0]) :
        args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number' ? Vector2.zero : (args[0] as Vector2);

    const end = args.length === 4 ? new Vector2(args[2], args[3]) :
      args.length === 3 ? new Vector2(args[1], args[2]) :
        args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number' ? new Vector2(args[0], args[1]) : (args[1] as Vector2);

    return new CubicBezierCurve(start, end, new Vector2(0, start.y), new Vector2(0, end.y));
  }
  /**
   * Creates a quarter of a circle. This uses controls that are half the height and width of the x and y starting and ending points.
   * @param x1 The x start point.
   * @param y1 The y start point.
   * @param x2 The x end point.
   * @param y2 The y end point.
   * @returns
   */
  static quarterPipe(x1: number, y1: number, x2: number, y2: number) {
    const x1p = Math.abs(x1), x2p = Math.abs(x2), y1p = Math.abs(y1), y2p = Math.abs(y2);

    const px1 = Mathf.negateIf((x1p + x2p) / 2, x1 > x2);
    const py2 = Mathf.negateIf((y1p + y2p) / 2, y1 > y2);

    return new CubicBezierCurve(
      new Vector2(x1, y1),
      new Vector2(x2, y2),
      new Vector2(px1, y1),
      new Vector2(x2, py2)
    );
  }
}

export class CubicBezierCurve extends Curve {
  constructor(
    public readonly start: Vector2,
    public readonly end: Vector2,
    public readonly startControl: Vector2,
    public readonly endControl: Vector2,
  ) {
    super();
    this.curve = new Three.CubicBezierCurve(
      new Three.Vector2(start.x, start.y),
      new Three.Vector2(startControl.x, startControl.y),
      new Three.Vector2(endControl.x, endControl.y),
      new Three.Vector2(end.x, end.y),
    );
  }
}

export class QuadraticBezierCurve extends Curve {
  constructor(
    public readonly start: Vector2,
    public readonly end: Vector2,
    public readonly control: Vector2
  ) {
    super();
    this.curve = new Three.QuadraticBezierCurve(
      new Three.Vector2(...start.toArray()),
      new Three.Vector2(...control.toArray()),
      new Three.Vector2(...end.toArray()),
    );
  }
}

export class Line extends Curve {
  constructor(
    public readonly start: Vector2,
    public readonly end: Vector2
  ) {
    super();
    this.curve = new Three.SplineCurve([
      new Three.Vector2(...start.toArray()),
      new Three.Vector2(...end.toArray())
    ]);
  }
  /**
   * A horizontal line that never changes in height.
   * @param x Start of the line.
   * @param y The height of the line.
   * @param length Ending of the line.
   */
  static horizontal(x: number, y: number, length: number = 1) {
    return new Line(new Vector2(x, y), new Vector2(x + length, y));
  }

  static angled(x: number, y: number, y2: number, length: number = 1) {
    return new Line(new Vector2(x, y), new Vector2(x + length, y2));
  }
  /**
   * Creates a line from a starting point and an ending point.
   * @param x1 Starting point of the line.
   * @param x2 Ending point of the line.
   * @param y1 The starting height of the line.
   * @param y1 The ending height of the line.
   * @returns
   */
  static create(x1: number, y1: number, x2: number, y2: number) {
    return new Line(new Vector2(x1, y1), new Vector2(x2, y2));
  }
}