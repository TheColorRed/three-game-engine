import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, filter, map, of } from 'rxjs';
import { ProjectObj } from '../pages/welcome/projects/projects.component';
import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';

export interface Project {
  name: string;
  path: string;
}

export type ProjectStore = [path: string, name: string][];

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private projectsSubject = new BehaviorSubject(new Map<string, string>());
  projects$ = this.projectsSubject.pipe(
    map(i => Array.from(i)),
    map(i => i.reduce<ProjectObj[]>((acc, val) => acc.concat({ path: val[0], name: val[1] }), []))
  );

  get saveLocation$() {
    return of(this.settings.get('default-save-location', '')).pipe(
      map(i => (typeof i === 'string' ? i : '')),
      concatMap(i => {
        if (i.length === 0) return this.electron.home$;
        return of(i);
      })
    );
  }

  private currentProject = new BehaviorSubject<string | undefined>(this.settings.get('current-project'));
  currentProject$ = this.currentProject.pipe(filter((i): i is string => typeof i !== 'undefined'));

  constructor(private readonly settings: SettingsService, private readonly electron: ElectronService) {
    this.load();
  }
  /**
   * Adds a project to the list of projects.
   * @param name The name of the project.
   * @param path The path to the project.
   */
  add(name: string, path: string) {
    if (!this.exists(path)) {
      this.projectsSubject.value.set(path, decodeURIComponent(name));
      this.#saveProjects();
    }
  }
  /**
   * Removes a project. **Note:** the project is not deleted from disk.
   * @param path The path to the project to remove.
   */
  remove(path: string) {
    if (this.exists(path)) {
      this.projectsSubject.value.delete(path);
      this.#saveProjects();
    }
  }
  /**
   * Opens a project at the given path if it has been setup.
   */
  open(path: string) {
    if (this.exists(path)) {
      this.settings.set('current-project', path);
      this.currentProject.next(path);
      return true;
    }
    return false;
  }
  /**
   * Closes the project that is currently open.
   */
  close() {
    this.settings.delete('current-project');
    this.currentProject.next('');
  }
  /**
   * Saves all the projects in memory to disk.
   */
  #saveProjects() {
    this.settings.set('projects', Array.from(this.projectsSubject.value));
    this.projectsSubject.next(this.projectsSubject.value);
  }
  /**
   * Loads all the projects from disk to memory.
   */
  load() {
    const setting = this.settings.get('projects', []);
    const projects = new Map(setting);
    this.projectsSubject.next(projects);
  }
  /**
   * Checks if a project exists or not.
   * @param path The path to the project.
   */
  exists(path: string) {
    return this.projectsSubject.value.has(path);
  }
}
