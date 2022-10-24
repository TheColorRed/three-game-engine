import { EventToken } from '../tokens/event-token';
import { LISTENER_GLOBAL, LISTENER_LOCAL } from '../tokens/listener-tokens';

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
      createMetadata(LISTENER_GLOBAL, window, token.name, target, prop);
    } else {
      createMetadata(LISTENER_LOCAL, target, token.name, target, prop);
    }

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
