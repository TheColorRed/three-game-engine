import { Component, ElementRef, HostBinding, HostListener, Injectable, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type ElementResize = [prev: HTMLElement, next: HTMLElement];

@Injectable({ providedIn: 'root' })
export class DragbarResizeService {
  private elements = new BehaviorSubject<[] | ElementResize>([]);
  elements$ = this.elements.asObservable();

  private dblclick = new Subject<DragbarDirective>();
  dblclick$ = this.dblclick.asObservable();

  setElements(elements: ElementResize) {
    this.elements.next(elements);
  }

  dblClicked(directive: DragbarDirective) {
    this.dblclick.next(directive);
  }
}

@Component({
  selector: '[ui-dragbar]',
  template: '',
  styleUrls: ['./dragbar.component.scss'],
})
export class DragbarDirective implements OnInit {
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  private isHandlerDragging = false;
  private parent: HTMLElement | null = null;
  private prevChild: HTMLElement | null = null;
  private nextChild: HTMLElement | null = null;

  @HostListener('dblclick', ['$event'])
  doubleClick() {
    this.resize.dblClicked(this);
  }

  @HostListener('document:mousedown', ['$event'])
  mouseDown(evt: MouseEvent) {
    if (evt.target === this.host.nativeElement) {
      this.isHandlerDragging = true;
    }
  }

  @HostListener('document:mouseup')
  mouseUp() {
    this.isHandlerDragging = false;
  }

  @HostListener('document:mousemove', ['$event'])
  mouseMove(evt: MouseEvent) {
    if (!this.isHandlerDragging || !this.parent || !this.prevChild || !this.nextChild) return;

    const containerOffset = this.parent.offsetLeft;
    const pointerRelativeXPos = evt.clientX - containerOffset;
    const boxAMinWidth = 60;

    this.prevChild.style.width = Math.max(boxAMinWidth, pointerRelativeXPos - 8) + 'px';
    this.prevChild.style.flexGrow = '0';
    this.resize.setElements([this.prevChild, this.nextChild]);
  }

  @HostBinding('class')
  get klass() {
    return {
      'dragbar-horizontal': this.direction === 'horizontal',
      'dragbar-vertical': this.direction === 'vertical',
    };
  }

  constructor(private readonly host: ElementRef<HTMLElement>, private readonly resize: DragbarResizeService) {}

  ngOnInit() {
    this.parent = this.host.nativeElement.parentElement;
    this.prevChild = this.host.nativeElement.previousElementSibling as HTMLElement;
    this.nextChild = this.host.nativeElement.nextElementSibling as HTMLElement;

    this.prevChild?.classList.add('grow', 'shrink');
    // this.prevChild && (this.prevChild.style.flexBasis = '300px');
    this.nextChild?.classList.add('grow', 'shrink');
  }
}
