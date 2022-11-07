import { LinearSpline } from '../../classes/lines/linear-spline';
import { Random } from './random';

export class Range {

  private spline: LinearSpline<number>;

  constructor(
    public readonly start: number, public readonly end: number
  ) {
    this.spline = LinearSpline.range(start, end);
  }
  /** Gets a random integer within the range. */
  get random() { return Random.range(this.start, this.end); }
  /** The smaller of the two values. */
  get min() { return Math.min(this.start, this.end); }
  /** The larger of the two values. */
  get max() { return Math.max(this.start, this.end); }
  /** Gets a random float within the range. */
  get randomFloat() { return Random.range(this.start, this.end, false); }
  /** The average of the two numbers in the range. */
  get avg() { return (this.start + this.end) / 2; }
  /** The sum of the two numbers in the range. `1+1` */
  get sum() { return this.start + this.end; }
  /** The difference of the two numbers in the range. `1-1` */
  get diff() { return this.start - this.end; }
  /** The product of the two numbers in the range. `1*1` */
  get prod() { return this.start * this.end; }
  /** The quotient of the two numbers in the range. `1/1` */
  get quot() { return this.start / this.end; }

  lerp(t: number) {
    return this.spline.get(t);
  }
}