import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, from, map, tap, toArray } from 'rxjs';
import { StringService } from './string.service';

export type ModuleCategory = 'build' | 'fx' | 'media' | 'input' | 'core' | 'networking';

export interface Module {
  name: string;
  description: string;
  required?: boolean;
  added?: boolean;
  moduleName: string;
  category: ModuleCategory;
}

@Injectable({ providedIn: 'root' })
export class ModuleService {
  /** A list of categories. */
  categories: ModuleCategory[] = ['build', 'fx', 'media', 'input', 'core', 'networking'].sort((a, b) =>
    a.localeCompare(b)
  ) as ModuleCategory[];
  /** A list of supported modules. */
  modules: Module[] = [];
  /** The endpoint to get the list of modules. */
  private moduleEndpoint = '/assets/modules/%s.json';
  /** A subject to track a list of filtered modules. */
  private readonly moduleSub = new BehaviorSubject<Module[]>(this.modules);
  /** A subject to track all modules. */
  private readonly allModuleSub = new BehaviorSubject<Module[]>(this.modules);
  /** A list of modules to be displayed on the modules project settings section. */
  displayed$ = this.moduleSub.pipe(map(i => i.sort((a, b) => a.name.localeCompare(b.name))));
  /** A list of all modules to be displayed. */
  all$ = this.allModuleSub.pipe(map(i => i.sort((a, b) => a.name.localeCompare(b.name))));

  constructor(private readonly str: StringService, private readonly http: HttpClient) {
    this.getModuleList();
  }
  /**
   * Gets all modules from the json files.
   */
  private getModuleList() {
    from(this.categories)
      .pipe(
        concatMap(i => this.http.get(this.str.format(this.moduleEndpoint, i))),
        toArray(),
        map(i => i.flat() as Module[]),
        tap(i => (this.modules = i)),
        tap(i => this.moduleSub.next(i)),
        tap(i => this.allModuleSub.next(i))
      )
      .subscribe();
  }
  /**
   * Searches the list of modules.
   */
  search(keyword: string, categories: ModuleCategory[] = []) {
    const found = this.modules
      .filter(m => this.str.fuzzyMatch(keyword, m.name) || this.str.fuzzyMatch(keyword, m.description))
      .filter(m => (categories.length > 0 ? categories.includes(m.category) : true));
    this.moduleSub.next(found);
  }
  /**
   * Resets the modules search list back to it's full list.
   */
  reset() {
    this.moduleSub.next(this.modules);
  }
  /**
   * Toggles the modules active/inactive state.
   * @param module The module to toggle.
   */
  toggle(module: Module) {
    if (module.required !== true) {
      module.added = !module.added;
      this.allModuleSub.next(this.modules);
      this.moduleSub.next(this.moduleSub.value);
    }
  }
}
