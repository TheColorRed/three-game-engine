import { GameScene } from '../classes';
import { GameModule, GameOptions, Gizmos } from '../decorators';
import { Injectable, Newable } from '../di';
import { Three } from '../three';

export interface GameConfiguration {
  registeredScenes: Newable<GameScene>[];
  mainScene: new (activate?: boolean) => GameScene;
  aspect: number;
  fixedSize: boolean;
  production: boolean;
  width: number;
  height: number;
  gizmos: Gizmos;
  stats?: boolean;
  options: GameOptions;
  renderer: Three.WebGLRenderer;
  canvas: HTMLCanvasElement;
}

@Injectable({ providedIn: 'game' })
export class GameConfig {
  #options: Partial<GameConfiguration> = {};
  imports: Newable<GameModule>[] = [];
  /**
   * Set the initial game options.
   * @internal
   */
  set(options: GameConfiguration) {
    this.#options = options;
  }
  /** @internal */
  setImports(imports: Newable<GameModule>[]) {
    this.imports = imports;
  }
  /**
   * The configuration to get from the loaded config.
   * @param option The name of the configuration option.
   */
  get<T extends keyof GameConfiguration>(option: T) {
    return this.#options[option] as GameConfiguration[T];
  }

  get isPhysicsGizmos() {
    const isProduction = this.get('production');
    return isProduction === false && this.#options.gizmos?.colliders;
  }
}