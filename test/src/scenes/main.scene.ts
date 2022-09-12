import { Scene } from '@engine/core';
import { MainCamera } from '../prefabs/main-camera.prefab';
import { Player } from '../prefabs/Player.prefab';

@Scene({
  hierarchy: [MainCamera, Player]
})
export class MainScene { }