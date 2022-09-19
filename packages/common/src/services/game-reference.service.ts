import { ListenerRef } from '@engine/common';
import { Engine, EventToken, Injectable, LISTENER_GLOBAL } from '@engine/core';
import { BehaviorSubject, filter, from, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'game' })
export class GameRef {

  private readonly _trigger = new BehaviorSubject<string>('');

  private get listeners() {
    return Reflect.getMetadata(LISTENER_GLOBAL, window) as ListenerRef[] || [];
  }

  constructor() {
    this._trigger.pipe(
      switchMap(name => from(this.listeners).pipe(
        filter(i => i.name === name),
        switchMap(listenerRef => from(Engine.gameObjects as any[]).pipe(
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