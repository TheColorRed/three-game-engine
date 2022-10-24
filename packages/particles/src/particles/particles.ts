import { CameraManager, Curve, GameObject, Injector, LinearSpline, Newable, OnUpdate, Range, Three, Time, Vector3 } from '@engine/core';
import { ParticleSystemOptions } from '../decorators/particles';
import fragmentShader from '../glsl/fragment-shader.glsl';
import vertexShader from '../glsl/vertex-shader.glsl';
import { getLifetimeSize, setLifetimeSize } from './helpers/lifetime-size';
import { getLifetimeSpeed, setLifetimeSpeed } from './helpers/lifetime-speed';

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
    speed: [Curve, Curve, Curve] | Curve;
    size: Curve;
    // rotation: [Curve, Curve, Curve] | Curve;
    // color: Curve;
    // alpha: Curve;
  };
}

export class Particles extends GameObject implements OnUpdate {

  material: Three.ShaderMaterial;
  geometry: Three.BufferGeometry;
  particles: Particle[] = [];
  camera = Injector.get(CameraManager)!;
  time = Injector.get(Time)!;
  timeElapsed = 0;
  runTime = 0;
  startTime = Date.now();

  #setLifetimeSpeed = setLifetimeSpeed;
  #getLifetimeSpeed = getLifetimeSpeed;
  #setLifetimeSize = setLifetimeSize;
  #getLifetimeSize = getLifetimeSize;

  alphaSpline = new LinearSpline<number>((t, a, b) => a + t * (b - a))
    .addPoint(0.0, 0.0)
    .addPoint(0.1, 1.0)
    .addPoint(0.6, 1.0)
    .addPoint(1.0, 0.0);
  colorSpline = new LinearSpline<Three.Color>((t, a, b) => a.clone().lerp(b, t))
    .addPoint(0, new Three.Color(0xFFFF80))
    .addPoint(1, new Three.Color(0xFF8080));
  sizeSpline = new LinearSpline<number>((t, a, b) => a + t * (b - a))
    .addPoint(0.0, 1.0)
    .addPoint(0.5, 5.0)
    .addPoint(1.0, 1.0);

  constructor(target: Newable<object>, protected readonly options: ParticleSystemOptions) {
    super(target, options);
    this.material = new Three.ShaderMaterial({
      uniforms: {
        diffuseTexture: {
          value: new Three.TextureLoader().load(this.options.texture)
        },
        pointMultiplier: {
          value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
        }
      },
      vertexShader,
      fragmentShader,
      blending: Three.NormalBlending,
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

    // this.object3d = CubicBezierCurve.quarterPipe(0, 0, 5, 5).drawLine();
    // this.object3d = options.sizeOverLifetime?.drawLine();
    this.object3d = new Three.Points(this.geometry, this.material);
  }

  onUpdate(): void {
    this.addParticles();
    this.updateParticles();
    this.updateGeometry();
  }

  addParticles() {
    this.runTime = (Date.now() - this.startTime) / 1000;
    if (this.runTime >= (this.options.duration ?? Infinity)) {
      return;
    }
    this.timeElapsed += this.time.deltaTime;
    const count = Math.floor(this.timeElapsed * 75);
    this.timeElapsed -= count / 75;

    for (let i = 0; i < count; i++) {
      const lifetime = this.options.lifetime;
      const life = lifetime instanceof Range ? lifetime.random() : lifetime ?? 1;
      // const life = (Math.random() * 0.75 + 0.25) * 10.0;
      this.particles.push({
        currentPosition: new Three.Vector3(
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0
        ),
        currentRotation: Math.random() * 2.0 * Math.PI,
        // velocity: this.#getStartSpeed(),
        // size: this.#getStartSize(),
        currentColor: new Three.Color(),
        currentAlpha: 0,
        currentLife: life,
        maxLife: life,
        currentSize: 0,
        currentSpeed: Vector3.zero,
        lifetime: {
          speed: this.#setLifetimeSpeed(),
          size: this.#setLifetimeSize()
        }
      });
    }
  }

  updateGeometry() {
    const positions = this.particles.map(p => [p.currentPosition.x, p.currentPosition.y, p.currentPosition.z]).flat();
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

  updateParticles() {
    for (let p of this.particles) {
      p.currentLife -= this.time.deltaTime;
    }

    this.particles = this.particles.filter(p => p.currentLife > 0.0);
    for (let p of this.particles) {
      const t = 1 - p.currentLife / p.maxLife;

      p.currentSize = this.#getLifetimeSize(p, t);
      p.currentSpeed = this.#getLifetimeSpeed(p, t);

      p.currentRotation += this.time.deltaTime * 0.5;
      p.currentAlpha = this.alphaSpline.get(t);
      p.currentColor.copy(this.colorSpline.get(t));

      p.currentPosition.add(p.currentSpeed.three().clone().multiplyScalar(this.time.deltaTime));

      const drag = p.currentSpeed.three().clone();
      drag.multiplyScalar(this.time.deltaTime);
      drag.x = Math.sign(p.currentSpeed.x) * Math.min(Math.abs(drag.x), Math.abs(p.currentSpeed.x));
      drag.y = Math.sign(p.currentSpeed.y) * Math.min(Math.abs(drag.y), Math.abs(p.currentSpeed.y));
      drag.z = Math.sign(p.currentSpeed.z) * Math.min(Math.abs(drag.z), Math.abs(p.currentSpeed.z));
      p.currentSpeed.three().sub(drag);
    }
    // const camera = this.camera.activeCamera?.camera;
    // if (!camera) return;
    // this.particles.sort((a, b) => {
    //   const d1 = camera.position.distanceTo(a.position);
    //   const d2 = camera.position.distanceTo(b.position);

    //   if (d1 > d2) return -1;
    //   if (d1 < d2) return 1;
    //   return 0;
    // });
  }

  isCurveArray(items: any): items is [Curve?, Curve?, Curve?] {
    return Array.isArray(items) && items.every((i: any) => i instanceof Curve || typeof i === 'undefined');
  }

  isVectorArray(items: any): items is [Vector3, Vector3] {
    return Array.isArray(items) && items.every((i: any) => i instanceof Vector3 || typeof i === 'undefined');
  }

  isNumberArray(items: any): items is [number, number, number, number, number, number] | [number, number] {
    return Array.isArray(items) && items.every((i: any) => typeof i === 'number');
  }
}