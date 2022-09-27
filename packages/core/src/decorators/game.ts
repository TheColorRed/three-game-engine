import { GameScene } from '../classes';
import { Newable } from '../di';

export interface GameOptions {
  main: Newable<object>;
  production: boolean;
  scenes?: Newable<object>[];
  aspect?: number | `${number}x${number}`;
  stats?: boolean;
  gizmos?: boolean;
}

export interface Game {
  registeredScenes: Newable<GameScene>[];
  mainScene: new (activate?: boolean) => GameScene;
  aspect: number;
  fixedSize: boolean;
  production: boolean;
  width: number;
  height: number;
  gizmos: boolean;
  stats?: boolean;
}

export function Game(options: GameOptions) {
  return (target: Newable<object>) => {
    return class extends target implements Game {
      registeredScenes = (options?.scenes as Newable<GameScene>[]) || [];
      mainScene = options.main as Newable<GameScene>;
      aspect: number;
      fixedSize: boolean;
      width = 0;
      height = 0;
      production = options.production;
      stats = options.stats;
      gizmos = options.gizmos ?? false;

      constructor() {
        super();
        if (typeof options.aspect === 'string') {
          let [width, height] = options.aspect.split('x').map(Number);
          this.aspect = width / height;
          this.fixedSize = true;
          this.width = width;
          this.height = height;
        } else {
          this.aspect = options.aspect ?? 16 / 9;
          this.fixedSize = false;
        }
      }
    };
  };
}