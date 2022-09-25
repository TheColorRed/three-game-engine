import { Resource } from '@engine/core';
import { Observable } from 'rxjs';
import { SpriteMaterial, Texture, TextureLoader } from 'three';

export class SpriteResource extends Resource<string> {

  material!: SpriteMaterial;
  texture!: Texture;
  width!: number;
  height!: number;

  constructor(spritePath: string) {
    super(spritePath);
    Resource.resources.set(this.resource, this);
  }

  loadResource() {
    return new Observable<SpriteResource>(sub => {
      const spriteResource = Resource.resources.get(this.resource) as SpriteResource | undefined;
      if (typeof spriteResource?.texture !== 'undefined') {
        sub.next(spriteResource);
        sub.complete();
        return;
      } else {
        this.texture = new TextureLoader().load(this.resource, t => {
          this.width = (1 / t.image.height) * t.image.width;
          this.height = 1;
          this.material = new SpriteMaterial({
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
}