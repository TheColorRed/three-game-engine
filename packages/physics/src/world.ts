// @ts-ignore
import Ammo from 'ammo.js';

export class World {

  private static _worldCreated = false;

  static get created() {
    return this._worldCreated;
  }

  static create() {
    if (this._worldCreated) return;
    Ammo().then((Ammo: any) => {
      this._worldCreated = true;
      console.log(Ammo);
      let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver(),
        dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
      dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

      let groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50)),
        bodies = [],
        groundTransform = new Ammo.btTransform();

      groundTransform.setIdentity();
      groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));
    });
  }
}