import { Component, ContentChild } from '@angular/core';
import { CardActionComponent } from './card-action/card-action.component';
import { CardTitleComponent } from './card-title/card-title.component';

@Component({
  selector: 'ui-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @ContentChild(CardTitleComponent) title?: CardTitleComponent;
  @ContentChild(CardActionComponent) action?: CardActionComponent;
}
