import JsMind from "./JsMind";

export default class PluginManager {
  private plugins: ((arg0: JsMind) => void)[];

  constructor() {
    this.plugins = [];
  }

  register(plugin: (arg0: JsMind) => void) {
    this.plugins.push(plugin);
  }

  init(sender: any) {
    setTimeout(() => {
      const l = this.plugins.length;
      for (let i = 0; i < l; i++) {
        const fn = this.plugins[i];
        fn(sender);
      }
    }, 0);
  }
}
