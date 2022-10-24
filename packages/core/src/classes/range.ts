import { Random } from './random';

export class Range {
  constructor(
    public readonly start: number, public readonly end: number
  ) { }

  random() {
    return Random.range(this.start, this.end);
  }
}