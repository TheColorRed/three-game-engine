import { forkJoin, Observable } from 'rxjs';
import { Injector } from '../di/injector';
import { Newable } from '../di/types';
import { GameModuleService } from '../services/game-module.service';
import { GAME_MODULE } from '../tokens';

export interface ModuleOptions {
  /**
   * Initializes the startup of the module such initializing services.
   */
  bootstrap?: Newable<any>[] | (() => void | Observable<unknown> | Promise<unknown>);
  /**
   * Additional modules that this module requires.
   */
  imports?: Newable<GameModule>[];
  /**
   * These are prefabs that are associated with this module.
   */
  prefabs?: Newable<object>[];
  expose?: Newable<object>[];
}

export class GameModule {
  moduleInstance: object;

  childModules: GameModule[] = [];

  constructor(
    readonly target: Newable<object>,
    readonly options: ModuleOptions
  ) {
    this.moduleInstance = new target();
  }

  static isNewableGameModule(item: any): item is Newable<GameModule> {
    return item.name === 'GameModuleDecorator';
  }

  static init(imports: Newable<GameModule>[]) {
    return new Observable(sub => {
      const items: Observable<unknown>[] = [];
      const service = Injector.get(GameModuleService)!;
      for (let imp of imports) {
        items.push(service.initModule(imp));
      }
      forkJoin(items).subscribe({ complete: () => sub.complete() });
    });
  }
}

/**
 * A module is a group of game objects, services, etc that work together.
 * Combining small modules help to make a bigger application.
 * * This could provide additional functionality to the game or object.
 * * This could encapsulate functionality for a specific feature such as a player or enemy.
 * @param options The module options.
 */
export function Module(options: ModuleOptions) {
  return (target: Newable<object>) => {
    Reflect.defineMetadata(GAME_MODULE, options, target);
    return class GameModuleDecorator extends GameModule {
      constructor() {
        super(target, options);
      }
    };
  };
}