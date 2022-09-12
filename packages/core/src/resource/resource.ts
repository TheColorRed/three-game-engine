import { Observable } from 'rxjs';


export abstract class Resource<T, U = any> {

  loaded = false;

  constructor(
    protected readonly resource: T
  ) { }

  abstract loadResource(): Observable<U>;

  static resources = new Map<string, Resource<any>>();

}