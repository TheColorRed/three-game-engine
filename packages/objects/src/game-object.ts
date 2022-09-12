import { Vector3 } from '@engine/core';
import { Object3D } from 'three';

export interface GameObject {
  // [key: string]: any;
  readonly gameObjectType: 'gameObject' | 'camera';
  name: string;
  markedForDeletion: boolean;
  isActive: boolean;
  position: Vector3;
  /** @internal */
  started: boolean;
  /** @internal */
  methods: string[];
  tag: string;
  object3d: Object3D;
  start?(): void;
  update?(): void;
  destroy?(): boolean;
}