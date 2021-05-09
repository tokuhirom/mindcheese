// noinspection JSUnusedGlobalSymbols

import DataProvider from "./DataProvider";
import LayoutProvider from "./LayoutProvider";
import ViewProvider from "./ViewProvider";
import ShortcutProvider from "./ShortcutProvider";
import MindNode from "./MindNode";
import Mind from "./Mind";
import Draggable from "./Draggable";
import {
  BEFOREID_LAST,
  Direction,
  EventType,
  KeyModifier,
} from "./MindmapConstants";
import UndoManager from "./UndoManager";
import ShortcutHandlers from "./ShortcutHandlers";
import EventRouter from "./EventRouter";
import GraphCanvas from "./GraphCanvas";

function is_empty(s: string) {
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

const DEFAULT_OPTIONS: any = {
  container: "", // id of the container
  theme: null,
  mode: "full", // full or side
  support_html: true,

  view: {
    hmargin: 100,
    vmargin: 50,
    line_width: 2,
    line_color: "#555",
  },
  layout: {
    hspace: 30,
    vspace: 20,
    pspace: 13,
  },
  shortcut: {
    enable: true,
    mappings: [
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
    ],
  },
};

export default class MindCheese {
  options: any;
  private inited: boolean;
  public mind: Mind;
  private data: DataProvider;
  layout: LayoutProvider;
  view: ViewProvider;
  shortcut: ShortcutProvider;
  draggable: Draggable;
  private readonly id: number;
  private undo_manager: UndoManager;
  private readonly event_router: EventRouter;
  private _editable: boolean;

  constructor(id: number, options: any) {
    let opts = Object.assign({}, DEFAULT_OPTIONS);
    opts = Object.assign(opts, options);
    if (!opts.container) {
      console.error("the options.container should not be null or empty.");
      return;
    }
    this.options = opts;
    this.inited = false;
    this.mind = null; // TODO original では null が入っていた
    this.id = id;
    this.event_router = new EventRouter();
    this._editable = true;
    this.init();
  }

  init(): void {
    if (this.inited) {
      return;
    }
    this.inited = true;

    const opts = this.options;

    // create instance of function provider
    this.data = new DataProvider();
    this.layout = new LayoutProvider(
      this,
      this.event_router,
      opts.mode,
      opts.layout.hspace,
      opts.layout.vspace,
      opts.layout.pspace
    );
    const graph = new GraphCanvas(opts.view.line_color, opts.view.line_width);
    this.view = new ViewProvider(
      this,
      opts.container,
      opts.view.hmargin,
      opts.view.vmargin,
      graph
    );
    this.shortcut = new ShortcutProvider(
      this,
      opts.shortcut.enable,
      opts.shortcut.mappings
    );
    this.draggable = new Draggable(this);
    this.undo_manager = new UndoManager(this);

    this.layout.init();
    this.view.init();
    this.shortcut.init();
    this.draggable.init(opts.container);
    this.undo_manager.init();

    this._event_bind();
  }

  enable_edit(): void {
    this._editable = true;
  }

  disable_edit(): void {
    this._editable = false;
  }

  isEditable(): boolean {
    return this._editable;
  }

  set_theme(theme: string): void {
    const theme_old = this.options.theme;
    this.options.theme = theme ? theme : null;
    if (theme_old !== this.options.theme) {
      this.view.reset_theme();
    }
  }

  _event_bind(): void {
    this.view.e_nodes.addEventListener(
      "mousedown",
      this.mousedown_handle.bind(this)
    );
    this.view.e_nodes.addEventListener("click", this.click_handle.bind(this));
    this.view.e_nodes.addEventListener(
      "dblclick",
      this.dblclick_handle.bind(this)
    );
    window.addEventListener("resize", () => {
      this.resize();
      return false;
    });
  }

  mousedown_handle(e: Event): void {
    const element = e.target as HTMLElement;
    const nodeid = this.view.get_binded_nodeid(element);
    if (nodeid) {
      if (element.tagName.toLowerCase() === "jmnode") {
        const the_node = this.getNodeById(nodeid);
        if (!the_node) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.select_node(the_node);
        }
      }
    } else {
      this.select_clear();
    }
  }

  click_handle(e: Event): void {
    const element = e.target as HTMLElement;
    const isexpander = this.view.is_expander(element);
    if (isexpander) {
      const nodeid = this.view.get_binded_nodeid(element);
      if (nodeid) {
        const the_node = this.getNodeById(nodeid);
        if (!the_node) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.toggle_node(the_node);
        }
      }
    }
  }

  dblclick_handle(e: Event): void {
    if (!this.isEditable()) {
      console.warn("The mindmap is not editable now.");
      return;
    }

    const element = e.target as HTMLElement;
    const nodeid = this.view.get_binded_nodeid(element);
    if (nodeid) {
      if (nodeid) {
        const the_node = this.getNodeById(nodeid);

        if (!the_node) {
          throw new Error(`the node[id=${nodeid}] can not be found.`);
        }

        return this.begin_edit(the_node);
      }
    }
  }

  begin_edit(node: MindNode): void {
    if (this.isEditable()) {
      this.view.edit_node_begin(node);
    } else {
      console.error("fail, this mind map is not editable.");
    }
  }

  end_edit(): void {
    this.view.edit_node_end();
  }

  toggle_node(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.toggle_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  expand_node(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.expand_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  collapse_node(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.collapse_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  expand_all(): void {
    this.layout.expand_all();
    this.view.relayout();
  }

  collapse_all(): void {
    this.layout.collapse_all();
    this.view.relayout();
  }

  expand_to_depth(depth: number): void {
    this.layout.expand_to_depth(depth, null, null);
    this.view.relayout();
  }

  _reset(): void {
    this.view.reset();
    this.layout.reset();
  }

  _show(format: string, mind: any): void {
    this.mind = this.data.load(format, mind);
    if (!this.mind) {
      throw new Error("data.load error");
    }

    this.view.load();
    this.layout.layout();
    this.view.show(true);
    this.invoke_event_handle(EventType.SHOW, { data: [mind] });
  }

  show(format: string, mind: any): void {
    this._reset();
    this._show(format, mind);
  }

  getData(data_format: string): any {
    return this.data.getData(data_format, this.mind);
  }

  getRoot(): MindNode {
    return this.mind.root;
  }

  getNodeById(nodeid: string): MindNode {
    return this.mind.getNodeById(nodeid);
  }

  add_node(
    parent_node: MindNode,
    nodeid: string,
    topic: string
  ): null | MindNode {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    this.invoke_event_handle(EventType.BEFORE_EDIT, {
      evt: "add_node",
      data: [parent_node.id, nodeid, topic],
      node: nodeid,
    });
    const node = this.mind.add_node(
      parent_node,
      nodeid,
      topic,
      null,
      null,
      true
    );
    if (node) {
      this.view.add_node(node);
      this.layout.layout();
      this.view.show(false);
      this.expand_node(parent_node);
      this.invoke_event_handle(EventType.AFTER_EDIT, {
        evt: "add_node",
        data: [parent_node.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  insert_node_before(
    node_before: MindNode,
    nodeid: string,
    topic: string
  ): null | MindNode {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    this.invoke_event_handle(EventType.BEFORE_EDIT, {
      evt: "insert_node_before",
      data: [node_before.id, nodeid, topic],
      node: nodeid,
    });
    const node = this.mind.insert_node_before(node_before, nodeid, topic);
    if (node) {
      this.view.add_node(node);
      this.layout.layout();
      this.view.show(false);
      this.invoke_event_handle(EventType.AFTER_EDIT, {
        evt: "insert_node_before",
        data: [node_before.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  insert_node_after(
    node_after: MindNode,
    nodeid: string,
    topic: string
  ): MindNode | null {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    const node = this.mind.insert_node_after(node_after, nodeid, topic);
    if (node) {
      this.invoke_event_handle(EventType.BEFORE_EDIT, {
        evt: "insert_node_after",
        data: [node_after.id, nodeid, topic],
        node: nodeid,
      });
      this.view.add_node(node);
      this.layout.layout();
      this.view.show(false);
      this.invoke_event_handle(EventType.AFTER_EDIT, {
        evt: "insert_node_after",
        data: [node_after.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  remove_node(node: MindNode): boolean {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return false;
    }

    if (node.isroot) {
      console.error("fail, can not remove root node");
      return false;
    }

    const nodeid = node.id;
    const parent_node = node.parent;
    const parentid = node.parent.id;
    this.invoke_event_handle(EventType.BEFORE_EDIT, {
      evt: "remove_node",
      data: [nodeid],
      node: parentid,
    });
    const nextSelectedNode = this.findUpperBrotherOrParentNode(
      parent_node,
      nodeid
    );
    this.view.save_location(parent_node);
    this.view.remove_node(node);
    this.mind.removeNode(node);
    this.layout.layout();
    this.view.show(false);
    if (parent_node.children.length > 0) {
      this.mind.selected = nextSelectedNode;
      this.view.select_node(nextSelectedNode);
    }
    this.view.restore_location(parent_node);
    this.invoke_event_handle(EventType.AFTER_EDIT, {
      evt: "remove_node",
      data: [nodeid],
      node: parentid,
    });
    return true;
  }

  private findUpperBrotherOrParentNode(
    parent_node: MindNode,
    target_node_id: string
  ) {
    const children = parent_node.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].id == target_node_id) {
        if (i == 0) {
          return parent_node;
        } else {
          return children[i - 1];
        }
      }
    }
    return parent_node; // return
  }

  // set topic to the node
  update_node(nodeid: string, topic: string): void {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return;
    }

    if (is_empty(topic)) {
      console.warn("fail, topic can not be empty");
      return;
    }

    const node = this.getNodeById(nodeid);
    if (!node) {
      console.warn(`Unknown node: ${nodeid}`);
      return;
    }

    this.invoke_event_handle(EventType.BEFORE_EDIT, {
      evt: "update_node",
      data: [nodeid, topic],
      node: nodeid,
    });
    if (node.topic === topic) {
      console.info("nothing changed");
      this.view.update_node(node);
      return;
    }
    node.topic = topic;
    this.view.update_node(node);
    this.layout.layout();
    this.view.show(false);
    this.invoke_event_handle(EventType.AFTER_EDIT, {
      evt: "update_node",
      data: [nodeid, topic],
      node: nodeid,
    });
  }

  /**
   * @param nodeid
   * @param beforeid Move nodeid's node to above of the *beforeid*. You can use BEFOREID_* constants.
   * @param parentid
   * @param direction
   */
  move_node(
    nodeid: string,
    beforeid: string,
    parentid: string,
    direction: Direction
  ): void {
    console.log(`jm.move_node: ${nodeid} ${beforeid} ${parentid} ${direction}`);
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return;
    }

    const the_node = this.getNodeById(nodeid);
    if (!the_node) {
      console.error("the node[id=" + nodeid + "] can not be found.");
      return;
    }

    this.invoke_event_handle(EventType.BEFORE_EDIT, {
      evt: "move_node",
      data: [nodeid, beforeid, parentid, direction],
      node: nodeid,
    });
    const node = this.mind.move_node(the_node, beforeid, parentid, direction);
    this.view.update_node(node);
    this.layout.layout();
    this.view.show(false);
    this.invoke_event_handle(EventType.AFTER_EDIT, {
      evt: "move_node",
      data: [nodeid, beforeid, parentid, direction],
      node: nodeid,
    });
  }

  select_node(node: MindNode): void {
    if (!this.layout.is_visible(node)) {
      return;
    }
    this.mind.selected = node;
    this.view.select_node(node);
    this.invoke_event_handle(EventType.SELECT, {
      evt: "select_node",
      data: [],
      node: node.id,
    });
  }

  get_selected_node(): MindNode {
    if (this.mind) {
      return this.mind.selected;
    } else {
      return null;
    }
  }

  select_clear(): void {
    if (this.mind) {
      this.mind.selected = null;
      this.view.select_clear();
    }
  }

  findNodeBefore(node: MindNode): null | MindNode {
    if (node.isroot) {
      return null;
    }

    if (node.parent.isroot) {
      const children = node.parent.children.filter(
        (it) => it.direction === node.direction
      );
      for (let i = 0; i < children.length; i++) {
        const ni = children[i];
        if (node.id === ni.id) {
          if (i !== 0) {
            return children[i - 1];
          } else {
            return null;
          }
        }
      }
      throw new Error(`Missing the node in parent: ${node.id}`);
    } else {
      return this.mind.get_node_before(node);
    }
  }

  findNodeAfter(node: MindNode): null | MindNode {
    if (node.isroot) {
      return null;
    }

    if (node.parent.isroot) {
      const children = node.parent.children.filter(
        (it) => it.direction == node.direction
      );
      for (let i = 0; i < children.length; i++) {
        const ni = children[i];
        if (node.id === ni.id) {
          if (i + 1 < children.length) {
            return children[i + 1];
          } else {
            return null; // the last node.
          }
        }
      }
      throw new Error(
        `Illegal state. The parent node doesn't have this child: ${node.id}`
      );
    } else {
      return this.mind.get_node_after(node);
    }
  }

  resize(): void {
    console.log("JsMind.resize()");
    this.view.resize();
  }

  add_event_listener(
    eventType: EventType,
    callback: (data: any) => void
  ): void {
    this.event_router.addEventListener(eventType, callback);
  }

  invoke_event_handle(eventType: EventType, data: any): void {
    this.event_router.invokeEventHandler(eventType, data);
  }

  undo(): void {
    this.undo_manager.undo();
  }

  move_up(node: MindNode): void {
    /*
    as-is:
      - a
       - foo
       - bar      ← selected node.

    after:
      - a
        - bar      ← target node
        - foo
     */
    const upNode = this.findNodeBefore(node);
    if (upNode) {
      this.move_node(
          node.id,
          upNode.id,
          node.parent.id,
          node.direction
      )
      return;
    }
  }

  move_down(node: MindNode) {
    const children = node.parent.children.filter(
      (it) => it.direction === node.direction
    );
    for (let i = 0; i < children.length; i++) {
      if (children[i].id == node.id) {
        if (i === children.length - 1) {
          // already in the last.
          return; // do nothing
        } else if (i === children.length - 2) {
          // already in the above of the last one.
          /*
           * before:
           *   - a
           *     - b = 1
           *     - c = 2
           *
           * after:
           *   - a
           *     - c = 2
           *     - b = LAST
           */
          this.move_node(
            node.id,
            BEFOREID_LAST,
            node.parent.id,
            node.direction
          );
          return; // Put on last element.
        } else {
          /*
           * before:
           *   - a
           *     - b = 1 ← node.id
           *     - c = 2
           *     - d = 3 ← beforeid
           *
           * after:
           *   - a
           *     - c = 2
           *     - b = 3-0.5=2.5
           *     - d = 3
           */
          console.debug(
            `JsMind.move_down: topic=${node.topic} before.topic=${
              children[i + 1].topic
            } direction=${node.direction}`
          );
          this.move_node(
            node.id,
            children[i + 2].id,
            node.parent.id,
            node.direction
          );
          console.log(this.mind);
          return;
        }
      }
    }
  }

  generateNewId(): string {
    return (
      new Date().getTime().toString(16) + Math.random().toString(16).substr(2)
    ).substr(2, 16);
  }
}
