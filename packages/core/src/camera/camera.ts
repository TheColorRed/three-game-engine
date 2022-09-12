import { Camera } from 'three';

export interface GameCamera extends Camera {
  get isActive(): boolean;
  setActive(): void;
}