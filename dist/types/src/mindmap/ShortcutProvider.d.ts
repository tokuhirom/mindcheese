import { MindCheese } from "./MindCheese";
export declare class ShortcutProvider {
  private readonly mindCheese;
  private enable;
  private readonly mappings;
  constructor(
    mindCheese: MindCheese,
    enable: boolean,
    mappings: [number, string, (jm: MindCheese, e: Event) => boolean][],
  );
  bindKeyEvents(): void;
  enableShortcut(): void;
  disableShortcut(): void;
  handler(e: KeyboardEvent): boolean;
  private compileHandlers;
}
