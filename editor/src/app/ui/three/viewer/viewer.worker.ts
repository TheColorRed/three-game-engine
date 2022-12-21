// // @ts-nocheck
// /// <reference lib="webworker" />

// import type { Group, Scene } from 'three';
// import { LoadingManager } from 'three';
// import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// function getLoader(ext: string) {
//   if (ext === '.obj') return new OBJLoader();
//   else if (ext === '.fbx') return new FBXLoader();
//   else if (ext === '.dae') return new ColladaLoader();
//   else if (ext === '.glb' || ext === '.gltf') return new GLTFLoader();
//   return undefined;
// }

// addEventListener('message', ({ data }: { data: { extension: string; path: string } }) => {
//   const loader = getLoader(data.extension);

//   if (typeof loader === 'undefined') return;

//   const loadManager = new LoadingManager();
//   loader.manager = loadManager;

//   loader.loadAsync(data.path).then(obj => {
//     if (typeof obj === 'undefined') return;
//     loadManager.onLoad = () => {
//       let object: Group | Scene;
//       if ('scene' in obj) {
//         object = obj.scene;
//       } else {
//         object = obj;
//       }

//       console.log('done!');
//       postMessage(object);
//       // this.scene.add(this.object!);

//       // this.loadGround();
//       // this.fitCameraToObject(3);
//       // this.animate();
//     };
//   });
// });

// // import {
// //   AmbientLight,
// //   Box3,
// //   Color,
// //   DirectionalLight,
// //   GridHelper,
// //   Object3D,
// //   PerspectiveCamera,
// //   Scene,
// //   Vector3,
// //   WebGLRenderer,
// // } from 'three';
// // import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
// // import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// // import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// // addEventListener('message', ({ data }) => {
// //   const width = data.width;
// //   const height = data.height;
// //   const canvas = data.canvas;
// //   let groundPlane: GridHelper;
// //   let object: Object3D;
// //   let camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
// //   // const controls = new OrbitControls(camera, canvas);

// //   let scene = new Scene();
// //   let light = new DirectionalLight(0xffffff, 1);
// //   let light2 = new AmbientLight(0xffffff, 2);

// //   scene.background = new Color(0xffffff);
// //   const renderer = new WebGLRenderer({ alpha: true, antialias: true, canvas: data.canvas });
// //   renderer.setPixelRatio(window.devicePixelRatio);
// //   renderer.physicallyCorrectLights = true;

// //   const file = data.file;

// //   function getLoader() {
// //     // if (file.extension === '.obj') return new OBJLoader();
// //     // else if (file.extension === '.fbx') return new FBXLoader();
// //     // else if (file.extension === '.dae') return new ColladaLoader();
// //     // else if (file.extension === '.glb' || file.extension === '.gltf') return new GLTFLoader();
// //     // return undefined;
// //   }

// //   function loadGround() {
// //     if (object) {
// //       groundPlane?.parent?.remove(groundPlane);
// //       const boundingBox = new Box3();
// //       const size = new Vector3();

// //       boundingBox.setFromObject(object);
// //       boundingBox.getSize(size);

// //       const max = Math.ceil(Math.max(size.x, size.z) / 10) * 10 * 6;
// //       groundPlane = new GridHelper(max, 50, new Color('rgb(0, 0, 100)'), new Color('rgb(233, 233, 233)'));
// //       scene.add(groundPlane);
// //     }
// //   }

// //   function fitCameraToObject(offset?: number) {
// //     offset = offset ?? 1.25;
// //     if (!object) return;
// //     console.log('reposition');

// //     const boundingBox = new Box3();

// //     // get bounding box of object - this will be used to setup controls and camera
// //     boundingBox.setFromObject(object);

// //     const center = new Vector3();
// //     const size = new Vector3();
// //     boundingBox.getCenter(center);
// //     boundingBox.getSize(size);

// //     // get the max side of the bounding box (fits to width OR height as needed )
// //     const maxDim = Math.max(size.x, size.y, size.z);
// //     const fov = camera.fov * (Math.PI / 180);
// //     let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

// //     cameraZ *= offset; // zoom out a little so that objects don't fill the screen

// //     camera.position.z = cameraZ;
// //     camera.position.y = center.y + size.y / 1.5;
// //     camera.position.x = -(center.x + size.x);

// //     const minZ = boundingBox.min.z;
// //     const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

// //     // camera.far = cameraToFarEdge * 3;
// //     // camera.updateProjectionMatrix();

// //     // set camera to rotate around center of loaded object
// //     // controls.target = center;
// //     // prevent camera from zooming out far enough to create far plane cutoff
// //     // controls.maxDistance = cameraToFarEdge * 2;
// //     // controls.saveState();
// //   }
// // });
