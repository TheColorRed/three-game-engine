import { Observable } from 'rxjs';
import { Three } from '../three';
import { Source } from './source';

export class SpriteResource extends Source<string> {

  material!: Three.SpriteMaterial;
  texture!: Three.Texture;
  width!: number;
  height!: number;

  constructor(spritePath: string) {
    super(spritePath);
    Source.sources.set(this.resource, this);
  }

  loadResource() {
    return new Observable<SpriteResource>(sub => {
      const spriteResource = Source.sources.get(this.resource) as SpriteResource | undefined;
      if (typeof spriteResource?.texture !== 'undefined') {
        sub.next(spriteResource);
        sub.complete();
        return;
      } else {
        this.texture = new Three.TextureLoader().load(this.resource, t => {
          this.width = (1 / t.image.height) * t.image.width;
          this.height = 1;
          this.material = new Three.SpriteMaterial({
            map: this.texture,
            precision: 'highp'
          });
          this.loaded = true;
          sub.next(this);
          sub.complete();
        });
      }
    });
  }

  destroyResource() {
    this.texture.dispose();
    this.material.dispose();
  }
}