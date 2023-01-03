import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, from, map, of, tap } from 'rxjs';
import { File } from 'src/app/classes/file';
import * as ts from 'typescript';
import { ObjectConfig, TypescriptService } from '../typescript/typescript.service';

@Injectable({ providedIn: 'root' })
export class SceneEditorService {
  private scene = new BehaviorSubject<ts.Node | undefined>(undefined);
  private readonly config = new BehaviorSubject<ObjectConfig | undefined>(undefined);

  scene$ = this.scene.pipe(filter(val => typeof val !== 'undefined' && 'kind' in val && ts.isSourceFile(val as any)));
  config$ = this.config.asObservable();

  constructor(private readonly typescriptService: TypescriptService) {}

  getSceneConfig(src: ts.SourceFile | File) {
    const source = src instanceof File ? from(src.tsContent()) : of(src);
    return source.pipe(
      map(src => this.typescriptService.getDecoratorConfigValues('Scene', src)),
      tap(cfg => this.config.next(cfg))
    );
  }

  setSceneConfigProp(file: File, prop: string, value: string) {
    return this.typescriptService.getSource(file).pipe(
      map(src => this.typescriptService.setDecoratorConfigValue('Scene', prop, value, src)),
      tap(src => this.typescriptService.saveSource(file, src))
    );
  }

  base(sceneName: string) {}
}
