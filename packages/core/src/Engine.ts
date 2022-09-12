
import { GameObjectRef } from '@engine/common';
import type { GameCamera, GameObject } from '@engine/objects';
import { animationFrames, concat, filter, first, from, Observable, switchAll, switchMap, tap, timer, toArray } from 'rxjs';
import { WebGLRenderer } from 'three';
import { Injector } from './di/injector';
import { Type } from './di/types';
import { Game } from './game';
import { Resource } from './resource';
import { GameScene } from './scene';
import { TOKEN_INJECTABLE, TOKEN_LISTENER_GLOBAL } from './tokens/tokens';

export class Engine {

  static gameObjects: GameObject[] = [];
  static gameScenes: GameScene[] = [];
  // static gameCameras: GameCamera[] = [];
  // static keyboardManager = Injector.resolve(KeyboardManager);
  private static _time = 0;
  private static _delta = 0;
  private static _lastTime = 0;
  private static _start = Date.now();
  private static _frames = 0;

  static get time() { return this._time; }
  static get delta() { return this._delta; }
  static get frames() { return this._frames; }
  static renderer = new WebGLRenderer({
    alpha: true,
    antialias: true
  });
  static canvas = this.renderer.domElement;

  static get activeCamera() {
    return this.gameObjects.find(i => i.gameObjectType === 'camera' && i.isActive === true) as GameCamera | undefined;
  };
  static activeScene: GameScene;
  static game: Game;

  static start(gameEntryPoint: new () => object) {

    document.querySelector('.container')?.appendChild(this.renderer.domElement);

    // Run the main game loop.
    concat(
      this.initializeGame(gameEntryPoint),
      this.initializeGameObjects(),
      timer(0, 0)
    )
      .pipe(
        switchMap(() => from(this.gameObjects).pipe(
          tap(i => this.startGameObject(i)),
          // tap(() => window.dispatchEvent(new Event('updateTime'))),
          // tap(i => this.timeManager.update()),
          tap(i => this.gameUpdate(i)),
          toArray(),
        )),
        switchAll(),
        tap(i => {
          this.destroyGameObject(i);
          this.gameTiming();
          // this.renderGame();
        }),
      )
      .subscribe();
    animationFrames().pipe(
      tap(() => this.renderGame())
    ).subscribe();
  }

  private static initializeGame(gameEntryPoint: new () => object) {
    return new Observable(sub => {
      this.game = new gameEntryPoint() as Game;
      if (!this.game) {
        throw new Error('There must be at least one game defined.');
      }

      // If there isn't a entry scene defined throw error.
      if (!this.game.mainScene) {
        throw new Error('There is no main scene defined.');
      }

      // If the entry scene is not included in the registered scene list add it.
      if (!this.game.registeredScenes.includes(this.game.mainScene)) {
        this.game.registeredScenes.push(this.game.mainScene);
      }

      // Create an instance of the main scene and load its hierarchy.
      this.activeScene = new this.game.mainScene(true);

      sub.complete();
    });
  }

  private static initializeGameObjects() {
    return timer(100, 0).pipe(
      filter(() => Array.from(Resource.resources.values()).every(i => i.loaded === true)),
      first(),
      tap(() => {
        this.loadGameObjects(this.activeScene.registeredGameObjects);

        this.updateRendererSize();
        window.addEventListener('resize', this.updateRendererSize.bind(this));
      })
    );

    // from(Resource.resources.values()).pipe(
    //   switchMap(resource => timer(100, 100).pipe(
    //     takeWhile(i => resource.loaded === false),
    //     tap(() => console.log('hi'))
    //   )),
    //   toArray(),
    //   tap(console.log)
    // ).subscribe();
  }

  private static updateRendererSize() {
    // const aspect = 1;
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

  private static renderGame() {
    const activeScene = this.gameScenes.find(i => i.activeScene === true);
    if (typeof this.activeCamera !== 'undefined' && typeof activeScene !== 'undefined') {
      this.renderer.render(activeScene.scene, this.activeCamera.camera);
    }
  }

  private static loadGameObjects(item: object | object[]) {
    if (typeof item === 'function') {
      this.instantiate(item as Type<any>);
    } else if (Array.isArray(item)) {
      for (let i of item) {
        this.loadGameObjects(i);
      }
    }
  }

  static instantiate<T>(item: Type<T>): T {
    const go = Injector.resolve(item) as GameObject;

    this.setGameObjectInstances(go, go);

    this.gameObjects.push(go);
    return go as unknown as T;
  }

  private static setGameObjectInstances(gameObject: GameObject, searchObj: object) {
    for (let [key, obj] of Object.entries(searchObj)) {
      if (typeof obj === 'object') {
        const isInjectable = Reflect.hasMetadata(TOKEN_INJECTABLE, obj.constructor);
        if (obj instanceof GameObjectRef && isInjectable) {
          obj.reference = gameObject;
        }
        if (isInjectable) {
          this.setGameObjectInstances(gameObject, obj);
        }
      }
    }
  }

  private static startGameObject(obj: GameObject) {
    if (obj.started === false) {
      obj.start?.();
    }
  }

  private static gameUpdate(obj: GameObject) {
    obj.update?.();
  }

  private static gameTiming() {
    const now = Date.now();
    this._time = (this._lastTime - this._start) / 1000;
    this._delta = now - this._lastTime;
    this._lastTime = now;
    this._frames++;
  }

  private static destroyGameObject(obj: GameObject) {
    if (obj.destroy?.()) {
      const idx = this.gameObjects.indexOf(obj);
      if (idx > -1) {
        const obj = this.gameObjects[idx];
        this.gameObjects.splice(idx, 1);
        const listeners = Reflect.getMetadata(TOKEN_LISTENER_GLOBAL, window);
        // console.log('l', listeners);
      }
    }
  }
}