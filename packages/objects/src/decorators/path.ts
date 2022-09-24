import { PATH, Vector3 } from '@engine/core';

export interface PathOptions {
  points: Vector3[];
}

export const Path = (options: PathOptions) => {
  return <T extends { new(...args: any[]): any; }>(target: T) => {
    Reflect.defineMetadata(PATH, options, target);
    // return class GamePath extends target {

    // };
  };
};