import { Observable } from 'rxjs';


export abstract class Source<T, U = any> {

  loaded = false;

  constructor(
    protected readonly resource: T
  ) { }

  abstract loadResource(): Observable<U>;
  abstract destroyResource(): void;

  static sources = new Map<string, Source<any>>();

}