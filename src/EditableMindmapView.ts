import { Menu, Notice, TextFileView, TFile, WorkspaceLeaf } from "obsidian";
import { MINDMAP_VIEW_TYPE } from "./Constants";
import MyPlugin from "./main";
import { convertMM2MD } from "./MM2MDConverter";
import { convertMD2MM } from "./MD2MMConverter";
import JsMind from "./mindmap/JsMind";
import { EventType } from "./mindmap/MindmapConstants";

const FROMTMATTER_RE = /^---([\w\W]+)---/;

let jsMindId = 0;

export class EditableMindmapView extends TextFileView {
  private plugin: MyPlugin;
  private mm: JsMind;
  private yfm: string;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf);
    this.plugin = plugin;
    console.log("EditableMindmapView constructor");
    this.allowNoFile = false;
  }

  getDisplayText(): string {
    return this.file?.basename || "Kanban";
  }

  getViewType(): string {
    return MINDMAP_VIEW_TYPE;
  }

  clear(): void {
    console.log(`EditableMindmapView: clear`);
    this.mm.shortcut.disable_shortcut();
    this.mm.mind = null;
  }

  getViewData(): string {
    // console.log(`getViewData: invoked`);
    if (this.mm && this.mm.mind) {
      const data = this.mm.get_data("node_tree");
      if (!data.data) {
        // mindmap is not available, yet.
        return this.data;
      }
      // console.log(`getViewData: data=${JSON.stringify(data)}`);
      const md = convertMM2MD(data) as string;
      // console.log(`getViewData: data=${data} md=${md}`);

      return this.yfm + "\n\n" + md + "\n";
    }
    return this.data;
  }

  onMoreOptionsMenu(menu: Menu): void {
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
    console.log(
      `資格資格資格資格資格 SET VIEW DATA ${clear} ${
        this.mm
      } ${data} ID=${jsMindId++} TIMESTAMP`
    );
    console.log(data);
    console.log(clear);

    if (!this.file) {
      return;
    }

    this.yfm = EditableMindmapView.parseFrontamtter(data);

    const title = this.file.basename;
    this.data = data;

    // clear existing container elements.
    this.contentEl.querySelectorAll(".jsmind-container").forEach((it) => {
      it.remove();
    });

    this.contentEl.createDiv(
      {
        cls: ["jsmind-container", "jsMind-" + jsMindId],
      },
      (el) => {
        el.setAttribute("id", "jsmind_container");
        console.log("CONVERT!");
        let mind: any;
        try {
          mind = convertMD2MM(title, data);
        } catch (e) {
          new Notice(`Cannot parse mindmap file: ${title}: ${e}`);
          console.log(e);
        }
        console.log(
          `rendering mindmap: data=${data}, mind=${JSON.stringify(mind)} ${
            this.mm
          }`
        );
        const options = {
          container: el,
          theme: "primary", // TODO make it customizable?
          editable: true,
          support_html: false, // TODO HTML support
        };
        this.mm = new JsMind(jsMindId, options);
        // ↓ *quick hack* to avoid the timing issue...
        setTimeout(() => {
          this.mm.show("node_tree", mind);
        }, 0);
        this.mm.add_event_listener(
          EventType.AFTER_EDIT,
          this.jsMindEventListener.bind(this)
        );
      }
    );
  }

  async jsMindEventListener(): Promise<void> {
    console.log(`Got jsMind AFTER_EDIT event`);
    this.requestSave();
  }

  // TODO handle onResize
  onResize(): void {
    super.onResize();
  }

  protected async onOpen(): Promise<void> {
    return super.onOpen();
  }

  async onLoadFile(file: TFile): Promise<void> {
    return super.onLoadFile(file);
  }

  private static parseFrontamtter(md: string): string {
    const m = md.match(FROMTMATTER_RE);
    if (m) {
      return m[0];
    }
    return "---\neditable-mindmap-plugin: basic\n---\n\n";
  }
}
