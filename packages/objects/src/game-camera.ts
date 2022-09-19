import { Three } from '@engine/core';
import { GameObject } from './game-object';

export interface GameCamera extends GameObject {
  readonly camera: Three.Camera;
  get aspect(): number;
}