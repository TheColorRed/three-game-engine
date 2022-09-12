export class EventToken {
  constructor(
    public readonly name: string | `game:${string}`
  ) { }
}