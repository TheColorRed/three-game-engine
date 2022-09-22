import { Injectable, Vector3 } from '@engine/core';
import type { GameObject } from '@engine/objects';
import { tap, timer } from 'rxjs';

@Injectable()
export class GameObjectRef {
  /**
   * The game object reference.
   * @internal
   */
  reference!: GameObject;
  get isActive() { return this.reference.isActive; }
  get position() { return this.reference.position; }
  set position(value: Vector3) { this.reference.position = value; }
  toType() {
    return this.reference.constructor;
  }
  /** Destroys the game object as soon as possible. */
  destroy(): void;
  /**
   * Destroys the game object after `x` seconds.
   * @param time Number of seconds till the game object is destroyed.
   */
  destroy(time: number): void;
  destroy(time = 0) {
    timer(time * 1000)
      .pipe(
        tap(() => this.reference.markedForDeletion = true),
      )
      .subscribe();
  }

  setActive(isActive: boolean) {
    this.reference.isActive = isActive;
  }
}