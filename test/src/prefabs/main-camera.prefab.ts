import { Camera, Vector3 } from '@engine/core';

@Camera({
  name: 'MainCamera',
  isMainCamera: true,
  position: new Vector3(0, 0, 1),
  projection: 'orthographic',
  tag: 'MainCamera',
  size: 60
})
export class MainCamera { }