import { Vector3 } from '@engine/core';
import { Camera } from '@engine/objects';

@Camera({
  isMainCamera: true,
  position: new Vector3(0, 0, 1),
  projection: 'orthographic',
  tag: 'MainCamera',
  size: 60
})
export class MainCamera { }