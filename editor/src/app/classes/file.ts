import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as nodePath from 'path';
import { map } from 'rxjs';
import * as ts from 'typescript';
import { AppInjector } from '../app.module';
import { FileSystemService } from '../services/fs.service';
import { MimeService } from '../services/mime.service';
import { ProjectService } from '../services/project.service';

export class File {
  mime = AppInjector.get(MimeService);
  project = AppInjector.get(ProjectService);
  fs = AppInjector.get(FileSystemService);
  sanitize = AppInjector.get(DomSanitizer);
  path: string;
  /**The name of the file. */
  name: string;
  /** The file mime type. */
  type: string;
  extension: string;
  /** Whether or not this is a supported 3d model format. */
  isModel: boolean;
  /** Whether or not this is a supported image format. */
  isImage: boolean;
  /** Whether or not this is a supported video format. */
  isVideo: boolean;
  /** Whether or not this is a supported audio format. */
  isAudio: boolean;
  /**
   * Whether or not this is a text file format.
   * The value is `true` if it is not a supported file type.
   * Example: `.psd` is an image format but isn't supported so will return `true`
   */
  isText: boolean;
  /** The file's resource path. */
  resourcePath: string;
  /** An Angular DOM safe URL. */
  safePath: SafeUrl;
  /** The http path. */
  httpPath: string;

  constructor(path: string) {
    this.path = decodeURIComponent(new URL(path).pathname).replace(/^\/(\w):/, '$1:');
    const parsed = nodePath.parse(this.path);
    this.name = nodePath.parse(this.path).base;
    this.type = this.mime.type(this.path);
    this.extension = parsed.ext;
    this.isModel = this.mime.isModel(this.path);
    this.isImage = this.mime.isImage(this.path);
    this.isVideo = this.mime.isVideo(this.path);
    this.isAudio = this.mime.isAudio(this.path);
    this.isText = !this.isModel && !this.isImage && !this.isAudio && !this.isVideo;
    this.resourcePath = this.project.resourcePath(this.path);
    this.safePath = this.sanitize.bypassSecurityTrustUrl(this.path);
    this.httpPath = this.path.replace(this.project.path(), '');
  }

  content() {
    return this.fs.read(this.path);
  }

  tsContent() {
    return this.content().pipe(
      map(content => ts.createSourceFile(this.path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS))
    );
  }

  save(content: string) {
    return this.fs.write(this.path, content);
  }

  isParentDirectory(directory: string) {
    const parent = nodePath.parse(new URL(directory).pathname).dir;
    const current = nodePath.parse(new URL(this.path).pathname).dir;
    return parent === current;
  }

  #getHttpPath() {
    const filePath = new URL(this.path).pathname;
    return filePath.replace(this.project.path(), '');
  }
}
