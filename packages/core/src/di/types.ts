export interface Type<T> {
  new(...args: any[]): T;
  [key: string]: any;
}

export type Newable<T> = new (...args: any[]) => T;