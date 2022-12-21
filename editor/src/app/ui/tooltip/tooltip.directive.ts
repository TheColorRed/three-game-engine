import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef } from '@angular/core';
import { debounceTime, Subject, tap } from 'rxjs';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[tooltip]',
  providers: [Overlay],
})
export class TooltipDirective implements OnDestroy {
  /** The message to be displayed within the tooltip. */
  @Input('tooltip') message?: string | TemplateRef<any>;
  @Input('tooltip-width') tooltipWidth = Infinity;
  @Input() delay = 500;
  /** The tooltip overlay reference. */
  overlayRef?: OverlayRef;
  /** Positions for the tooltip.
   * * Places the tooltip above the item.
   * * Fallback to placing the tooltip below the item.
   */
  positions = [
    new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }),
    new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' }),
  ];

  mouse: { x: number; y: number } = { x: 0, y: 0 };

  delaySub = new Subject<MouseEvent>();
  delay$ = this.delaySub
    .pipe(
      tap(i => i.type === 'mouseleave' && this.hideTip()),
      debounceTime(this.delay),
      tap(i => i.type === 'mouseenter' && this.showTip())
    )
    .subscribe();

  @HostListener('mouseenter', ['$event'])
  @HostListener('mouseleave', ['$event'])
  watchMouseEvents(event: MouseEvent) {
    this.delaySub.next(event);
  }

  @HostListener('mousemove', ['$event'])
  mouseMoveEvent(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };
  }

  constructor(private readonly overlay: Overlay, private readonly elementRef: ElementRef) {}
  /**
   * Cleans up the tooltip component.
   */
  ngOnDestroy() {
    this.delay$.unsubscribe();
  }
  /**
   * Shows the tooltip.
   */
  showTip() {
    const position = this.overlay.position().flexibleConnectedTo(this.elementRef).withPositions(this.positions);

    // const position = this.overlay
    //   .position()
    //   .global()
    //   .top(`${this.mouse.y + 10}px`)
    //   .left(`${this.mouse.x + 10}px`);

    this.overlayRef = this.overlay.create({
      positionStrategy: position,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    const tooltipPortal = new ComponentPortal(TooltipComponent);
    const tooltip = this.overlayRef.attach(tooltipPortal);

    if (typeof this.message !== 'undefined' && tooltip.instance) {
      if (typeof this.message === 'string') tooltip.instance.message = this.message;
      else tooltip.instance.template = this.message;
    }

    tooltip.instance.width = this.tooltipWidth;
  }
  /**
   * Closes the tooltip for the related item.
   */
  hideTip() {
    this.overlayRef?.dispose();
  }
}
