import { from, Subject, switchAll, switchMap, tap, timer, toArray } from 'rxjs';
import { GameObject } from '../classes';
import { Injectable, Injector } from '../di';
import { GAME_OBJECT_CHILDREN } from '../tokens';
import { GameObjectManager } from './game-object-manager.service';
/**
 * Logic for the main game loop.
 * @internal
 */
@Injectable({ providedIn: 'game' })
export class GameLoop {

  #time = 0;
  #delta = 0;
  #lastTime = 0;
  #frames = 0;
  #start = Date.now();

  #updated = new Subject<void>();
  /** An observable that can be subscribed to, to get updates when a game loop tick takes place. */
  updated$ = this.#updated.asObservable();

  get time() { return this.#time; }
  get delta() { return this.#delta; }
  get frames() { return this.#frames; }

  private get gameObjects() { return this.gameObjectManager.gameObjects; }

  /** The main loop. Subscribed to within the engine. */
  loop$ = timer(0, 0)
    .pipe(
      // tap(() => console.log(Engine.gameObjects)),
      tap(() => this.#updateTiming()),
      // tap(() => console.log(this.activeScene.scene.children.length)),
      switchMap(() => from(this.gameObjects).pipe(
        tap(i => this.#startGameObject(i)),
        tap(i => this.#updateGameObject(i)),
        toArray(),
      )),
      switchAll(),
      tap(i => {
        this.#updated.next();
        this.#destroyGameObject(i);
      }),
    );

  constructor(
    private readonly gameObjectManager: GameObjectManager
  ) { }

  #updateTiming() {
    const now = Date.now();
    this.#time = (this.#lastTime - this.#start) / 1000;
    this.#delta = (now - this.#lastTime) / 1000;
    this.#lastTime = now;
    this.#frames++;
  }

  #startGameObject(obj: GameObject) {
    if (obj.started === false) {
      obj.onStart();
    }
  }

  #updateGameObject(obj: GameObject) {
    if (obj.started === true) {
      obj.onUpdate();
    }
  }

  #destroyGameObject(obj: GameObject) {
    if (obj.onDestroy?.()) {
      try {
        import('@engine/physics').then(physics => {
          const p = Reflect.getMetadata(physics.PHYSICS_RIGIDBODY, obj.constructor);
          if (typeof p !== 'undefined') {
            const world = Injector.get(physics.World);
            world?.remove(obj);
          }
        });
      } catch (e) { }
      this.#deleteAllGameObjectRefs(obj);
      const idx = this.gameObjects.indexOf(obj);
      if (idx > -1) this.gameObjects.splice(idx, 1);
    }
  }

  #deleteAllGameObjectRefs(obj: GameObject) {
    for (let gameObject of this.gameObjects) {
      gameObject.children.setDirty();
      for (let method in gameObject) {
        let meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, gameObject, method);
        if (typeof meta !== 'undefined') {
          (gameObject as any)[method].setDirty();
        }
      }
      // gameObject.children.remove(obj);
      // gameObject.children = gameObject.children.filter(i => i !== obj);
    }
  }

}