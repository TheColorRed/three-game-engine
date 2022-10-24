import { concat, EMPTY, first, merge, Observable, tap } from 'rxjs';
import { Debug } from './debug';
import { Game } from './decorators/game';
import { GameModule } from './decorators/module';
import { Injector } from './di/injector';
import { Newable } from './di/types';
import { CameraManager } from './services/camera-manager.service';
import { GameConfig } from './services/game-config.service';
import { GameLoop } from './services/game-loop.service';
import { GameObjectManager } from './services/game-object-manager.service';
import { SceneManager } from './services/scene-manager.service';
import { Three } from './three';

export class Engine {

  static game: Game;
  static #production = true;
  static get production() { return this.#production; }
  static cameraManager = Injector.get(CameraManager)!;
  static sceneManager = Injector.get(SceneManager)!;
  static gameObject: GameObjectManager = Injector.get(GameObjectManager)!;
  static gameConfig = Injector.get(GameConfig)!;

  static start(gameEntryPoint: Newable<object>) {

    const gameLoop = Injector.get(GameLoop)!;
    // Update renderer once the camera changes
    this.cameraManager.cameraChange$.pipe(first(), tap(() => this.#updateRendererSize())).subscribe();

    // Run the main game loop.
    concat(
      this.#initializeServices(),
      this.#initializeModules(),
      this.#initializeGame(gameEntryPoint),
      this.#setupRenderer(),
      merge(
        gameLoop.animate$,
        gameLoop.loop$
      )
    ).subscribe();
  }

  static #initializeServices() {
    return new Observable(sub => {
      Debug.log('Initializing core services...');
      this.cameraManager = Injector.get(CameraManager)!;
      sub.complete();
    });
  }

  static #initializeModules() {
    return new Observable(sub => {
      Debug.log('Initializing modules...');
      GameModule.init(this.gameConfig.imports).subscribe({ complete: () => sub.complete() });
    });
  }

  static #initializeGame(gameEntryPoint: Newable<object>) {
    return new Observable(sub => {
      this.game = new gameEntryPoint() as Game;
      if (!this.game) {
        throw new Error('There must be at least one game defined.');
      }

      // If there isn't a entry scene defined throw error.
      if (!this.gameConfig.get('mainScene')) {
        throw new Error('There is no main scene defined.');
      }

      document.querySelector('.container')?.appendChild(this.gameConfig.get('canvas'));

      this.#production = this.gameConfig.get('production');
      Debug.log('Production:', this.#production);
      if (this.#production === false) {
        const gizmos = Object.entries(this.gameConfig.get('gizmos'));
        const showGizmos = gizmos.some(([, enabled]) => enabled === true);
        if (showGizmos) {
          this.sceneManager.debugScene = new Three.Scene();
        }
      }

      // Create an instance of the main scene and load its hierarchy.
      const mainScene = this.gameConfig.get('mainScene');
      this.sceneManager.activeScene = new mainScene(true);
      sub.complete();
    });
  }

  static #setupRenderer() {
    this.#updateRendererSize();
    window.addEventListener('resize', this.#updateRendererSize.bind(this));
    return EMPTY;
  }

  static #updateRendererSize() {
    const aspect = this.gameConfig.get('aspect');
    const renderer = this.gameConfig.get('renderer');

    // const active = this.camera.activeCamera?.camera;
    // if (active instanceof Three.PerspectiveCamera) {
    //   active.aspect = window.innerWidth / window.innerHeight;
    //   active.updateProjectionMatrix();
    //   renderer.setPixelRatio(window.devicePixelRatio);
    //   renderer.setSize(window.innerWidth, window.innerHeight);
    // }


    // if (this.gameConfig.get('fixedSize')) {
    //   renderer.setSize(this.gameConfig.get('width') ?? window.innerWidth, this.gameConfig.get('height') ?? window.innerHeight);
    //   return;
    // }

    // aspect > 1 ?
    //   renderer.setSize(window.innerWidth, window.innerWidth / aspect) :
    //   renderer.setSize(window.innerHeight * aspect, window.innerHeight);
  }

}