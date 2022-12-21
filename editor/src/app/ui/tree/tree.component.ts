import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {
  @Input() indent = 20;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
