import { Injectable, OnDestroy } from '@angular/core';
import * as path from 'path';
import { BehaviorSubject, filter, map, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DataType, FileResource } from '../classes/file-resource';
import { FileSystemService } from './fs.service';
import { SettingsService } from './settings.service';

export interface Manifest {
  name: string;
  developer: string;
  homepage: string;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService implements OnDestroy {
  /** The filename for the manifest file. */
  readonly manifestFile = environment.manifest;
  private manifestResource: FileResource<Manifest>;
  /** The manifest subject. */
  private manifest = new BehaviorSubject<FileResource<Manifest> | undefined>(undefined);
  /** The manifest observable. */
  manifest$ = this.manifest.pipe(
    filter((i): i is FileResource<Manifest> => i instanceof FileResource),
    map(i => i.get())
  );

  /** The current project path. */
  path(useUnixSep = true) {
    const projectPath = this.settings.get('current-project', '')!;
    if (useUnixSep) return this.#toUnixPath(projectPath);
    return projectPath;
  }
  /**
   * Get the resources directory.
   */
  resources(useUnixSep = true) {
    let resources = path.join(this.path(useUnixSep), 'resources');
    if (useUnixSep) return this.#toUnixPath(resources);
    return resources;
  }

  resourcePath(path: string) {
    const resourcePath = this.resources();
    const unixPath = this.#toUnixPath(path);
    return unixPath.replace(resourcePath, '');
  }

  constructor(private readonly settings: SettingsService, private readonly fs: FileSystemService) {
    const current = this.settings.get('current-project') ?? '';
    this.manifestResource = this.fs.createResource<Manifest>(path.join(current, this.manifestFile), DataType.Json);
    this.manifestResource.ready$
      .pipe(
        filter(i => i === true),
        tap(() => this.manifest.next(this.manifestResource)),
        take(1)
      )
      .subscribe();
  }

  updateManifest(data: Manifest) {
    this.manifestResource.set(data);
    this.manifestResource.save();
  }

  ngOnDestroy(): void {
    this.manifestResource.close();
  }

  #toUnixPath(path: string) {
    return path.replace(/\\/g, '/');
  }
}
