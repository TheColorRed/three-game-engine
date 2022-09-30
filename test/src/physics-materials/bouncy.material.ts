import { PhysicsMaterial } from '@engine/physics';

@PhysicsMaterial({ bounciness: 1 })
export class FullBounce { }

@PhysicsMaterial({
  // bounciness: 0.5,
  // friction: 0.6
})
export class HalfBounce { }