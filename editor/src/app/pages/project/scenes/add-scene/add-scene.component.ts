import { Component, DoCheck } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogComponent, DialogResultData } from '@ui/dialog/dialog.component';

export interface AddSceneResult {
  scene: string;
  isMain: boolean;
}

@Component({
  selector: 'app-add-scene',
  templateUrl: './add-scene.component.html',
  styleUrls: ['./add-scene.component.scss'],
})
export class AddSceneComponent implements DialogResultData<AddSceneResult>, DoCheck {
  group = this.formBuilder.group({
    scene: ['', Validators.required],
    isMain: [false],
  });

  get data() {
    return {
      scene: this.group.controls.scene.value ?? '',
      isMain: this.group.controls.isMain.value ?? false,
    };
  }

  constructor(private readonly formBuilder: FormBuilder, private readonly dialogRef: DialogComponent) {}

  ngDoCheck(): void {
    this.dialogRef.valid = this.group.valid;
  }
}
