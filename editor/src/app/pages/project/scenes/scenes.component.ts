import { Component } from '@angular/core';
import { faPlus, faRotateRight } from '@fortawesome/sharp-solid-svg-icons';
import { DialogService } from '@ui/dialog/dialog.service';
import { debounceTime, exhaustMap, Observable, Subject, tap } from 'rxjs';
import { File } from 'src/app/classes/file';
import { SceneEditorService } from 'src/app/services/file-editor/scene.service';
import { ScenesService } from 'src/app/services/scenes.service';
import { AddSceneComponent, AddSceneResult } from './add-scene/add-scene.component';

@Component({
  selector: 'app-scenes',
  templateUrl: './scenes.component.html',
  styleUrls: ['./scenes.component.scss'],
  providers: [DialogService],
})
export class ScenesComponent {
  protected readonly addIcon = faPlus;
  protected readonly refreshIcon = faRotateRight;
  protected currentFile?: File;

  accepted$?: Observable<AddSceneResult>;
  scenes$ = this.scenes.scenes$;
  config$ = this.sceneEditor.config$;

  private readonly configChange = new Subject<[file: File, property: string, value: string]>();
  keyup$ = this.configChange.pipe(
    debounceTime(250),
    exhaustMap(([file, prop, val]) => this.sceneEditor.setSceneConfigProp(file, prop, val))
  );

  constructor(
    private readonly dialog: DialogService,
    private readonly scenes: ScenesService,
    private readonly sceneEditor: SceneEditorService
  ) {}

  protected addScene() {
    const ref = this.dialog.open(AddSceneComponent, {
      width: '50%',
      actions: { confirm: 'Create', reject: 'Cancel' },
    });
    this.accepted$ = ref.accepted$.pipe(tap(console.log));
  }

  protected refresh() {}

  protected update(file: File, property: string, value: string) {
    this.configChange.next([file, property, value]);
  }

  protected showFile(file: File) {
    this.currentFile = file;
    this.sceneEditor.getSceneConfig(file).subscribe();
    // this.sceneEditor.setSceneName(file, 'name', 'cat').pipe(tap(console.log)).subscribe();
  }

  private getClass(name: string) {}
}
