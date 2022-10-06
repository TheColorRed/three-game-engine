import { Game } from '@engine/core';
import { InputModule } from '@engine/input';
import { PhysicsModule } from '@engine/physics';
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
    PhysicsModule
  ]
})
export class MainGame { }