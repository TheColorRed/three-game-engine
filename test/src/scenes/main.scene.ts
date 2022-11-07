import { Scene } from '@engine/core';
import { MainCamera } from '../prefabs/main-camera.prefab';
import { MainLight } from '../prefabs/main-light.prefab';
import { Space } from '../prefabs/particles/space.prefab';

@Scene({
  hierarchy: [MainCamera, MainLight, Space]
})
export class MainScene { }