import { Three } from '../three';
export abstract class Resource<T extends Three.Object3D = Three.Object3D> {

  abstract destroy(): void;

  object!: T;

}