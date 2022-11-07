import { Animation, AnimationPropertyTrack } from '@engine/animation';
import { Vector3 } from '@engine/core';
import { Space } from '../prefabs/particles/space.prefab';

@Animation({
  duration: 2,
  tracks: [
    {
      name: 'Move',
      type: 'property',
      reference: Space,
      property: 'position',
      keyframes: [
        { time: 1, value: new Vector3(0, 0, 0) }
      ]
    } as AnimationPropertyTrack<Vector3>
  ]
})
export class MainAnimation { }