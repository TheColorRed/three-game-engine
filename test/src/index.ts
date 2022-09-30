import { Engine, Game } from '@engine/core';
import { environment } from './environments/environment';
import { MainScene } from './scenes/main.scene';

@Game({
  scenes: [MainScene],
  main: MainScene,
  aspect: 16 / 9,
  production: environment.production,
  gizmos: { colliders: true }
})
export class MainGame { }

Engine.start(MainGame);
