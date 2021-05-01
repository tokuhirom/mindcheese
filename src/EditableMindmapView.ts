import {Menu, TextFileView, WorkspaceLeaf} from "obsidian";
import jsMind from "./jsmind";
import {MINDMAP_VIEW_TYPE} from "./Constants";
import MyPlugin from "./main";
import {convertMM2MD} from './MM2MDConverter';

const FROMTMATTER_RE = /^---([\w\W]+)---/;


export class EditableMindmapView extends TextFileView {
  private plugin: MyPlugin;
  private mm: jsMind;
  private yfm: string;

  constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
    super(leaf)
    this.plugin = plugin;
    console.log("EditableMindmapView constructor")
  }

  getDisplayText(): string {
    return this.file?.basename || "Kanban";
  }

  getViewType(): string {
    return MINDMAP_VIEW_TYPE;
  }

  clear(): void {
  }

  getViewData(): string {
    if (this.mm && this.mm.mind) {
      const data = this.mm.get_data('node_tree');
      console.log(data);
      const md = convertMM2MD(data) as string;
      console.log(md);

      console.log(this.yfm + "\n\n" + md);

      // TODO keep original YFM.
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
    console.log(`資格資格資格資格資格 SET VIEW DATA ${clear}`)
    console.log(data)
    console.log(clear)

    this.yfm = this.parseFrontamtter(data);

    this.contentEl.createDiv({}, el => {
      el.setAttribute('id', 'jsmind_container')
      const mind = {
        "meta": {
          "name": "jsMind remote",
          "author": "hizzgdev@163.com",
          "version": "0.2"
        },
        "format": "node_tree",
        "data": {
          "id": "root", "topic": "jsMind", "children": [
            {
              "id": "easy", "topic": "Easy", "direction": "left", "children": [
                {"id": "easy1", "topic": "Easy to show"},
                {"id": "easy2", "topic": "Easy to edit"},
                {"id": "easy3", "topic": "Easy to store"},
                {"id": "easy4", "topic": "Easy to embed"}
              ]
            },
            {
              "id": "open", "topic": "Open Source", "direction": "right", "children": [
                {"id": "open1", "topic": "on GitHub"},
                {"id": "open2", "topic": "BSD License"}
              ]
            },
            {
              "id": "powerful", "topic": "Powerful", "direction": "right", "children": [
                {"id": "powerful1", "topic": "Base on Javascript"},
                {"id": "powerful2", "topic": "Base on HTML5"},
                {"id": "powerful3", "topic": "Depends on you"}
              ]
            },
            {
              "id": "other", "topic": "test node", "direction": "left", "children": [
                {"id": "other1", "topic": "I'm from local variable"},
                {"id": "other2", "topic": "I can do everything"}
              ]
            }
          ]
        }
      };
      const options = {
        container: el,
        theme: 'asbestos', // TODO customizable
        editable: true,
        shortcut: {
          enable: true, 		// whether to enable shortcut
          handles: {}, 			// Named shortcut key event processor
          mapping: { 			// shortcut key mapping
            // addchild : 45, 	// <Insert>
            addchild: 9, 	// <Tab>
            addbrother: 13, // <Enter>
            editnode: 113, 	// <F2>
            delnode: 46, 	// <Delete>
            toggle: 32, 	// <Space>
            left: 37, 		// <Left>
            up: 38, 		// <Up>
            right: 39, 		// <Right>
            down: 40, 		// <Down>
          }
        },
      };
      this.mm = new jsMind(options);
      this.mm.mind = {};
      // ↓ *quick hack* to avoid the timing issue...
      setTimeout(() => {
        this.mm.show(mind)
      }, 0);
    })
    this.data = data;
  }

  private parseFrontamtter(md: string): string {
    const m = md.match(FROMTMATTER_RE);
    if (m) {
      return m[0];
    }
    return "---\neditable-mindmap-plugin: basic\n---\n\n";
  }

}