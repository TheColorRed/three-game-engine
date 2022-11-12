import { CameraManager, Component, GameObjectRef, OnUpdate, Time, Vector3 } from '@engine/core';
import { Key, Keyboard, Mouse } from '@engine/input';
import { Transform } from '@engine/objects';

@Component()
export class MoveComponent implements OnUpdate {

  constructor(
    private readonly transform: Transform,
    private readonly keyboard: Keyboard,
    private readonly mouse: Mouse,
    private readonly camera: CameraManager,
    private readonly time: Time,
    private readonly ref: GameObjectRef
  ) { }

  onStart() {
    console.log('start');
  }

  // @KeyPress(Key.Left, Key.Right, Key.Up, Key.Down)
  onUpdate() {

    const pos = this.camera.canvasToWorldPoint(this.mouse.position);
    this.transform.jumpToPosition(pos);
    // console.log(pos);

    if (this.keyboard.isKeyPressed(Key.Left) || this.keyboard.isKeyPressed(Key.A)) {
      this.transform.translate(Vector3.left, this.time.deltaTime * 10);
    }
    if (this.keyboard.isKeyPressed(Key.Right) || this.keyboard.isKeyPressed(Key.D)) {
      this.transform.translate(Vector3.right, this.time.deltaTime * 10);
    }
    if (this.keyboard.isKeyPressed(Key.Up) || this.keyboard.isKeyPressed(Key.W)) {
      this.transform.translate(Vector3.up, this.time.deltaTime * 10);
    }
    if (this.keyboard.isKeyPressed(Key.Down) || this.keyboard.isKeyPressed(Key.S)) {
      this.transform.translate(Vector3.down, this.time.deltaTime * 10);
    }
    // this.transform.translate(Vector3.zero, this.time.deltaTime * 10);
    // console.log('here');
  }
}