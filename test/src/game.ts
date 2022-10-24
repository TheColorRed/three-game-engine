import { Game } from '@engine/core';
import { InputModule } from '@engine/input';
import { Physics2DModule } from '@engine/physics2d';
import { environment } from './environments/environment';
import { MainScene } from './scenes/main.scene';

@Game({
  scenes: [MainScene],
  main: MainScene,
  aspect: 16 / 9,
  production: environment.production,
  gizmos: { colliders: true },
  imports: [
    InputModule,
    Physics2DModule
  ]
})
export class MainGame { }