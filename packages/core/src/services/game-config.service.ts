import { GameConfiguration, Gizmos } from '../decorators';
import { Injectable, Newable } from '../di';

export interface GameOptions {
  main: Newable<object>;
  production: boolean;
  scenes?: Newable<object>[];
  aspect?: number | `${number}x${number}`;
  stats?: boolean;
  gizmos?: Gizmos;
}

@Injectable({ providedIn: 'game' })
export class GameConfig {
  #options: Partial<GameConfiguration> = {};
  /**
   * Set the initial game options.
   * @internal
   */
  set(options: GameConfiguration) {
    this.#options = options;
  }
  /**
   * The configuration to get from the loaded config.
   * @param option The name of the configuration option.
   */
  get<T extends keyof GameConfiguration>(option: T) {
    return this.#options[option] as GameConfiguration[T];
  }

  get isPhysicsGizmos() {
    const isProduction = this.get('production');
    return isProduction === false && this.#options.gizmos?.colliders;
  }
}