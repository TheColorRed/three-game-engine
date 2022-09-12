import { Camera, GameObjectRef } from '@engine/common';
import { LiveList, ObjectChildren, OnUpdate, Sprite, Transform, Vector3 } from '@engine/core';
import { ButtonDown, Key, KeyDown, Mouse, MouseButton } from '@engine/input';
import { Prefab, Scene } from '@engine/objects';
import Paddle from '../sprites/paddleBlue.png';
// import Paddle from '../sprites/ballBlue.png';
import { Bullet } from './Bullet.prefab';

@Prefab({
  name: 'Player',
  object: new Sprite(Paddle),
  position: Vector3.zero
})
export class Player implements OnUpdate {

  @ObjectChildren(Bullet)
  private bullets!: LiveList<Bullet>;

  constructor(
    private readonly scene: Scene,
    private readonly mouse: Mouse,
    private readonly camera: Camera,
    private readonly gameObject: GameObjectRef,
    private readonly transform: Transform
  ) { }

  @ButtonDown(MouseButton.Right)
  @ButtonDown(MouseButton.Left)
  @KeyDown(Key.Space)
  // @Debounce(0.5)
  // @Repeat(0.25)
  createBullet() {
    const bullet = this.scene.instantiate(Bullet, this.gameObject.position);

    console.log(this.bullets);
    // this.transform.addChild(bullet);
  }

  start() {
    // console.log(this.gameObject);
  }

  // @Debounce(0.5)
  update() {
    this.gameObject.position = this.camera.mouseToWorldPoint(this.mouse.position);
  }
}
