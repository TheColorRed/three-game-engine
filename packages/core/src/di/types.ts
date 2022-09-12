export interface Type<T> {
  new(...args: any[]): T;
  [key: string]: any;
}