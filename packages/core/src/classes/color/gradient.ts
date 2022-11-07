import { LinearSpline } from '../lines/linear-spline';
import { Color } from './color';

export interface GradientColorKey {
  /** The percentage within the gradient `0 - 1`. */
  location: number;
  /** The color to use at this percentage. */
  color: Color;
}
export interface GradientAlphaKey {
  /** The percentage within the gradient `0 - 1`. */
  location: number;
  /** The alpha to use at this percentage. */
  alpha: number;
}

/**
 * Creates a gradient.
 *
 * **Note:** The keyframes will be resorted by location from 0 - 1 automatically.
 */
export class Gradient {

  private colorSpline = new LinearSpline<Color>((t, a, b) => new Color(a.threeColor.clone().lerp(b.threeColor, t)));
  private alphaSpline = LinearSpline.numeric();

  constructor(
    color: GradientColorKey[], alpha?: GradientAlphaKey[]
  ) {
    // Sort the keyframes from lowest to highest
    color.sort((a, b) => a.location - b.location);
    alpha?.sort((a, b) => a.location - b.location);

    // Make sure the first keyframe's location is 0
    if (color[0].location !== 0) color.unshift({ location: 0, color: new Color(color[0].color.threeColor) });
    // Make sure the last keyframe's location is 1
    if (color[color.length - 1].location !== 1) color.push({ location: 1, color: new Color(color[color.length - 1].color.threeColor) });

    if (!alpha) alpha = [{ location: 0, alpha: 1 }, { location: 1, alpha: 1 }];
    // Make sure the first keyframe's location is 0
    if (alpha[0].location !== 0) alpha.unshift({ location: 0, alpha: alpha[0].alpha });
    // Make sure the last keyframe's location is 1
    if (alpha[alpha.length - 1].location !== 1) alpha.push({ location: 1, alpha: alpha[alpha.length - 1].alpha });

    // Add the points to the spline
    color.forEach(frame => this.colorSpline.addKeyframe(frame.location, frame.color));
    alpha?.forEach(frame => this.alphaSpline.addKeyframe(frame.location, frame.alpha));
  }
  /** Create a gradient with a start and end color. */
  static create(start: Color, end: Color) {
    return new Gradient(
      [Gradient.color(0, start), Gradient.color(1, end)],
      [Gradient.alpha(0, start.alpha), Gradient.alpha(1, end.alpha)],
    );
  }

  static color(location: number, color: Color) {
    return { location, color } as GradientColorKey;
  }

  static alpha(location: number, alpha: number) {
    return { location, alpha } as GradientAlphaKey;
  }

  lerp(t: number) {
    const alpha = this.alphaSpline.get(t);
    // console.log(alpha);
    return this.colorSpline.get(t).clone().setAlpha(alpha);
  }
}