import JsMind from "./JsMind";

export default class ShortcutProvider {
  private readonly jm: JsMind;
  private enable: boolean;
  private readonly mappings: Record<
    string,
    [number, (jm: JsMind, e: KeyboardEvent) => boolean][]
  >;

  constructor(
    jm: JsMind,
    enable: boolean,
    mappings: [number, string, (jm: JsMind, e: Event) => boolean][]
  ) {
    this.jm = jm;
    this.enable = enable;
    this.mappings = this.compileHandlers(mappings);
  }

  init(): void {
    document.addEventListener("keydown", this.handler.bind(this));
  }

  enable_shortcut(): void {
    this.enable = true;
  }

  disable_shortcut(): void {
    this.enable = false;
  }

  handler(e: KeyboardEvent): boolean {
    // noinspection JSDeprecatedSymbols
    if (e.which == 9) {
      e.preventDefault();
    } //prevent tab to change focus in browser
    if (this.jm.view.is_editing()) {
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
      ((e.metaKey ? 1 : 0) << 13) +
      ((e.ctrlKey ? 1 : 0) << 12) +
      ((e.altKey ? 1 : 0) << 11) +
      ((e.shiftKey ? 1 : 0) << 10);
    for (const handler of handlers) {
      const [flags, code] = handler;
      if (flags === gotFlags) {
        return code(this.jm, e);
      }
    }
  }

  private compileHandlers(
    new_handlers: [number, string, (jm: JsMind, e: Event) => boolean][]
  ): Record<string, [number, (jm: JsMind, e: Event) => boolean][]> {
    const result: Record<
      string,
      [number, (jm: JsMind, e: Event) => boolean][]
    > = {};
    new_handlers.forEach((it) => {
      const [flags, keyString, code] = it;
      if (!result[keyString]) {
        result[keyString] = [];
      }
      result[keyString].push([flags, code]);
    });
    return result;
  }
}
