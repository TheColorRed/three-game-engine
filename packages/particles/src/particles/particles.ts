import { CameraManager, Curve, GameObjectBase, Gradient, Injector, Mathf, Newable, OnDestroy, OnUpdate, Random, Range, Space, Three, Time, Vector3 } from '@engine/core';
import basicParticle from '../assets/basic-particle.png';
import { ParticleSystemOptions } from '../decorators/particles';
import fragmentShader from '../glsl/particle.frag.glsl';
import vertexShader from '../glsl/particle.vert.glsl';
import { getLifetimeColor, setLifetimeColor } from './helpers/color-lifetime';
import { getLifetimeSize, setLifetimeSize } from './helpers/size-lifetime';
import { getLifetimeSpeed, setLifetimeSpeed } from './helpers/speed-lifetime';

export interface Particle {
  // velocity: Vector3;
  // size: number;
  maxLife: number;
  currentLife: number;
  currentPosition: Three.Vector3;

  currentSpeed: Vector3;
  currentSize: number;
  currentColor: Three.Color;
  currentAlpha: number;
  currentRotation: number;

  lifetime?: {
    speed: [x: Curve, y: Curve, z: Curve] | Curve;
    size: Curve;
    // rotation: [x: Curve, y: Curve, z: Curve] | Curve;
    color: Gradient;
    // alpha: Curve;
  };
}

export enum MaterialBlend { None, Normal, Add, Multiply, Subtract }
export class Particles extends GameObjectBase implements OnUpdate, OnDestroy {

  material: Three.ShaderMaterial;
  geometry: Three.BufferGeometry;
  points: Three.Points;
  particles: Particle[] = [];
  camera = Injector.get(CameraManager)!;
  time = Injector.get(Time)!;
  timeElapsed = 0;
  runTime = 0;
  startTime = Date.now();

  /** The number of seconds in one full loop of the particle system. */
  duration: number;
  /** THe number of particles that should be emitted in on loop of the particle system. */
  rateOverTime: number;
  maxParticles: number;
  space: Space;
  lastAdd = 0;

  currentLoopDuration = 0;
  emit = false;

  #setLifetimeSpeed = setLifetimeSpeed;
  #getLifetimeSpeed = getLifetimeSpeed;
  #setLifetimeSize = setLifetimeSize;
  #getLifetimeSize = getLifetimeSize;
  #getLifetimeColor = getLifetimeColor;
  #setLifetimeColor = setLifetimeColor;

  emissionRate = 0.1;

  constructor(target: Newable<object>, protected override readonly options: ParticleSystemOptions) {
    super(target, options);

    this.duration = options.duration ?? 5;
    this.rateOverTime = options.particle?.emission?.rateOverTime ?? 10;
    this.maxParticles = options.maxParticles ?? 100;
    this.space = options.space ?? Space.World;

    this.material = new Three.ShaderMaterial({
      uniforms: {
        diffuseTexture: {
          value: new Three.TextureLoader().load(this.options.texture ?? basicParticle)
        },
        pointMultiplier: {
          value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
        }
      },
      vertexShader,
      fragmentShader,
      blending: this.getBlend(this.options.blending),
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

    this.geometry = new Three.BufferGeometry();
    this.applyAttribute('position', [], 3, false);
    this.applyAttribute('size', [], 1, false);
    this.applyAttribute('color', [], 4, false);
    this.applyAttribute('angle', [], 1, false);

    this.points = new Three.Points(this.geometry, this.material);
    if (this.space === Space.Local) {
      // this.object3d = this.points;
      this.object3d = new Three.Group();
      this.object3d.add(this.points);
    } else {
      const root = this.sceneManager.rootScene;
      root.attach(this.points);
    }
    // console.log(this.duration / this.rateOverTime);
  }

  override onDestroy() {
    const destroyed = super.onDestroy();
    if (destroyed) {
      this.material.dispose();
      this.geometry.dispose();
      this.points.parent?.remove(this.points);
    }
    return destroyed;
  }

  /**
   * Manages the life of a particle per time frame.
   */
  override onUpdate() {
    super.onUpdate();
    const now = Date.now();

    // If this is a static system and the particles have already been created exit the function.
    if (this.options.static && this.particles.length > 0) return;

    this.currentLoopDuration += this.time.deltaTime;
    if (this.currentLoopDuration >= this.duration) {
      this.currentLoopDuration = 0;
    }

    // Reduce the life of the particle by the amount of time that has passed.
    for (let p of this.particles) {
      p.currentLife -= this.time.deltaTime;
    }
    // Remove any particles that have reached their end of life.
    this.particles = this.particles.filter(p => p.currentLife > 0.0);
    // Update the emission rate if changes have been made to the timing.
    this.emissionRate = this.duration / this.rateOverTime;

    // Add new particles and update the existing ones.
    if ((now - this.lastAdd) / 1000 >= this.emissionRate) {
      this.addParticles();
    }
    this.updateParticles();
    this.updateGeometry();
    // console.log(this.particles.length, this.emissionRate);
  }
  /**
   * Adds particles to the particle system.
   */
  addParticles() {
    if (this.particles.length >= this.maxParticles) {
      return;
    }

    const count = Mathf.clamp(1, 10, this.maxParticles - this.particles.length);
    // const count = 1;
    this.lastAdd = Date.now();

    for (let i = 0; i < count; i++) {
      const lifetime = this.options.particle?.lifetime;
      const life = (lifetime instanceof Range ? lifetime.randomFloat : lifetime) ?? 1;
      this.particles.push({
        currentPosition: this.#createParticlePosition(),
        currentRotation: Math.random() * 2.0 * Math.PI,
        currentColor: new Three.Color(),
        currentAlpha: 0,
        currentLife: !this.options.static ? life : Random.rangeFloat(0.5, 1),
        maxLife: life,
        currentSize: 0,
        currentSpeed: Vector3.zero,
        lifetime: {
          speed: this.#setLifetimeSpeed(),
          size: this.#setLifetimeSize(),
          color: this.#setLifetimeColor()
        }
      });
    }
  }
  /**
   * Updates the particles' properties within the particle array.
   */
  updateParticles() {
    for (let p of this.particles) {
      const t = 1 - p.currentLife / p.maxLife;

      p.currentSize = this.#getLifetimeSize(p, t);
      p.currentSpeed = this.#getLifetimeSpeed(p, t);

      const color = this.#getLifetimeColor(p, t);
      p.currentAlpha = color.alpha;
      p.currentColor = color.threeColor;

      p.currentRotation += this.time.deltaTime * 0.5;
      // if (this.options.space === Space.World) {
      p.currentPosition.add(p.currentSpeed.three().clone().multiplyScalar(this.time.deltaTime));
      // } else {
      //   const pos = this.object3d.position;
      //   p.currentPosition.add(p.currentSpeed.three().clone().multiplyScalar(this.time.deltaTime));
      // }


      // const drag = p.currentSpeed.three().clone();
      // drag.multiplyScalar(this.time.deltaTime);
      // drag.x = Math.sign(p.currentSpeed.x) * Math.min(Math.abs(drag.x), Math.abs(p.currentSpeed.x));
      // drag.y = Math.sign(p.currentSpeed.y) * Math.min(Math.abs(drag.y), Math.abs(p.currentSpeed.y));
      // drag.z = Math.sign(p.currentSpeed.z) * Math.min(Math.abs(drag.z), Math.abs(p.currentSpeed.z));
      // p.currentSpeed.three().sub(drag);
    }
    // const camera = this.camera.activeCameras[0];
    // if (!camera) return;
    // this.particles.sort((a, b) => {
    //   const d1 = camera.camera.position.distanceTo(a.currentPosition);
    //   const d2 = camera.camera.position.distanceTo(b.currentPosition);

    //   if (d1 > d2) return -1;
    //   if (d1 < d2) return 1;
    //   return 0;
    // });
  }
  /**
   * Updates the geometry for based on the settings of the particles' array.
   */
  updateGeometry() {
    const positions = this.particles.map(p => {
      if (this.space === Space.World) {
        return [p.currentPosition.x, p.currentPosition.y, p.currentPosition.z];
      }
      const pos = this.object3d.position;
      return [
        p.currentPosition.x + pos.x,
        p.currentPosition.y + pos.y,
        p.currentPosition.z + pos.z
      ];
    }).flat();
    const sizes = this.particles.map(p => p.currentSize);
    // const colors = this.particles.map(p => [255, 255, 255, 1]).flat();
    const colors = this.particles.map(p => [p.currentColor.r, p.currentColor.g, p.currentColor.b, p.currentAlpha]).flat();
    const angles = this.particles.map(p => p.currentRotation);

    this.applyAttribute('position', positions, 3);
    this.applyAttribute('size', sizes, 1);
    this.applyAttribute('color', colors, 4);
    this.applyAttribute('angle', angles, 1);
  }

  applyAttribute(name: Three.BuiltinShaderAttributeName | (string & {}), data: any[], size: number, update = true) {
    this.geometry.setAttribute(name, new Three.Float32BufferAttribute(data, size));
    if (update === true) {
      this.geometry.getAttribute(name).needsUpdate = update;
    }
  }

  #createParticlePosition() {
    const shape = this.options.shape;
    // The object's current position.
    const x = this.object3d?.position.x ?? 0,
      y = this.object3d?.position.y ?? 0,
      z = this.object3d?.position.z ?? 0;

    if (shape?.type === 'sphere') {
      const randomRadius = Math.random() * shape.radius;
      const randomVec = new Three.Vector3();
      randomVec.randomDirection();
      const position = randomVec.multiplyScalar(randomRadius);
      return new Three.Vector3(x, y, z).add(position);
    } else if (shape?.type === 'box') {
      if (shape.emitFrom === 'volume') {
        return new Three.Vector3(
          ((Math.random() * shape.scale.x - (shape.scale.x / 2)) * 1.0) + x,
          ((Math.random() * shape.scale.y - (shape.scale.y / 2)) * 1.0) + y,
          ((Math.random() * shape.scale.z - (shape.scale.z / 2)) * 1.0) + z
        );
      } else {
        return new Three.Vector3(
          (Math.random() * shape.scale.x) + x,
          (Math.random() * shape.scale.y) + y,
          shape.scale.z + z,
          // (Math.random() * shape.scale.x - (shape.scale.x / 2)) * 1.0,
          // (Math.random() * shape.scale.y - (shape.scale.y / 2)) * 1.0,
          // (Math.random() * shape.scale.z - (shape.scale.z / 2)) * 1.0
        );
      }
    } else if (shape?.type === 'cone') {
      return new Three.Vector3(
        ((Math.random() * shape.radius - (shape.radius / 2)) * 1.0) + x,
        ((Math.random() * this.position.y) * 1.0) + y,
        ((Math.random() * shape.radius - (shape.radius / 2)) * 1.0) + z
      );
    }
    return new Three.Vector3(0, 0, 0);
  }

  getBlend(blend?: MaterialBlend) {
    switch (blend) {
      case MaterialBlend.None: return Three.NoBlending;
      case MaterialBlend.Add: return Three.AdditiveBlending;
      case MaterialBlend.Multiply: return Three.MultiplyBlending;
      case MaterialBlend.Subtract: return Three.SubtractiveBlending;
      case MaterialBlend.Normal:
      default:
        return Three.NormalBlending;
    }
  }

  isCurveArray(items: any): items is Curve[] {
    return Array.isArray(items) && items.every((i: any) => i instanceof Curve || typeof i === 'undefined');
  }

  isVectorArray(items: any): items is [Vector3, Vector3] {
    return Array.isArray(items) && items.every((i: any) => i instanceof Vector3 || typeof i === 'undefined');
  }

  isNumberArray(items: any): items is number[] {
    return Array.isArray(items) && items.every((i: any) => typeof i === 'number');
  }
}