import { GameScene } from '../classes/game-scene';
import { Injector, Newable } from '../di';
import { GameConfig, GameOptions } from '../services';
import { Three } from '../three';


export interface Gizmos {
  colliders: boolean;
}

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

export interface Game { }

export function Game(options: GameOptions) {
  return (target: Newable<object>) => {
    return class extends target implements Game {
      constructor() {
        super();
        const config = Injector.get(GameConfig)!;
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
      }
    };
  };
}