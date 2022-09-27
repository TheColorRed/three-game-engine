import { map, tap } from 'rxjs';
import { SpriteResource } from '../resource';
import { Three } from '../three';

export class Sprite {

  object!: Three.Sprite;
  resource!: SpriteResource;

  get width() { return this.resource.width; }
  get height() { return this.resource.height; }

  constructor(sprite: string) {
    new SpriteResource(sprite).loadResource()
      .pipe(
        tap(i => this.resource = i),
        map(i => this.object = new Three.Sprite(i.material)),
        tap(i => i.scale.set(this.width, this.height, 0))
      )
      .subscribe();
  }

  destroy() {
    console.log('destroy');
  }
}