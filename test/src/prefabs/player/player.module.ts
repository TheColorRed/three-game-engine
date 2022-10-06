import { Module } from '@engine/core';
import { Player } from './player.prefab';

@Module({
  prefabs: [Player],
  bootstrap: [Player]
})
export class PlayerModule { }