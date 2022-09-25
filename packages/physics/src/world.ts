import { Debug, Euler, Injectable, PHYSICS_RIGIDBODY, Vector3 } from '@engine/core';
import { GameObject } from '@engine/objects';
import { RigidbodyOptions } from '@engine/physics';
import Ammo from 'ammojs-typed';
import { auditTime, from, Observable, of, switchMap, tap, timer } from 'rxjs';

@Injectable({ providedIn: 'game' })
export class World {

  private _worldCreated = false;
  private Ammo!: typeof Ammo;
  private dynamicWorld!: Ammo.btDiscreteDynamicsWorld;
  bodies: [gameObject: GameObject, rigidbody: Ammo.btRigidBody][] = [];

  globalTransform!: Ammo.btTransform;

  worldSteps$ = timer(1 / 60, 0)
    .pipe(
      tap(() => this.dynamicWorld.stepSimulation(1 / 60, 10)),
      auditTime(50),
      switchMap(() => from(this.bodies).pipe(
        tap(([obj, body]) => {
          const state = body.getMotionState();
          if (state) {
            state.getWorldTransform(this.globalTransform);
            const px = this.globalTransform.getOrigin().x();
            const py = this.globalTransform.getOrigin().y();
            const pz = this.globalTransform.getOrigin().z();
            const rx = this.globalTransform.getRotation().x();
            const ry = this.globalTransform.getRotation().y();
            const rz = this.globalTransform.getRotation().z();
            obj.position = new Vector3(px, py, pz);
            obj.rotation = new Euler(rx, ry, rz);
            // console.log(obj.position.toArray());
          }
        })
      ))
    );

  get created() {
    return this._worldCreated;
  }

  /**
   * Removes a game object from the physics world.
   * @param gameObject The game object to remove.
   */
  remove(gameObject: GameObject) {
    const idx = this.bodies.findIndex(([go]) => go === gameObject);
    if (idx > -1) {
      const body = this.bodies[idx][1];
      this.dynamicWorld.removeRigidBody(body);
      this.bodies.splice(idx, 1);
    }
  }

  /**
   * Adds a game object into the physics world.
   * @param gameObject The game object to add.
   */
  add(gameObject: GameObject) {
    const opts = Reflect.getMetadata(PHYSICS_RIGIDBODY, gameObject.instance.constructor) as RigidbodyOptions;
    const goPos = gameObject.position;
    // console.log(gameObject.name, goTrans.toArray());

    const transform = new this.Ammo.btTransform();
    transform.setOrigin(new this.Ammo.btVector3(...goPos.toArray()));

    const motionState = new this.Ammo.btDefaultMotionState(transform);
    const shape = this.createShape(opts);
    const inertia = new this.Ammo.btVector3(0, 0, 0);

    const info = new this.Ammo.btRigidBodyConstructionInfo(opts.mass, motionState, shape, inertia);
    const body = new this.Ammo.btRigidBody(info);
    this.dynamicWorld.addRigidBody(body);

    this.bodies.push([gameObject, body]);
  }

  createShape(options: RigidbodyOptions) {
    switch (options.shape?.type) {
      case 'sphere':
        return new this.Ammo.btSphereShape(options.shape.radius);
      case 'cube':
        var { width, height, depth } = options.shape.size;
        console.log(options.shape.size);
        return new this.Ammo.btBoxShape(new this.Ammo.btVector3(width, height, depth));
      case 'cone':
        var { radius, height } = options.shape.size;
        return new this.Ammo.btConeShape(radius, height);
      case 'convex':
        return new this.Ammo.btConvexShape();
      case 'concave':
        return new this.Ammo.btConcaveShape();
      case 'capsule':
        var { radius, height } = options.shape.size;
        return new this.Ammo.btCapsuleShape(radius, height);
      case 'none': // Use the default shape
      default:
        return new this.Ammo.btEmptyShape();
    }
  }

  create() {
    if (this._worldCreated) return of();

    return new Observable(sub => {
      Debug.log('Creating Physics World...');
      Ammo().then(Ammo => {
        this.Ammo = Ammo;
        this._worldCreated = true;

        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
          dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
          overlappingPairCache = new Ammo.btDbvtBroadphase(),
          solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.dynamicWorld = new this.Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.dynamicWorld.setGravity(new this.Ammo.btVector3(0, -9.81, 0));

        this.globalTransform = new this.Ammo.btTransform();

        this.worldSteps$.subscribe();

        // let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        //   dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        //   overlappingPairCache = new Ammo.btDbvtBroadphase(),
        //   solver = new Ammo.btSequentialImpulseConstraintSolver(),
        //   dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        // dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

        // let groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50)),
        //   groundTransform = new Ammo.btTransform();

        // groundTransform.setIdentity();
        // groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));

        sub.complete();
      });
    });
  }
}