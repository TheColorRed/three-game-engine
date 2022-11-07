export interface OnStart {
  /** Executed one time after the object is created. */
  onStart(): void;
};
export interface OnUpdate {
  /** Executed once per tick. */
  onUpdate(): void;
};
export interface OnFrame {
  /** Executed once per animation frame (About 60 times per second). */
  onFrame(): void;
};
export interface OnEnable {
  /** Executed when the object becomes enabled. */
  onEnable(): void;
};
export interface OnDisable {
  /** Executed when the object becomes disabled. */
  onDisable(): void;
};
export interface OnDestroy {
  /** Executed when the object gets destroyed. */
  onDestroy(): void;
};