import { GameObjectRef } from '@engine/common';
import { GameObject } from '@engine/objects';
import { Injectable } from './di';

@Injectable()
export class Transform {

  constructor(
    private readonly gameObject: GameObjectRef
  ) { }

  setParent(item: GameObject) {
    // this.gameObject.reference.object3d.add(item.object3d);
  }
  /**
   * Adds an item as a child of the current game object.
   * @param item The item to add as a child.
   */
  addChild(item: GameObject) {
    this.gameObject.reference.object3d.add(item.object3d);
  }

  translate() {

  }
}