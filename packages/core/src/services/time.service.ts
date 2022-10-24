import { Injectable } from '../di/injectable';
import { GameLoop } from './game-loop.service';

@Injectable({ providedIn: 'game' })
export class Time {

  constructor(
    private readonly gameLoop: GameLoop
  ) { }

  /** The amount of time in seconds that has passed since the game started. */
  get time() { return this.gameLoop.time; }
  /** The amount of time in milliseconds that has passed since the last frame. */
  get deltaTime() { return this.gameLoop.delta; }
  /** The number of frames that have been rendered. */
  get frameCount() { return this.gameLoop.frames; }
}