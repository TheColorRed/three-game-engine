import { Engine, Game } from '@engine/core';
import { MainScene } from './scenes/main.scene';

@Game({
  scenes: [MainScene],
  main: MainScene,
  aspect: 16 / 9
})
export class MainGame { }

Engine.start(MainGame);