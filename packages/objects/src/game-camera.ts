import { Camera } from 'three';
import { GameObject } from './game-object';

export interface GameCamera extends GameObject {
  readonly camera: Camera;
  get aspect(): number;
}