
import { CameraManager, GameCamera, GameObject, GameScene, GAME_OBJECT_CHILDREN, SceneHierarchy, SceneManager } from '@engine/objects';
import { PHYSICS_RIGIDBODY, World } from '@engine/physics';
import { animationFrames, concat, filter, finalize, first, from, Observable, of, Subject, switchAll, switchMap, tap, timer, toArray } from 'rxjs';

import type { Game } from '@engine/core';
import { Debug, Injector, Resource, TOKEN_INJECTABLE, Type } from '@engine/core';
import { WebGLRenderer } from 'three';

export class Engine {

  static gameObjects: GameObject[] = [];
  static gameScenes: GameScene[] = [];
  static #time = 0;
  static #delta = 0;
  static #lastTime = 0;
  static #start = Date.now();
  static #frames = 0;

  static get time() { return this.#time; }
  static get delta() { return this.#delta; }
  static get frames() { return this.#frames; }
  static renderer = new WebGLRenderer({
    alpha: true,
    antialias: true
  });
  static canvas = this.renderer.domElement;

  static #updated = new Subject<void>();
  static updated$ = this.#updated.asObservable();

  // static get activeCamera() {
  //   const cam = this.gameObjects.find(i => i.gameObjectType === 'camera' && i.isActive === true) as GameCamera | undefined;
  //   // console.log(cam);
  //   return cam;
  // };
  // static activeScene: GameScene;
  static game: Game;
  static #stats: Stats;
  static #production = true;
  static get production() { return this.#production; }
  static cameraManager: CameraManager;
  static sceneManager: SceneManager;
  static readyToRender = false;

  static start(gameEntryPoint: new () => object) {

    document.querySelector('.container')?.appendChild(this.renderer.domElement);

    // Run the main game loop.
    concat(
      of(true).pipe(tap(() => {
        Debug.log('Initializing core services..');
        this.cameraManager = Injector.create(CameraManager).get(CameraManager) as CameraManager;
        this.sceneManager = Injector.create(SceneManager).get(SceneManager) as SceneManager;
      }), tap(() => this.readyToRender = true)),
      this.#initializeGame(gameEntryPoint),
      this.#initializePhysics(),
      this.#initializeGameObjects(),
      timer(0, 0)
    )
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
      )
      .subscribe();

    // Render the game
    animationFrames().pipe(
      filter(() => this.readyToRender === true),
      tap(() => this.#stats && this.#stats.begin()),
      tap(() => this.#renderGame()),
      tap(() => this.#stats && this.#stats.end()),
    ).subscribe();
  }

  static #initializeGame(gameEntryPoint: new () => object) {
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
      this.sceneManager.activeScene = new this.game.mainScene(true);

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
        this.#loadGameCameras(this.sceneManager.activeScene?.registeredGameObjects);
        this.#loadGameObjects(this.sceneManager.activeScene?.registeredGameObjects ?? []);

        this.#updateRendererSize();
        window.addEventListener('resize', this.#updateRendererSize.bind(this));
      })
    );
  }

  static #loadGameCameras(item: GameCamera | SceneHierarchy = []) {
    // console.log(item instanceof GameCamera);
    if (typeof item === 'function') {
      this.instantiate(item as Type<any>);
    } else if (Array.isArray(item)) {
      for (let i of item) {
        this.#loadGameCameras(i);
      }
    }
  }

  static #loadGameObjects(item: GameObject | SceneHierarchy = []) {
    if (typeof item === 'function') {
      this.instantiate(item as Type<any>);
    } else if (Array.isArray(item)) {
      for (let i of item) {
        this.#loadGameObjects(i);
      }
    }
  }


  static #initializePhysics() {
    return new Observable(sub => {
      import('@engine/physics').then(physics => {
        const physicsWorld = Injector.create(physics.World)
          .get(physics.World) as World;
        physicsWorld.create().pipe(
          finalize(() => sub.complete())
        ).subscribe();
      });
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
    const activeScene = this.gameScenes.find(i => i.isActive === true);
    if (typeof this.cameraManager.activeCamera !== 'undefined' && typeof activeScene !== 'undefined') {
      this.renderer.render(activeScene.scene, this.cameraManager.activeCamera.camera);
    }
  }

  static instantiate<T>(item: Type<T>): T {
    const gameObject = Injector.create(item).get(item) as GameObject;

    this.gameObjects.push(gameObject);
    return gameObject as unknown as T;
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

  static #startGameObject(obj: GameObject) {
    if (obj.started === false) {
      obj.onStart();
    }
  }

  static #updateGameObject(obj: GameObject) {
    if (obj.started === true) {
      obj.onUpdate();
    }
  }

  static #updateTiming() {
    const now = Date.now();
    this.#time = (this.#lastTime - this.#start) / 1000;
    this.#delta = (now - this.#lastTime) / 1000;
    this.#lastTime = now;
    this.#frames++;
  }

  static #destroyGameObject(obj: GameObject) {
    if (obj.onDestroy?.()) {
      const p = Reflect.getMetadata(PHYSICS_RIGIDBODY, obj.constructor);
      if (typeof p !== 'undefined') {
        const world = Injector.get(World);
        world?.remove(obj);
      }
      this.#deleteAllGameObjectRefs(obj);
      const idx = this.gameObjects.indexOf(obj);
      if (idx > -1) this.gameObjects.splice(idx, 1);
    }
  }

  static #deleteAllGameObjectRefs(obj: GameObject) {
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