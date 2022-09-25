import { Scene } from '@engine/objects';
import { Ground } from '../prefabs/ground.prefab';
import { MainCamera } from '../prefabs/main-camera.prefab';
import { Player } from '../prefabs/player.prefab';

@Scene({
  hierarchy: [MainCamera, Ground, Player]
})
export class MainScene { }