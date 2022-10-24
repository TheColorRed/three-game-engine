import { map, tap } from 'rxjs';
import { SpriteResource } from '../../source/sprite-source';
import { Three } from '../../three';
import { Resource } from '../resource';

export class Sprite extends Resource<Three.Sprite> {

  resource!: SpriteResource;

  get width() { return this.resource.width; }
  get height() { return this.resource.height; }

  constructor(sprite: string) {
    super();
    new SpriteResource(sprite).loadResource()
      .pipe(
        tap(i => this.resource = i),
        map(i => this.object = new Three.Sprite(i.material)),
        tap(i => i.scale.set(this.width, this.height, 0))
      )
      .subscribe();
  }

  destroy() {
    this.resource.destroyResource();
  }
}