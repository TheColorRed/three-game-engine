import { GameScene } from './scene';

export interface GameOptions {
  main: new () => object;
  scenes?: (new () => object)[];
  aspect?: number | `${number}x${number}`;
}

export interface Game {
  registeredScenes: (new () => GameScene)[];
  mainScene: new (activate?: boolean) => GameScene;
  aspect: number;
  fixedSize: boolean;
  width?: number;
  height?: number;
}

export function Game(options: GameOptions) {
  return (target: new () => object) => {
    return class extends target implements Game {
      registeredScenes = (options?.scenes as (new () => GameScene)[]) || [];
      mainScene = options.main as new () => GameScene;
      aspect: number;
      fixedSize: boolean;
      width = 0;
      height = 0;

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