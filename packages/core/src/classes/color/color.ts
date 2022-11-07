import { Three } from '../../three';

export class Color {
  #color!: Three.Color;
  #alpha!: number;
  /**
   * The three.js color.
   * @internal
   */
  get threeColor() { return this.#color; }
  get number() { return this.#color.getHex(); }
  get hex() { return this.#color.getHexString(); }
  get hsl() { return this.#color.getHSL({ h: 0, s: 0, l: 0 }); }
  get rgb() { return this.#color.getRGB({ r: 0, g: 0, b: 0 }); }
  get style() { return this.#color.getStyle(); }
  get alpha() { return this.#alpha; }

  static get white() { return new Color(0xffffff); }
  static get black() { return new Color(0x000000); }

  static get red() { return new Color(0xff0000); }
  static get green() { return new Color(0x00ff00); }
  static get blue() { return new Color(0x0000ff); }
  static get yellow() { return new Color(0xffff00); }
  static get orange() { return new Color(0xff6600); }


  constructor(color: string | number, alpha?: number);
  /** @internal */ constructor(color: Three.Color, alpha?: number);
  constructor(color: string | number | Color | Three.Color, alpha = 1) {
    this.#set(color);
    this.#alpha = alpha;
  }

  setAlpha(amount: number) {
    this.#alpha = amount;
    return this;
  }

  clone() {
    return new Color(this.threeColor.clone());
  }

  #set(color: string | number | Color | Three.Color) {
    this.#color = new Three.Color(color instanceof Color ? color.#color : color);
  }
  /**
   * Creates a color from RGB values.
   * @param r Red channel from `0 - 255`.
   * @param g Green channel from `0 - 255`.
   * @param b Blue channel from `0 - 255`.
   * @param a Alpha channel from `0 - 1`.
   * @returns
   */
  static fromRGB(r: number, g: number, b: number, a: number = 1) {
    return new Color(new Three.Color(`rgb(${r}, ${g}, ${b})`), a);
  }
  /**
   * Creates a color from HSL values.
   * @param h Hue channel `0 - 360`.
   * @param s Saturation channel `0 - 100`.
   * @param l Lightness channel `0 - 100`.
   * @param a Alpha channel from `0 - 1`.
   * @returns
   */
  static fromHSL(h: number, s: number, l: number, a: number = 1) {
    return new Color(new Three.Color(`hsl(${h}, ${s}%, ${l}%)`), a);
  }
}