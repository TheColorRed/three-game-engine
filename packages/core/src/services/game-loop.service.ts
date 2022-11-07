import { animationFrames, concatMap, filter, from, map, share, Subject, tap, timer, toArray } from 'rxjs';
import { GameObjectBase } from '../classes/game-object';
import { Injectable } from '../di/injectable';
import { Injector } from '../di/injector';
import { Three } from '../three';
import { CameraManager } from './camera-manager.service';
import { GameConfig } from './game-config.service';
import { GameObjectManager } from './game-object-manager.service';
import { SceneManager } from './scene-manager.service';
/**
 * Logic for the main game loop.
 * @internal
 */
@Injectable({ providedIn: 'game' })
export class GameLoop {

  #time = 0;
  #delta = 0;
  #lastFrameTime = 0;
  #totalFrames = 0;
  #gameStartTime = Date.now();

  #stats?: Stats;

  #updated = new Subject<void>();
  #started = new Subject<void>();
  #destroyed = new Subject<void>();
  #completed = new Subject<void>();
  /** An observable that can be subscribed to, to get updates when a game loop tick takes place. */
  updated$ = this.#updated.pipe(share());
  started$ = this.#started.pipe(share());
  destroyed$ = this.#destroyed.pipe(share());
  completed$ = this.#completed.pipe(share());
  gameConfig = Injector.get(GameConfig)!;
  cameraManager = Injector.get(CameraManager)!;

  get time() { return this.#time; }
  get delta() { return this.#delta; }
  get frames() { return this.#totalFrames; }

  private lastUpdate = Date.now();

  private get gameObjects() { return this.gameObjectManager.gameObjects; }

  /**
   * **Warning:** Do not subscribe to this.
   *
   * This is the main game loop. It is subscribed to within the engine, and engine only.
   * @internal
   */
  loop$ = timer(0, 0)
    // loop$ = of(1)
    .pipe(
      // tap(() => console.log(this.sceneManager.activeScene)),
      // tap(() => this.#updateTiming()),
      map(() => Date.now()),
      filter(time => (time - this.lastUpdate) / 1000 >= 1 / 60),
      tap(time => this.lastUpdate = time),
      // Start all the game objects that haven't been started.
      concatMap(() => from(this.gameObjects).pipe(
        tap(i => this.#startGameObject(i)),
        toArray(),
        tap(() => this.#started.next())
      )),
      // Run all the updates.
      concatMap(() => from(this.gameObjects).pipe(
        tap(i => this.#updateGameObject(i)),
        toArray(),
        tap(() => this.#updated.next())
      )),
      // Destroy all the game objects that need to be destroyed.
      concatMap(() => from(this.gameObjects).pipe(
        tap(i => this.#destroyGameObject(i)),
        toArray(),
        tap(() => this.#destroyed.next())
      )),
      tap(() => this.#completed.next()),
      share(),
    );

  animate$ = animationFrames().pipe(
    tap(() => this.#stats?.begin()),
    tap(() => this.#updateTiming()),
    concatMap(() => from(this.gameObjects).pipe(
      tap(i => this.#updateAnimationFrame(i)),
      toArray()
    )),
    tap(() => this.#renderGame()),
    tap(() => this.#stats?.end()),
  );

  constructor(
    private readonly gameObjectManager: GameObjectManager,
    private readonly sceneManager: SceneManager
  ) {
    const stats = this.gameConfig.get('stats');
    const production = this.gameConfig.get('production');
    if (stats === true || (typeof stats === 'undefined' && !production)) {
      import('stats.js').then(stats => {
        this.#stats = new stats.default();
        this.#stats.showPanel(0);
        document.body.appendChild(this.#stats.dom);
      });
    }
  }

  #updateTiming() {
    const now = Date.now();
    this.#time = (this.#lastFrameTime - this.#gameStartTime) / 1000;
    this.#delta = (now - this.#lastFrameTime) / 1000;
    this.#lastFrameTime = now;
    this.#totalFrames++;
  }

  #startGameObject(obj: GameObjectBase) {
    if (obj.started === false) {
      obj.onStart();
    }
  }

  #updateGameObject(obj: GameObjectBase) {
    if (obj.started === true) {
      obj.onUpdate();
    }
  }

  #updateAnimationFrame(obj: GameObjectBase) {
    if (obj.started === true) {
      obj.onFrame();
    }
  }

  #destroyGameObject(obj: GameObjectBase) {
    if (obj.onDestroy?.()) {
      this.gameObjectManager.destroy(obj);
    }
  }

  #renderGame() {
    // console.log('render');
    // Find all the active game scenes and add them to the root scene.
    const activeScenes = this.sceneManager.scenes.filter(i => i.isActive === true);
    activeScenes.forEach(s => this.sceneManager.rootScene.add(s.scene));

    // If a debugging scene is set add it to the root scene.
    if (this.sceneManager.debugScene instanceof Three.Scene) {
      this.sceneManager.rootScene.add(this.sceneManager.debugScene);
    }

    const activeCameras = this.cameraManager.activeCameras;

    for (let camera of activeCameras) {
      const renderer = this.gameConfig.get('renderer');
      renderer.setClearColor(camera.background.threeColor, camera.background.alpha);
      renderer.render(this.sceneManager.rootScene, camera.camera);
    }
  }

}