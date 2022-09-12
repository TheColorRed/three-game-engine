import { map, tap } from 'rxjs';
import { Sprite as ThreeSprite } from 'three';
import { SpriteResource } from '../resource';

export class Sprite {

  object!: ThreeSprite;
  resource!: SpriteResource;

  get width() { return this.resource.width; }
  get height() { return this.resource.height; }

  constructor(sprite: string) {
    new SpriteResource(sprite).loadResource()
      .pipe(
        tap(i => this.resource = i),
        map(i => this.object = new ThreeSprite(i.material)),
        tap(i => i.scale.set(this.width, this.height, 0))
      )
      .subscribe();
  }
}