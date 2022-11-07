import { Curve, Newable } from '@engine/core';
import { Animator } from '../classes/animator';

/** A keyframe that will be used to create a final curve. */
export interface AnimationKeyframe<T> {
  /** The time of the keyframe (should be less than or equal to the animation duration). */
  time: number;
  /** The value at this keyframe's time. */
  value: T;
}
/** A single track on a larger animation. */
export interface AnimationTrack<T = unknown> {
  /** The name of the animation track. */
  name: string;
  /** The keyframes within the animation track. */
  keyframes: AnimationKeyframe<T>[] | Curve;
}
/** Animates a property on a game object. */
export interface AnimationPropertyTrack<T = unknown> extends AnimationTrack<T> {
  /** A property animation. */
  type: 'property';
  /** The property name to affect. */
  property: string;
  /** The object that the property is attached to. */
  reference: object | Newable<object>;
}

export interface AnimationOptions {
  /** The time in seconds that the animation should play for. */
  duration: number;
  /** If `true` the animation will start over. Otherwise it will stop when the animation finishes. */
  looping?: boolean;
  /** If `true` the animation will go in reverse when it gets to the end then start over when it gets to the start. */
  pingPong?: boolean;
  /** All of the items that this animation animates. */
  tracks: AnimationTrack[];
}

export function Animation(options?: AnimationOptions) {
  return function (target: Newable<object>): any {
    return new class AnimationComponent extends Animator {
      constructor() {
        super(target, options);
      }
    };
  };
}