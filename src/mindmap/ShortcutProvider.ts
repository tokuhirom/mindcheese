import MindCheese from "./MindCheese";
import { KeyModifier } from "./MindmapConstants";
import ShortcutHandlers from "./ShortcutHandlers";

export default class ShortcutProvider {
  private readonly jm: MindCheese;
  private enable: boolean;
  private readonly mappings: Record<
    string,
    [number, (jm: MindCheese, e: KeyboardEvent) => boolean][]
  >;

  constructor(
    jm: MindCheese,
    enable = true,
    mappings: [number, string, (jm: MindCheese, e: Event) => boolean][] = [
      [KeyModifier.NONE, "Delete", ShortcutHandlers.delete],
      [KeyModifier.NONE, "Tab", ShortcutHandlers.addChild],
      [KeyModifier.NONE, "Enter", ShortcutHandlers.addBrother],
      [KeyModifier.CTRL, "Enter", ShortcutHandlers.editNode],
      [KeyModifier.NONE, "Space", ShortcutHandlers.toggle],
      [KeyModifier.SHIFT, "ArrowUp", ShortcutHandlers.moveUp],
      [KeyModifier.SHIFT, "ArrowDown", ShortcutHandlers.moveDown],
      [KeyModifier.NONE, "ArrowUp", ShortcutHandlers.up],
      [KeyModifier.NONE, "ArrowDown", ShortcutHandlers.down],
      [KeyModifier.NONE, "ArrowLeft", ShortcutHandlers.left],
      [KeyModifier.NONE, "ArrowRight", ShortcutHandlers.right],
      [KeyModifier.CTRL, "KeyZ", ShortcutHandlers.undo],
    ]
  ) {
    this.jm = jm;
    this.enable = enable;
    this.mappings = this.compileHandlers(mappings);
  }

  init(): void {
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
    if (this.jm.view.isEditing()) {
      return;
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
        return code(this.jm, e);
      }
    }
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
