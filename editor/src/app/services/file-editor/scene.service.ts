import { Injectable } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { File } from 'src/app/classes/file';
import { TypescriptService } from '../typescript.service';

@Injectable({ providedIn: 'root' })
export class SceneEditorService {
  constructor(private readonly ts: TypescriptService) {}

  getFileName(file: File) {
    return this.ts.getSource(file).pipe(
      switchMap(src =>
        of(src).pipe(
          map(() => this.ts.getClassDecorator('Scene', src)),
          map(dec => dec && this.ts.getDecoratorParam(dec, 0, src)),
          map(obj => obj && this.ts.getObjectProp(obj, 'name', src)),
          map(prop => prop && this.ts.setObjectPropValue(prop, "'Awesome'", src))
        )
      )
    );
  }

  base(sceneName: string) {}
}
