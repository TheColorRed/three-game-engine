
export class LinearSpline<T> {
  /** A list of keyframes in the spline. */
  private keyframes: [number, T][] = [];

  constructor(
    private lerp: (t: number, a: T, b: T) => T
  ) { }
  /** A numeric spline with a start and end value. */
  static range(start: number, end: number) {
    return LinearSpline.numeric().addKeyframe(0, start).addKeyframe(1, end);
  }
  /**
   * A numeric spline where the lerp formula is:
   * ```
   * (t, a, b) => a + t * (b - a)
   * ```
   */
  static numeric() {
    return new LinearSpline<number>((t, a, b) => a + t * (b - a));
  }
  /**
   * Adds a keyframe to the spline.
   * @param t The time for this keyframe (0-1).
   * @param v The value for this keyframe.
   */
  addKeyframe(t: number, v: T) {
    this.keyframes.push([t, v]);
    return this;
  }
  /**
   * Gets the value a the specified time.
   * @param t The time in the spline (0-1).
   */
  get(t: number) {
    let p1 = 0;

    for (let i = 0; i < this.keyframes.length; i++) {
      if (this.keyframes[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this.keyframes.length - 1, p1 + 1);

    if (p1 == p2) {
      return this.keyframes[p1][1];
    }

    return this.lerp(
      (t - this.keyframes[p1][0]) / (
        this.keyframes[p2][0] - this.keyframes[p1][0]),
      this.keyframes[p1][1], this.keyframes[p2][1]);
  }
}