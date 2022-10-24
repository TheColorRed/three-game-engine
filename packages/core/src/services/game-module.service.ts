import { concatMap, finalize, forkJoin, Observable, of } from 'rxjs';
import { GameScene } from '../classes/game-scene';
import { Debug } from '../debug';
import { GameModule, ModuleOptions } from '../decorators/module';
import { Injectable } from '../di/injectable';
import { Newable } from '../di/types';
import { GAME_MODULE } from '../tokens/game-object-tokens';

@Injectable({ providedIn: 'game' })
export class GameModuleService {
  initModule(gmModule: Newable<GameModule>, scene?: GameScene) {
    return new Observable(sub => {
      const rootM = new gmModule();
      const options = Reflect.getMetadata(GAME_MODULE, rootM.target) as ModuleOptions;
      const childModules: GameModule[] = [];
      // Create a list of child modules to be loaded.
      const modules: Observable<unknown>[] = [];
      if (Array.isArray(options.imports) && options.imports.length > 0) {
        for (let module of options.imports) {
          if (typeof module === 'function') {
            const m = new module() as GameModule | object;
            console.log('m', m);
            if ('moduleInstance' in m) {
              childModules.push(m);
              // modules.push(this.initModule(m));
            }
            else throw new Error(`"${Debug.getName(m)}" is not a module but is being used as such.`);
          }
        }
      }

      // Wait for the child modules to load.
      const root = modules.length > 0 ? forkJoin(modules) : of([]);
      root.pipe(
        // Once the child modules have loaded, bootstrap the current module.
        concatMap(() => {
          let startup: Observable<unknown> | Promise<unknown> = of({});
          if (typeof options.startup === 'function') startup = options.startup() ?? startup;
          if (Array.isArray(options.bootstrap))
            options.bootstrap.forEach(itm => scene?.instantiate(itm));

          return startup instanceof Promise ? of(startup) : startup;
        }),
        // Complete the initialization of the current module.
        finalize(() => sub.complete())
      ).subscribe();
    });
  }
}