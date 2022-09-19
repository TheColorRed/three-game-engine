import { Type } from '../di';
import { GAME_OBJECT_CHILD, GAME_OBJECT_CHILDREN } from '../tokens';

export interface ObjectChildOptions<T> {
  /** The game objects type. */
  type?: Type<T>;
  /** The game objects name. */
  name?: string;
  /** The game objects tag. */
  tag?: string;
}

export interface ObjectChildrenOptions<T> extends ObjectChildOptions<T> {
  /** Whether or not to do a recursive search. */
  deep?: boolean;
}
/**
 * Gets the first child that matches the search criteria.
 * @param find The first found child within the game object.
 * @returns
 */
export function ObjectChild<T>(find: ObjectChildOptions<T>) {
  if (!find.name || !find.type || !find.tag) throw new Error('One type must be selected');
  return function (target: any, prop: string) {
    Reflect.defineMetadata(GAME_OBJECT_CHILD, find, target, prop);
  };
}

/**
 * Finds all objects that match the search criteria.
 * If no criteria is defined, all children are returned.
 * @param find Criteria to use to find child game objects.
 * @returns
 */
export function ObjectChildren<T>(find?: ObjectChildrenOptions<T>) {
  return function (target: any, prop: string) {
    Reflect.defineMetadata(GAME_OBJECT_CHILDREN, find, target, prop);
  };
}