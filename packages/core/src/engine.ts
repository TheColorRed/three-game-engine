import { animationFrames, concat, filter, finalize, first, Observable, of, tap, timer } from 'rxjs';
import { GameObject } from './classes';
import { Debug } from './debug';
import { Game, SceneHierarchy } from './decorators';
import { Injector, Newable, Type } from './di';
import { Resource } from './resource';
import { CameraManager, GameObjectManager, SceneManager } from './services';
import { GameLoop } from './services/game-loop.service';
import { Three } from './three';
import { TOKEN_INJECTABLE } from './tokens';

export class Engine {

  // static gameObjects: GameObject[] = [];
  // static gameScenes: GameScene[] = [];

  static renderer = new Three.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  static canvas = this.renderer.domElement;

  static game: Game;
  static #stats: Stats;
  static #production = true;
  static get production() { return this.#production; }
  static camera: CameraManager = Injector.get(CameraManager)!;
  static scene: SceneManager = Injector.get(SceneManager)!;
  static gameObject: GameObjectManager = Injector.get(GameObjectManager)!;
  static readyToRender = false;

  static start(gameEntryPoint: Newable<object>) {

    document.querySelector('.container')?.appendChild(this.renderer.domElement);
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
      if (!this.game.mainScene) {
        throw new Error('There is no main scene defined.');
      }

      this.#production = this.game.production;
      Debug.log('Production:', this.production);

      // Create an instance of the main scene and load its hierarchy.
      // this.activeScene = new this.game.mainScene(true);
      this.scene.activeScene = new this.game.mainScene(true);

      if (this.game.stats === true || (typeof this.game.stats === 'undefined' && !this.production)) {
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
    const aspect = this.game.aspect;
    if (this.game.fixedSize) {
      this.renderer.setSize(this.game.width ?? window.innerWidth, this.game.height ?? window.innerHeight);
      return;
    }
    aspect > 1 ?
      this.renderer.setSize(window.innerWidth, window.innerWidth / aspect) :
      this.renderer.setSize(window.innerHeight * aspect, window.innerHeight);
    // aspect > 1 ?
    //   this.renderer.setViewport(0, 0, window.innerWidth, window.innerWidth / aspect) :
    //   this.renderer.setViewport(0, 0, window.innerHeight * aspect, window.innerHeight);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  static #renderGame() {
    const activeScene = this.scene.gameScenes.find(i => i.isActive === true);
    if (typeof this.camera.activeCamera !== 'undefined' && typeof activeScene !== 'undefined') {
      // console.log(this.camera.activeCamera.camera);
      this.renderer.render(activeScene.scene, this.camera.activeCamera.camera);
    }
  }

  // static instantiate<T>(item: Type<T>): T {
  //   const gameObject = Injector.create(item).get(item) as GameObject;

  //   this.gameObjects.push(gameObject);
  //   return gameObject as unknown as T;
  // }

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