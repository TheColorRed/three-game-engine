import { Component, Host, HostBinding, Input } from '@angular/core';
import { TreeComponent } from '../tree.component';

@Component({
  selector: '[ui-tree-item]',
  templateUrl: './tree-item.component.html',
  styleUrls: ['./tree-item.component.scss'],
})
export class TreeItemComponent {
  @Input() depth = 0;
  @Input() active = false;

  @HostBinding('style.padding-left')
  get leftPadding() {
    return this.depth * this.tree.indent + 'px';
  }

  @HostBinding('class.tree-item-active')
  get treeItemActive() {
    return this.active;
  }

  @HostBinding('style.font-size')
  get fontSize() {
    switch (this.tree.size) {
      case 'md':
        return '1rem';
      case 'sm':
        return '0.8rem';
      case 'lg':
        return '1.2rem';
    }
  }

  constructor(@Host() private readonly tree: TreeComponent) {}
}
