import { Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export interface ModelLoader {
  loadFile(): void;
}

export class Spacial {

  object!: Object3D;

  constructor(model: string) {
    let loader;
    if (model.endsWith('.fbx')) {
      loader = new FBXModelLoader(model);
    }

    loader?.loadFile();
    // const resource = new SpriteResource(sprite);
    // this.sprite = new ThreeSprite(resource.material);
  }
}

export class FBXModelLoader implements ModelLoader {
  constructor(
    private readonly path: string
  ) { }

  loadFile() {
    const loader = new FBXLoader();
    loader.loadAsync(this.path).then(value => {
      console.log(value);
    });
  }
}