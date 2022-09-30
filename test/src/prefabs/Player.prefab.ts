import { GameObjectRef, OnStart, OnUpdate, Prefab, SceneManager, Sprite, Time, Vector2, Vector3 } from '@engine/core';
import { ButtonUp, Key, KeyPress, MouseButton } from '@engine/input';
import { Transform } from '@engine/objects';
import { Rigidbody2D, RigidbodyRef } from '@engine/physics';
import { HalfBounce } from '../physics-materials/bouncy.material';
import Paddle from '../sprites/paddleBlue.png';
// import Paddle from '../sprites/ballBlue.png';
import { Bullet } from './bullet.prefab';

@Prefab({
  name: 'Player',
  object: new Sprite(Paddle),
  position: new Vector3(0, 10, 0),
  rotation: 0.90
})
@Rigidbody2D({
  shape: { type: 'box', size: { width: 1, height: 1 } },
  material: HalfBounce,
  gravity: new Vector3(0, 0, 0),
  // sleepThreshold: 0
})
export class Player implements OnUpdate, OnStart {

  // @ObjectChildren({ type: Bullet })
  // private bullets!: ObjectList<Bullet>;

  shots = 3;
  hSpeed = 50;
  vSpeed = 25;

  constructor(
    private readonly scene: SceneManager,
    // private readonly mouse: Mouse,
    // private readonly keyboard: Keyboard,
    private readonly time: Time,
    private readonly gameObject: GameObjectRef,
    private readonly transform: Transform,
    private readonly rigidbody: RigidbodyRef<'cube'>,
  ) { }

  @ButtonUp(MouseButton.Left)
  leftMouseButton() {
    this.rigidbody.setVelocity(new Vector3(0, 10, 0));
    // this.rigidbody.setAngularVelocity(new Vector3(0, 100, 0));
  }

  @KeyPress(Key.Space, Key.B)
  // @Debounce(0.5)
  // @AutoBurst(2, 2, 0.05)
  // @Debounce(0.05)
  // @RoundRobin(1, 2, 3)
  // @Repeat(1)
  createBullet() {
    let bullet1!: Bullet, bullet2!: Bullet, bullet3!: Bullet;
    bullet1 = this.scene.instantiate(Bullet, this.gameObject.position);
    this.shots > 1 && (bullet2 = this.scene.instantiate(Bullet, this.gameObject.position));
    this.shots > 2 && (bullet3 = this.scene.instantiate(Bullet, this.gameObject.position));

    bullet1.endPoint = new Vector2(0, 20);
    if (this.shots === 2) {
      bullet1.endPoint = new Vector2(-10, 20);
      bullet2.endPoint = new Vector2(10, 20);
    } else if (this.shots === 3) {
      bullet2.endPoint = new Vector2(-10, 20);
      bullet3.endPoint = new Vector2(10, 20);
    }
  }

  onStart() {
    // this.gameObject.destroy(1);
    // Debug.drawBox(
    //   this.transform.position.x,
    //   this.transform.position.y,
    //   this.rigidbody.options.shape.size.width,
    //   this.rigidbody.options.shape.size.height
    // );
  }

  @KeyPress(Key.Left, Key.A)
  onLeft() { this.transform.translate(Vector2.left, this.time.delta * this.hSpeed); }

  onUpdate() {
    // if (this.keyboard.isKeyPressed(Key.Left) || this.keyboard.isKeyPressed(Key.A)) {
    //   this.transform.translate(Vector2.left, this.time.delta * this.hSpeed);
    // }
    // if (this.keyboard.isKeyPressed(Key.Right) || this.keyboard.isKeyPressed(Key.D)) {
    //   this.transform.translate(Vector2.right, this.time.delta * this.hSpeed);
    // }
    // if (this.keyboard.isKeyPressed(Key.Up) || this.keyboard.isKeyPressed(Key.W)) {
    //   this.transform.translate(Vector2.up, this.time.delta * this.hSpeed);
    // }
    // if (this.keyboard.isKeyPressed(Key.Down) || this.keyboard.isKeyPressed(Key.S)) {
    //   this.transform.translate(Vector2.down, this.time.delta * this.hSpeed);
    // }
  }
}
