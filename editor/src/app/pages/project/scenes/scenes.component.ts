import { Component } from '@angular/core';
import { faPlus, faRotateRight } from '@fortawesome/sharp-solid-svg-icons';
import { DialogService } from '@ui/dialog/dialog.service';
import { Observable, tap } from 'rxjs';
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

  accepted$?: Observable<AddSceneResult>;
  scenes$ = this.scenes.scenes$;

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

  protected showFile(file: File) {
    this.sceneEditor.getFileName(file).pipe(tap(console.log)).subscribe();
  }

  private getClass(name: string) {}
}
