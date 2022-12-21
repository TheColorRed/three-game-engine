import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, switchMap, toArray } from 'rxjs';
import { File } from '../classes/file';

@Injectable({
  providedIn: 'root',
})
export class ScenesService {
  private scenes = new BehaviorSubject<string[]>([]);
  scenes$? = this.scenes.pipe(
    switchMap(i =>
      from(i).pipe(
        map(path => new File(path)),
        toArray()
      )
    )
  );

  constructor() {
    window.api.files.glob(['**/*.scene.ts']).then(scenes => this.scenes.next(scenes));
  }
}
