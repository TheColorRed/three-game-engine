import { BehaviorSubject, filter, from, switchMap, tap } from 'rxjs';
import { ListenerRef } from '../decorators';
import { Injectable } from '../di';
import { EventToken, LISTENER_GLOBAL } from '../tokens';
import { GameObjectManager } from './game-object-manager.service';

@Injectable({ providedIn: 'game' })
export class GameRef {

  private readonly _trigger = new BehaviorSubject<string>('');

  private get listeners() {
    return Reflect.getMetadata(LISTENER_GLOBAL, window) as ListenerRef[] || [];
  }

  constructor(
    private readonly gameObjectManager: GameObjectManager
  ) {
    this._trigger.pipe(
      switchMap(name => from(this.listeners).pipe(
        filter(i => i.name === name),
        switchMap(listenerRef => from(this.gameObjectManager.gameObjects as any[]).pipe(
          filter(go => typeof go[listenerRef.prop] === 'function'),
          tap(go => go[listenerRef.prop]())
        ))
      )),
    ).subscribe();
  }

  trigger(token: EventToken) {
    this._trigger.next(token.name);
  }
}