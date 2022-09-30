import { animationFrames, concat, filter, finalize, first, Observable, of, tap, timer } from 'rxjs';
import { GameObject } from './classes';
import { Debug } from './debug';
import { Game, SceneHierarchy } from './decorators';
import { Injector, Newable, Type } from './di';
import { Resource } from './resource';
import { CameraManager, GameConfig, GameObjectManager, SceneManager } from './services';
import { GameLoop } from './services/game-loop.service';
import { Three } from './three';
import { TOKEN_INJECTABLE } from './tokens';

export class Engine {

  static game: Game;
  static #stats: Stats;
  static #production = true;
  static get production() { return this.#production; }
  static camera: CameraManager = Injector.get(CameraManager)!;
  static scene: SceneManager = Injector.get(SceneManager)!;
  static gameObject: GameObjectManager = Injector.get(GameObjectManager)!;
  static readyToRender = false;
  static gameConfig = Injector.get(GameConfig)!;

  static start(gameEntryPoint: Newable<object>) {

    const gameLoop = Injector.create(GameLoop).get(GameLoop)!;

    // Run the main game loop.
    concat(
      of(true).pipe(tap(() => {
        Debug.log('Initializing core services..');
        this.camera = Injector.create(CameraManager).get(CameraManager)!;
        // this.managers = new Managers();
      }), tap(() => this.readyToRender = true)),
      this.#initializeGame(gameEntryPoint),
      this.#initializePhysics(),
      this.#initializeGameObjects(),
      gameLoop.loop$
    ).subscribe();

    // Render the game
    animationFrames().pipe(
      filter(() => this.readyToRender === true),
      tap(() => this.#stats && this.#stats.begin()),
      tap(() => this.#renderGame()),
      tap(() => this.#stats && this.#stats.end()),
    ).subscribe();
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
          this.scene.debugScene = new Three.Scene();
        }
      }


      // Create an instance of the main scene and load its hierarchy.
      // this.activeScene = new this.game.mainScene(true);
      const mainScene = this.gameConfig.get('mainScene');
      this.scene.activeScene = new mainScene(true);
      const stats = this.gameConfig.get('stats');
      if (stats === true || (typeof stats === 'undefined' && !this.production)) {
        import('stats.js').then(stats => {
          this.#stats = new stats.default();
          this.#stats.showPanel(0);
          document.body.appendChild(this.#stats.dom);
        });
      }
      sub.complete();
    });
  }

  static #initializeGameObjects() {
    return timer(100, 0).pipe(
      filter(() => Array.from(Resource.resources.values()).every(i => i.loaded === true)),
      first(),
      tap(() => {
        Debug.log('Loading Game Objects...');
        this.#loadGameObjects(this.scene.activeScene?.registeredGameObjects ?? []);

        this.#updateRendererSize();
        window.addEventListener('resize', this.#updateRendererSize.bind(this));
      })
    );
  }

  static #loadGameObjects(item: GameObject | SceneHierarchy = []) {
    if (typeof item === 'function') {
      this.scene.instantiate(item as Type<any>);
    } else if (Array.isArray(item)) {
      for (let i of item) {
        this.#loadGameObjects(i);
      }
    }
  }
  /**
   * Turn on physics if the module has been included in the package.json.
   */
  static #initializePhysics() {
    return new Observable<void>(sub => {
      try {
        import('@engine/physics').then(physics => {
          const physicsWorld = Injector.create(physics.World).get(physics.World)!;
          physicsWorld.create().pipe(
            finalize(() => sub.complete())
          ).subscribe();
        });
      } catch (e) { }
    });
  }

  static #updateRendererSize() {
    const aspect = this.gameConfig.get('aspect');
    const renderer = this.gameConfig.get('renderer');
    if (this.gameConfig.get('fixedSize')) {
      renderer.setSize(this.gameConfig.get('width') ?? window.innerWidth, this.gameConfig.get('height') ?? window.innerHeight);
      return;
    }
    aspect > 1 ?
      renderer.setSize(window.innerWidth, window.innerWidth / aspect) :
      renderer.setSize(window.innerHeight * aspect, window.innerHeight);
    // aspect > 1 ?
    //   this.renderer.setViewport(0, 0, window.innerWidth, window.innerWidth / aspect) :
    //   this.renderer.setViewport(0, 0, window.innerHeight * aspect, window.innerHeight);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  static #renderGame() {
    // Find all the active game scenes and add them to the root scene.
    const activeScenes = this.scene.scenes.filter(i => i.isActive === true);
    activeScenes.forEach(s => this.scene.rootScene.add(s.scene));

    // If a debugging scene is set add it to the root scene.
    if (this.scene.debugScene instanceof Three.Scene) {
      this.scene.rootScene.add(this.scene.debugScene);
    }

    // Render the game
    if (typeof this.camera.activeCamera !== 'undefined') {
      const renderer = this.gameConfig.get('renderer');
      renderer.render(this.scene.rootScene, this.camera.activeCamera.camera);
    }
  }

  static destroyLocalService(gameObject: GameObject & { [key: string]: any; }) {
    for (let [key, obj] of Object.entries(gameObject)) {
      if (typeof obj === 'object') {
        const isInjectable = Reflect.hasMetadata(TOKEN_INJECTABLE, obj.constructor);
        const meta = Reflect.getMetadata(TOKEN_INJECTABLE, obj.constructor);
        if (meta === 'local' && isInjectable && typeof gameObject[key].onDestroy === 'function') {
          gameObject[key].onDestroy();
        }
        if (isInjectable) {
          this.destroyLocalService(obj);
        }
      }
    }
  }

}