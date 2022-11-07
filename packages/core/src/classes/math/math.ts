export class Mathf {
  /**
   * Returns a number that is no smaller than the minimum and no larger than the maximum.
   * @param min The minimum value.
   * @param max The maximum value.
   * @param value The current value.
   */
  static clamp(min: number, max: number, value: number) {
    return Math.min(Math.max(value, min), max);
  }
  /**
   * Returns a number that is no smaller than `0` and no larger than `1`.
   * @param value The current value.
   */
  static clamp01(value: number) {
    return this.clamp(0, 1, value);
  }
  /**
   * Makes a number negative if the expression is true.
   * @param value The current value.
   * @param expression An expression that if true makes the value negative.
   */
  static negateIf(value: number, expression: boolean) {
    return expression ? Math.abs(value) * -1 : value;
  }
  /**
   * Makes a number positive if the expression is true.
   * @param value The current value.
   * @param expression An expression that if true makes the value positive.
   */
  static additiveIf(value: number, expression: boolean) {
    return expression ? Math.abs(value) : value;
  }
}