import { forkJoin, Observable } from 'rxjs';
import { Injector } from '../di/injector';
import { GameModuleService } from '../services/game-module.service';
import { GAME_MODULE } from '../tokens/game-object-tokens';
import { Newable } from '../types';

export interface ModuleOptions {
  /**
   * The set of game objects that will be created upon startup.
   */
  bootstrap?: Newable<any>[];
  /**
   * Initializes the startup of the module such initializing services.
   */
  startup?: () => void | Observable<unknown> | Promise<unknown>;
  /**
   * Triggered on game object destruction.
   */
  destroy?: () => void;
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