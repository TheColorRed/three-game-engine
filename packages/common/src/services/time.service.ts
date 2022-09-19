import { Engine, Injectable } from '@engine/core';

@Injectable({ providedIn: 'game' })
export class Time {
  /** The amount of time in seconds that has passed since the game started. */
  get time() { return Engine.time; }
  /** The amount of time in milliseconds that has passed since the last frame. */
  get delta() { return Engine.delta; }
  get frameCount() { return Engine.frames; }
}