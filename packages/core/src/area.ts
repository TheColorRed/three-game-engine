export class Area {

  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
  ) { }

  static square(size: number = 1) { return new Area(0, 0, size, size); }
  static rect(width: number, height: number) { return new Area(0, 0, width, height); }

}