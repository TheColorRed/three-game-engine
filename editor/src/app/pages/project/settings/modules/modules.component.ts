import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faAdd, faCheck } from '@fortawesome/pro-light-svg-icons';
import { faChevronDown } from '@fortawesome/sharp-solid-svg-icons';
import { map } from 'rxjs/operators';
import { Module, ModuleCategory, ModuleService } from '../../../../services/modules.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
})
export class ModulesComponent implements OnInit {
  addModuleIcon = faAdd;
  moduleAddedIcon = faCheck;
  expandCollapseIcon = faChevronDown;
  searchString = '';
  hideActive = true;
  activeModulesHeight = '0';

  @ViewChild('activeModules') activeModules!: ElementRef<HTMLDivElement>;

  modules$ = this.module.displayed$.pipe(map(i => i.sort((a, b) => a.category.localeCompare(b.category))));
  active$ = this.module.all$.pipe(
    map(i => i.filter(i => i.added)),
    map(i => [...i.filter(i => i.required), ...i.filter(i => !i.required)])
  );
  categories = this.module.categories;
  selectedCategories: Set<ModuleCategory> = new Set();

  constructor(private readonly module: ModuleService) {}

  ngOnInit() {
    this.module.reset();
  }

  toggleHidden() {
    this.hideActive = !this.hideActive;
    this.activeModulesHeight = !this.hideActive ? this.activeModules.nativeElement.scrollHeight + 'px' : '0';
  }

  search() {
    this.module.search(this.searchString, [...this.selectedCategories]);
  }

  toggleModule(module: Module) {
    this.module.toggle(module);
  }

  filterCategory(category: ModuleCategory, state: boolean) {
    if (state === true) this.selectedCategories.add(category);
    else this.selectedCategories.delete(category);
    this.search();
  }
}
