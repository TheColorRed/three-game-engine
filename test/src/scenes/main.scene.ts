import { Scene } from '@engine/core';
import { MainCamera } from '../prefabs/main-camera.prefab';
import { Fire } from '../prefabs/particles/fire.prefab';

@Scene({
  hierarchy: [MainCamera, Fire]
})
export class MainScene { }