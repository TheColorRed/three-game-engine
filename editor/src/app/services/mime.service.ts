import { Injectable } from '@angular/core';
import * as mime from 'mime-types';
import * as path from 'path';

@Injectable({ providedIn: 'root' })
export class MimeService {
  readonly textFiles: ReadonlyArray<string> = ['application/json', 'text/html', 'text/plain'];
  readonly imageFiles: ReadonlyArray<string> = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    'image/svg',
    'image/webp',
  ];
  readonly modelFiles: ReadonlyArray<string> = ['.fbx', '.obj', '.glb', '.gltf', '.dae'];
  readonly audioFiles: ReadonlyArray<string> = ['.mp3', '.mp4', '.wav', '.aac', '.ogg'];
  readonly videoFiles: ReadonlyArray<string> = ['.mp4', '.mov', '.avi', '.webm'];

  constructor() {}

  type(file: string) {
    return (
      (mime.contentType(path.extname(file)) || '')
        .split(';')
        .map(i => i.trim())
        .shift() ?? ''
    );
  }

  info(file: string) {
    return mime.lookup(file);
  }

  charset(file: string) {
    return (
      (mime.contentType(path.extname(file)) || '')
        .split(';')
        .map(i => i.trim())
        .pop() ?? ''
    );
  }

  isText(file: string) {
    const type = this.type(file);
    const ext = path.parse(new URL(file).pathname).ext;
    return this.textFiles.some(() => this.textFiles.includes(type) || this.textFiles.includes(ext));
  }

  isImage(file: string) {
    const type = this.type(file);
    const ext = path.parse(new URL(file).pathname).ext;
    return this.imageFiles.some(() => this.imageFiles.includes(type) || this.imageFiles.includes(ext));
  }

  isModel(file: string) {
    const type = this.type(file);
    const ext = path.parse(new URL(file).pathname).ext;
    return this.modelFiles.some(() => this.modelFiles.includes(type) || this.modelFiles.includes(ext));
  }

  isAudio(file: string) {
    const type = this.type(file);
    const ext = path.parse(new URL(file).pathname).ext;
    return this.audioFiles.some(i => this.audioFiles.includes(type) || this.audioFiles.includes(ext));
  }

  isVideo(file: string) {
    const type = this.type(file);
    const ext = path.parse(new URL(file).pathname).ext;
    return this.videoFiles.some(i => this.videoFiles.includes(type) || this.videoFiles.includes(ext));
  }

  extension(mimeType: string) {
    return mime.extension(mimeType) || '';
  }
}
