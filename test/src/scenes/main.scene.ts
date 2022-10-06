import { Scene } from '@engine/core';
import { Ground } from '../prefabs/ground.prefab';
import { MainCamera } from '../prefabs/main-camera.prefab';
import { PlayerModule } from '../prefabs/player/player.module';

@Scene({
  hierarchy: [MainCamera, Ground, PlayerModule]
})
export class MainScene { }