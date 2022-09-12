import { EventToken, TOKEN_LISTENER_GLOBAL, TOKEN_LISTENER_LOCAL } from '@engine/core';

export interface ListenerRef {
  name: string, target: any; prop: string;
}

function createMetadata(token: string, metaTarget: object, name: string, target: object, prop: string) {
  if (!Reflect.hasMetadata(token, metaTarget)) {
    Reflect.defineMetadata(token, [], metaTarget);
  }
  const listeners = Reflect.getMetadata(token, metaTarget) as ListenerRef[];
  listeners.push({ name, target, prop });
}

export function Listener(token: EventToken) {
  return (target: any, prop: any, descriptor: PropertyDescriptor) => {
    if (token.name.split(':')?.[0] === 'game') {
      createMetadata(TOKEN_LISTENER_GLOBAL, window, token.name, target, prop);
    } else {
      createMetadata(TOKEN_LISTENER_LOCAL, target, token.name, target, prop);
    }

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
