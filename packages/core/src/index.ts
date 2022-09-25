import 'reflect-metadata';
import * as Three from 'three';
export * from './2d';
export * from './3d';
export * from './area';
export * from './debug';
export * from './decorators';
export * from './di';
export * from './engine';
export * from './object-list';
export * from './resource';
export * from './tokens';
export * from './transforms';
export { Three };

export interface OnStart {
  /** Executed one time after the object is created. */
  onStart(): void;
};
export interface OnUpdate {
  /** Executed on once per frame. */
  onUpdate(): void;
};
export interface OnEnable {
  /** Executed when the object becomes enabled. */
  onEnable(): void;
};
export interface OnDisable {
  /** Executed when the object becomes disabled. */
  onDisable(): void;
};
export interface OnDestroy {
  /** Executed when the object gets destroyed. */
  onDestroy(): void;
};