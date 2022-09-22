import { Euler, ObjectList, Three, Vector3 } from '@engine/core';

export interface GameObject {
  readonly gameObjectType: 'gameObject' | 'camera';
  name: string;
  markedForDeletion: boolean;
  isActive: boolean;
  position: Vector3;
  rotation: Euler;
  tag: string;
  object3d: Three.Object3D;
  /** @internal */
  started: boolean;
  /** @internal */
  startPosition: Three.Vector3;
  /** @internal */
  methods: string[];
  /** @internal */
  children: ObjectList<GameObject>;
  onStart?(): void;
  onUpdate?(): void;
  onDestroy?(): boolean;
}