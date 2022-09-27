import { PhysicsMaterial } from '@engine/physics';

@PhysicsMaterial({ bounciness: 1 })
export class FullBounce { }

@PhysicsMaterial({ bounciness: 0.5 })
export class HalfBounce { }