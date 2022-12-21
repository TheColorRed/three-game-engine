import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  LoadingManager,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { File } from '../../../classes/file';

@Component({
  selector: 'ui-three-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** The file for the viewer. */
  @Input() file!: File;
  /** The container around the canvas. */
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  /** The canvas within the viewer. */
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  /** The threejs renderer for the viewer. */
  renderer!: WebGLRenderer;
  /** The viewer controls. */
  controls!: OrbitControls;
  /** The viewer camera. */
  camera!: PerspectiveCamera;
  /** The object for the viewer to render. */
  object?: Group | Scene;
  /** The ground for the viewer. */
  groundPlane?: GridHelper;
  /** A Threejs scene. */
  scene = new Scene();
  /** A Threejs directional light. */
  light = new DirectionalLight(0xffffff, 1);
  /** A Threejs ambient light. */
  light2 = new AmbientLight(0xffffff, 2);

  constructor(private readonly zone: NgZone) {}

  ngOnDestroy() {
    // worker.terminate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('file' in changes && this.object) {
      this.zone.runOutsideAngular(() => {
        this.object?.parent?.remove(this.object);
        this.groundPlane?.parent?.remove(this.groundPlane);
        this.loadModel();
      });
    }
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const width = this.container.nativeElement.clientWidth;
      const height = this.container.nativeElement.clientHeight;

      this.scene.background = new Color(0xffffff);
      this.scene.add(this.light);
      this.scene.add(this.light2);

      this.renderer = new WebGLRenderer({ alpha: true, antialias: true, canvas: this.canvas.nativeElement });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.physicallyCorrectLights = true;
      this.renderer.setSize(width, height);

      this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 0);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      this.controls.mouseButtons = { LEFT: 2, MIDDLE: 1, RIGHT: 0 };
      this.camera.lookAt(this.scene.position);
      this.light.castShadow = true;

      this.loadModel();
    });
    new ResizeObserver(this.divResize.bind(this)).observe(this.container.nativeElement);
  }

  private divResize() {
    if (this.renderer) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }
  /**
   * Update the controls and the renderer.
   */
  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  /**
   * Loads the modal to be shown in the viewer.
   */
  private loadModel() {
    const loader = this.getLoader();
    if (typeof loader === 'undefined') return;
    const loadManager = new LoadingManager();
    loader.manager = loadManager;
    loader.loadAsync(this.file.path).then(obj => {
      if (typeof obj === 'undefined') return;
      if ('scene' in obj) {
        this.object = obj.scene;
      } else {
        this.object = obj;
      }
      loadManager.onLoad = () => {
        console.log('done!');
        this.scene.add(this.object!);
        this.loadGround();
        this.fitCameraToObject(3);
        this.animate();
      };
    });
  }
  /**
   * Gets the loader to be used for loading the object.
   */
  private getLoader() {
    if (this.file.extension === '.obj') return new OBJLoader();
    else if (this.file.extension === '.fbx') return new FBXLoader();
    else if (this.file.extension === '.dae') return new ColladaLoader();
    else if (this.file.extension === '.glb' || this.file.extension === '.gltf') return new GLTFLoader();
    return undefined;
  }
  /**
   * Loads the ground to be shown below the object.
   */
  private loadGround() {
    const boundingBox = new Box3();
    const size = new Vector3(100, 100, 100);
    this.groundPlane?.parent?.remove(this.groundPlane);
    if (this.object) {
      boundingBox.setFromObject(this.object);
      boundingBox.getSize(size);
    }

    const max = Math.ceil(Math.max(size.x, size.z) / 10) * 10 * 6;
    this.groundPlane = new GridHelper(max, 50, new Color('rgb(0, 0, 100)'), new Color('rgb(233, 233, 233)'));
    this.scene.add(this.groundPlane);
  }
  /**
   * Fits the object within the camera so it is completely within view.
   * @param offset The offset for the camera's initial distance from the object.
   */
  fitCameraToObject(offset?: number) {
    if (!this.object) return;
    const camera = this.camera;
    const object = this.object;
    const controls = this.controls;
    offset = offset ?? 1.25;

    const boundingBox = new Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    const center = new Vector3();
    const size = new Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;
    this.camera.position.y = center.y + size.y / 1.5;
    this.camera.position.x = -(center.x + size.x);

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

    // camera.far = cameraToFarEdge * 3;
    // camera.updateProjectionMatrix();

    // set camera to rotate around center of loaded object
    controls.target = center;
    // prevent camera from zooming out far enough to create far plane cutoff
    controls.maxDistance = cameraToFarEdge * 2;
    controls.saveState();
  }
}

// if (typeof Worker !== 'undefined') {
//   // Create a new
// const worker = new Worker(new URL('./viewer.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }
