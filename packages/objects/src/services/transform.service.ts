import { GameObjectBase, GameObjectRef, GAME_OBJECT_CHILDREN, Injectable, ObjectList, Three, Vector2, Vector3 } from '@engine/core';

export enum Direction {
  North, South, East, West,
  NorthWest, NorthEast,
  SouthWest, SouthEast
}

@Injectable()
export class Transform {
  /** The current position of the game object. */
  get position() { return this.gameObject.reference.position; }
  /** A reference to the threejs game object. */
  private get object3d() { return this.gameObject.reference.object3d as Three.Object3D; }

  constructor(
    private readonly gameObject: GameObjectRef
  ) { }
  /**
   * Sets the object as a child to another object.
   * @param parent The parent object.
   */
  setParent(parent: GameObjectBase) {
    parent.object3d?.add(this.object3d);
  }
  /**
   * Adds an item as a child of the current object.
   * @param child The item to add as a child.
   */
  addChild(child: GameObjectBase) {
    if (!child.object3d) return;
    const ref = this.gameObject.reference;

    // Make the three.js instance a child.
    ref.object3d?.add(child.object3d);
    // Update the object list on the prefab instance.
    ref.children.setDirty();

    // Update the object list on the user defined instance properties.
    for (let method in ref) {
      let meta = Reflect.getMetadata(GAME_OBJECT_CHILDREN, ref, method);
      if (typeof meta !== 'undefined') {
        ((ref as any)[method] as ObjectList).setDirty();
      }
    }
  }
  /**
   * Moves the object in one direction for every update. Delta time should be taken into account.
   * @param direction The direction in which to move.
   * @param speed The speed at which to move.
   * @example
   * onUpdate() {
   *   this.transform.translate(Vector2.up, 50 * this.time.delta);
   * }
   */
  translate(direction: Vector3 | Vector2, speed = 1) {
    const vec = new Three.Vector3();
    var x = 0, y = 0, z = 0;
    if (direction instanceof Vector3) {
      var { x, y, z } = direction;
    } else {
      var { x, y } = direction;
    }
    vec.set(x, y, z);

    const speedM = vec.multiplyScalar(speed);
    const v = vec.addVectors(this.object3d.position, speedM);
    this.object3d.position.set(v.x, v.y, v.z);
  }
  /**
   * Moves the object closer towards a point every this is called.
   * @param point The end point the object should move towards.
   * @param speed The speed at which the object should move.
   * @example
   * onUpdate() {
   *   this.transform.moveTowards(new Vector2(10, 10), this.time.delta * 30);
   * }
   */
  moveTowards(point: Vector3, speed = 1) {
    const distance = this.position.distance(point);
    if (distance > 0.1) {
      const dir = new Three.Vector3();
      const end = new Three.Vector3(point.x, point.y, point.z);
      dir.subVectors(end, this.object3d.position).normalize();
      this.translate(new Vector3(dir.x, dir.y, dir.z), speed);
    } else {
      this.object3d.position.set(...point.toArray());
    }
  }
  /**
   * Moves the object to where it was first created.
   */
  jumpToStart() {
    const start = new Vector3(this.gameObject.reference.startPosition);
    this.gameObject.reference.position = start;
  }
  /**
   * Moves the object to the specified position.
   * @param position The position to move to.
   */
  jumpToPosition(position: Vector3) {
    this.gameObject.reference.position = position;
  }
}