import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { MenuComponent } from '../../ui/menu/menu.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  // providers: [ProjectService],
})
export class ProjectComponent implements AfterViewInit, OnInit {
  @ViewChild(MenuComponent)
  slideOver!: MenuComponent;

  private open = false;

  constructor(private readonly project: ProjectService) {}

  ngOnInit() {
    window.api.assets.setProjectRoot(this.project.path());
  }

  ngAfterViewInit() {
    const slideOverEl = this.slideOver.elementRef.nativeElement;
    const { width } = slideOverEl.getBoundingClientRect();
    slideOverEl.style.left = `-${width}px`;
    this.open = false;
  }

  /**
   * Closes the menu slide over.
   */
  closeMenu() {
    if (this.open === false) return;
    const slideOverEl = this.slideOver.elementRef.nativeElement;
    const { width } = slideOverEl.getBoundingClientRect();
    slideOverEl
      .animate([{ left: `0px` }, { left: `-${width}px` }], {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'both',
      })
      .finished.then(() => (this.open = false));
  }
  /**
   * Opens the menu slide over.
   */
  openMenu() {
    if (this.open === true) return;
    const slideOverEl = this.slideOver.elementRef.nativeElement;
    const { width } = slideOverEl.getBoundingClientRect();
    slideOverEl
      .animate([{ left: `-${width}px` }, { left: `0px` }], {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'both',
      })
      .finished.then(() => (this.open = true));
  }
}
