export {};

declare global {
  /* mount.ts augments Date.prototype with addHours; declare it so callers type-check. */
  interface Date {
    addHours(h: number): Date;
  }
}
