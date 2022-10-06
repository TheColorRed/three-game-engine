import { GameScene } from '../classes/game-scene';
import { Injector, Newable } from '../di';
import { GameConfig, GameConfiguration } from '../services';
import { Three } from '../three';
import { GAME } from '../tokens';
import { GameModule } from './module';

export interface Gizmos {
  colliders: boolean;
}

export interface GameOptions {
  main: Newable<object>;
  production: boolean;
  scenes?: Newable<object>[];
  aspect?: number | `${number}x${number}`;
  stats?: boolean;
  gizmos?: Gizmos;
  imports?: Newable<object>[];
}

export interface Game { }

/**
 * Sets up the main entry point for the game along with global game settings.
 * @param options The game options
 */
export function Game(options: GameOptions) {
  return (target: Newable<object>) => {
    Reflect.defineMetadata(GAME, options, target);

    const config = Injector.get(GameConfig)!;
    config.setImports(options.imports as Newable<GameModule>[] ?? []);
    const renderer = new Three.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    const gizmosDefaults: Gizmos = {
      colliders: false
    };
    const c: GameConfiguration = {
      registeredScenes: (options?.scenes as Newable<GameScene>[]) || [],
      mainScene: options.main as Newable<GameScene>,
      aspect: 0,
      fixedSize: false,
      width: 0,
      height: 0,
      production: options.production,
      stats: options.stats,
      gizmos: options.gizmos ?? gizmosDefaults,
      options: options,
      renderer: renderer,
      canvas: renderer.domElement
    };

    if (typeof options.aspect === 'string') {
      let [width, height] = options.aspect.split('x').map(Number);
      c.aspect = width / height;
      c.fixedSize = true;
      c.width = width;
      c.height = height;
    } else {
      c.aspect = options.aspect ?? 16 / 9;
      c.fixedSize = false;
    }

    config.set(c);
  };
}