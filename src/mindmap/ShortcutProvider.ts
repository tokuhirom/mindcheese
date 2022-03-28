import { MindCheese } from "./MindCheese";
import { KeyModifier } from "./MindmapConstants";

export default class ShortcutProvider {
  private readonly mindCheese: MindCheese;
  private enable: boolean;
  private readonly mappings: Record<
    string,
    [number, (jm: MindCheese, e: KeyboardEvent) => boolean][]
  >;

  constructor(
    mindCheese: MindCheese,
    enable: boolean,
    mappings: [number, string, (jm: MindCheese, e: Event) => boolean][]
  ) {
    this.mindCheese = mindCheese;
    this.enable = enable;
    this.mappings = this.compileHandlers(mappings);
  }

  bindKeyEvents(): void {
    document.addEventListener("keydown", this.handler.bind(this));
  }

  enableShortcut(): void {
    this.enable = true;
  }

  disableShortcut(): void {
    this.enable = false;
  }

  handler(e: KeyboardEvent): boolean {
    // noinspection JSDeprecatedSymbols
    if (e.which == 9) {
      e.preventDefault();
    } //prevent tab to change focus in browser
    if (this.mindCheese.view.isEditing()) {
      return true;
    }
    if (!this.enable) {
      return true;
    }

    console.debug(`ShortcutProvider.handler: ${e.code}`);
    const handlers = this.mappings[e.code];
    if (!handlers) {
      return true;
    }
    const gotFlags =
      (e.metaKey ? KeyModifier.META : 0) |
      (e.ctrlKey ? KeyModifier.CTRL : 0) |
      (e.altKey ? KeyModifier.ALT : 0) |
      (e.shiftKey ? KeyModifier.SHIFT : 0);
    for (const handler of handlers) {
      const [flags, code] = handler;
      if (flags === gotFlags) {
        return code(this.mindCheese, e);
      }
    }
    return true;
  }

  private compileHandlers(
    handlers: [number, string, (jm: MindCheese, e: Event) => boolean][]
  ): Record<string, [number, (jm: MindCheese, e: Event) => boolean][]> {
    const result: Record<
      string,
      [number, (jm: MindCheese, e: Event) => boolean][]
    > = {};
    handlers.forEach((it) => {
      const [flags, keyString, code] = it;
      if (!result[keyString]) {
        result[keyString] = [];
      }
      result[keyString].push([flags, code]);
    });
    return result;
  }
}
