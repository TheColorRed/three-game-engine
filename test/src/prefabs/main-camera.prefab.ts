import { Camera, Vector3 } from '@engine/core';

@Camera({
  name: 'MainCamera',
  isMainCamera: true,
  position: new Vector3(0, 0, 10),
  projection: 'perspective',
  tag: 'MainCamera',
  // size: 50
})
export class MainCamera { }