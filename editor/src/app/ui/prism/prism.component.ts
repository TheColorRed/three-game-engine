import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as Prism from 'prismjs';
import { Observable, of } from 'rxjs';
import { MimeService } from '../../services/mime.service';

@Component({
  selector: 'ui-prism',
  templateUrl: './prism.component.html',
  styleUrls: ['./prism.component.scss'],
})
export class PrismComponent implements AfterViewInit, OnChanges {
  protected lang = 'language-text';
  protected outCode: Observable<string> = new Observable();

  @Input() lineNumbers = true;
  @Input() set language(value: string) {
    this.lang = `language-${value.replace(/\./, '')}`;
  }
  @Input() set code(val: string | Observable<string>) {
    this.outCode = typeof val === 'string' ? of(val) : val;
  }

  @ViewChild('codeBlock')
  codeBlock!: ElementRef<HTMLPreElement>;

  constructor(
    private readonly mimeService: MimeService,
    private readonly cd: ChangeDetectorRef,
    private readonly zone: NgZone
  ) {}

  ngAfterViewInit() {
    this.highlight();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.highlight();
  }

  private highlight() {
    if (this.codeBlock) {
      Prism.highlightElement(this.codeBlock.nativeElement);
    }
  }
}
