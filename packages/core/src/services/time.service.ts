import { Injectable } from '../di';
import { GameLoop } from './game-loop.service';

@Injectable({ providedIn: 'game' })
export class Time {

  constructor(
    private gameLoop: GameLoop
  ) { }

  /** The amount of time in seconds that has passed since the game started. */
  get time() { return this.gameLoop.time; }
  /** The amount of time in milliseconds that has passed since the last frame. */
  get delta() { return this.gameLoop.delta; }
  get frameCount() { return this.gameLoop.frames; }
}