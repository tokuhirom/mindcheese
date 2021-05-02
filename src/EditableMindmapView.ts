import { Menu, TextFileView, WorkspaceLeaf } from "obsidian";
import { Mind } from "./mindmap/Mind";
import { initJsMindDrggable } from "./jsmind.draggable";
import { initJsMind } from "./jsmind";
import { MINDMAP_VIEW_TYPE } from "./Constants";
import MyPlugin from "./main";
import MM2MDConverter from "./MM2MDConverter";
import MD2MMConverter from "./MD2MMConverter";
import { Node } from "./mindmap/Node";
import { NodeTree } from "./mindmap/format/NodeTree";
import { DataProvider } from "./mindmap/DataProvider";
import GraphCanvas from "./mindmap/GraphCanvas";

const FROMTMATTER_RE = /^---([\w\W]+)---/;

const jsMind = initJsMind(Node, Mind, NodeTree, DataProvider, GraphCanvas);

initJsMindDrggable(jsMind, Node);

export class EditableMindmapView extends TextFileView {
  private plugin: MyPlugin;
  private mm: jsMind;
  private yfm: string;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
    console.log("EditableMindmapView constructor");
  }

  getDisplayText(): string {
    return this.file?.basename || "Kanban";
  }

  getViewType(): string {
    return MINDMAP_VIEW_TYPE;
  }

  clear(): void {}

  getViewData(): string {
    console.log(`getViewData: invoked`);
    if (this.mm && this.mm.mind) {
      const data = this.mm.get_data("node_tree");
      if (!data.data) {
        // mindmap is not available, yet.
        return this.data;
      }
      console.log(`getViewData: data=${JSON.stringify(data)}`);
      const md = MM2MDConverter.convertMM2MD(data) as string;
      console.log(`getViewData: data=${data} md=${md}`);

      return this.yfm + "\n\n" + md + "\n";
    }
    return this.data;
  }

  onMoreOptionsMenu(menu: Menu) {
    // Add a menu item to force the board to markdown view
    menu
      .addItem((item) => {
        item
          .setTitle("Open as markdown")
          .setIcon("document")
          .onClick(async () => {
            this.plugin.mindmapFileModes[
              (this.leaf as any).id || this.file.path
            ] = "markdown";
            await this.plugin.setMarkdownView(this.leaf);
          });
      })
      .addSeparator();

    super.onMoreOptionsMenu(menu);
  }

  setViewData(data: string, clear: boolean): void {
    console.log(`資格資格資格資格資格 SET VIEW DATA ${clear} ${data}`);
    console.log(data);
    console.log(clear);

    this.yfm = this.parseFrontamtter(data);

    const title = this.file.basename;
    this.data = data;

    this.contentEl.createDiv({}, (el) => {
      el.setAttribute("id", "jsmind_container");
      const mind = MD2MMConverter.convertMD2MM(title, data);
      console.log(
        `rendering mindmap: data=${data}, mind=${JSON.stringify(mind)}`
      );
      const options = {
        container: el,
        theme: "primary", // TODO customizable
        editable: true,
        shortcut: {
          enable: true, // whether to enable shortcut
          handles: {}, // Named shortcut key event processor
          mapping: {
            // shortcut key mapping
            // addchild : 45, 	// <Insert>
            addchild: 9, // <Tab>
            addbrother: 13, // <Enter>
            editnode: 113, // <F2>
            delnode: 46, // <Delete>
            toggle: 32, // <Space>
            left: 37, // <Left>
            up: 38, // <Up>
            right: 39, // <Right>
            down: 40, // <Down>
          },
        },
      };
      this.mm = new jsMind(options);
      this.mm.mind = {}; // without this, get_data will fail... XXX
      // ↓ *quick hack* to avoid the timing issue...
      setTimeout(() => {
        this.mm.show(mind);
      }, 0);
      this.mm.add_event_listener(this.jsMindEventListener.bind(this));
    });
  }

  async jsMindEventListener(eventType: number, params: any) {
    const event_type_map: Record<number, string> = {
      1: "show",
      2: "resize",
      3: "edit",
      4: "select",
    };
    console.log(`Got jsMind event: ${event_type_map[eventType]}`);

    if (eventType == jsMind.event_type.edit) {
      setTimeout(async () => {
        const viewData = this.getViewData();
        console.log(`Write data by jsMind's event: ${viewData}`);
        console.log(params);
        await this.plugin.app.vault.modify(this.file, viewData);
      }, 10);
    }
  }

  private parseFrontamtter(md: string): string {
    const m = md.match(FROMTMATTER_RE);
    if (m) {
      return m[0];
    }
    return "---\neditable-mindmap-plugin: basic\n---\n\n";
  }
}
