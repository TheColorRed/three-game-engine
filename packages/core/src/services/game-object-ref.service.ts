import { tap, timer } from 'rxjs';
import { GameObjectBase } from '../classes/game-object';
import { Vector3 } from '../classes/transforms/vector';
import { Injectable } from '../di/injectable';
import { GAME_OBJECT_COMPONENT } from '../tokens/game-object-tokens';
import { Newable } from '../types';

@Injectable()
export class GameObjectRef {
  /**
   * The game object reference.
   * @internal
   */
  reference!: GameObjectBase;
  /** @internal */
  get componentsInternal() { return this.reference.components; }
  get components() { return this.reference.components.map(c => c.instance); }
  get isActive() { return this.reference.isActive; }
  get position() { return this.reference.position; }
  set position(value: Vector3) { this.reference.position = value; }

  /**
   * Gets the first component instance found on the game object.
   * @param comp The component to find on the game object.
   */
  getComponent<T>(comp: Newable<T>): T | undefined {
    const m = Reflect.getMetadata(GAME_OBJECT_COMPONENT, comp);
    return this.componentsInternal.find(c => c.instance instanceof m)?.instance;
  }
  /**
   * Gets a list of component instances found on the game object..
   * @param comp The component to find on the game object.
   */
  getComponents<T>(comp: Newable<T>): T[] {
    const m = Reflect.getMetadata(GAME_OBJECT_COMPONENT, comp);
    return this.componentsInternal.filter(c => c.instance instanceof m).map(i => i.instance);
  }

  addComponent<T extends object>(comp: Newable<T>): T {
    return this.reference.addComponent(comp);
  }

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