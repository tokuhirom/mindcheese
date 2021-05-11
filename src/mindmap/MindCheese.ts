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

function isEmpty(s: string) {
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

const DEFAULT_OPTIONS: any = {
  theme: "primary",

  view: {
    hmargin: 100,
    vmargin: 50,
    lineWidth: 2,
    lineColor: "#555",
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
  private undoManager: UndoManager;
  private readonly eventRouter: EventRouter;
  private editable: boolean;
  private readonly container: HTMLElement;

  constructor(id: number, container: HTMLElement, options: any = {}) {
    this.container = container;

    let opts = Object.assign({}, DEFAULT_OPTIONS);
    opts = Object.assign(opts, options);
    this.options = opts;
    this.inited = false;
    this.mind = null; // TODO original では null が入っていた
    this.id = id;
    this.eventRouter = new EventRouter();
    this.editable = true;
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
      this.eventRouter,
      opts.layout.hspace,
      opts.layout.vspace,
      opts.layout.pspace
    );
    const graph = new GraphCanvas(opts.view.line_color, opts.view.line_width);
    this.view = new ViewProvider(
      this,
      this.eventRouter,
      this.container,
      opts.view.hmargin,
      opts.view.vmargin,
      graph
    );
    this.shortcut = new ShortcutProvider(
      this,
      opts.shortcut.enable,
      opts.shortcut.mappings
    );
    this.draggable = new Draggable(this, this.eventRouter);
    this.undoManager = new UndoManager(this);

    this.layout.init();
    this.view.init();
    this.shortcut.init();
    this.draggable.init(this.container);
    this.undoManager.init();

    this.bindEvent();
  }

  enableEdit(): void {
    this.editable = true;
  }

  disableEdit(): void {
    this.editable = false;
  }

  isEditable(): boolean {
    return this.editable;
  }

  setTheme(theme: string): void {
    const themeOld = this.options.theme;
    this.options.theme = theme ? theme : null;
    if (themeOld !== this.options.theme) {
      this.view.resetTheme();
    }
  }

  private bindEvent(): void {
    this.view.jmnodes.addEventListener(
      "mousedown",
      this.mousedownHandle.bind(this)
    );
    this.view.jmnodes.addEventListener("click", this.clickHandle.bind(this));
    this.view.jmnodes.addEventListener(
      "dblclick",
      this.dblclickHandle.bind(this)
    );
    window.addEventListener("resize", () => {
      this.resize();
      return false;
    });
  }

  mousedownHandle(e: Event): void {
    const element = e.target as HTMLElement;
    const nodeid = this.view.getBindedNodeId(element);
    if (nodeid) {
      if (element.tagName.toLowerCase() === "jmnode") {
        const theNode = this.getNodeById(nodeid);
        if (!theNode) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.selectNode(theNode);
        }
      }
    } else {
      this.selectClear();
    }
  }

  clickHandle(e: Event): void {
    const element = e.target as HTMLElement;
    const isexpander = this.view.isExpander(element);
    if (isexpander) {
      const nodeid = this.view.getBindedNodeId(element);
      if (nodeid) {
        const theNode = this.getNodeById(nodeid);
        if (!theNode) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.toggleNode(theNode);
        }
      }
    }
  }

  dblclickHandle(e: Event): void {
    if (!this.isEditable()) {
      console.warn("The mindmap is not editable now.");
      return;
    }

    const element = e.target as HTMLElement;
    const nodeid = this.view.getBindedNodeId(element);
    if (nodeid) {
      if (nodeid) {
        const theNode = this.getNodeById(nodeid);

        if (!theNode) {
          throw new Error(`the node[id=${nodeid}] can not be found.`);
        }

        return this.beginEdit(theNode);
      }
    }
  }

  beginEdit(node: MindNode): void {
    if (this.isEditable()) {
      this.view.editNodeBegin(node);
    } else {
      console.error("fail, this mind map is not editable.");
    }
  }

  endEdit(): void {
    this.view.editNodeEnd();
  }

  toggleNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    const location = this.view.takeLocation(node);
    this.layout.toggleNode(node);
    this.view.show();
    this.view.restoreLocation(node, location);
  }

  expandNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    const location = this.view.takeLocation(node);
    this.layout.expandNode(node);
    this.view.show();
    this.view.restoreLocation(node, location);
  }

  collapseNode(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    const location = this.view.takeLocation(node);
    this.layout.collapseNode(node);
    this.view.show();
    this.view.restoreLocation(node, location);
  }

  expandAll(): void {
    this.layout.expandAll();
    this.view.show();
  }

  collapseAll(): void {
    this.layout.collapseAll();
    this.view.show();
  }

  expandToDepth(depth: number): void {
    this.layout.expandToDepth(depth, null, null);
    this.view.show();
  }

  private doReset(): void {
    this.view.reset();
    this.layout.reset();
  }

  private doShow(format: string, mind: any): void {
    this.mind = this.data.load(format, mind);
    if (!this.mind) {
      throw new Error("data.load error");
    }

    this.view.load();
    this.layout.layout();
    this.view.show();
    this.view.centerRoot();
    this.eventRouter.invokeEventHandler(EventType.Show, { data: [mind] });
  }

  show(format: string, mind: any): void {
    this.doReset();
    this.doShow(format, mind);
  }

  getData(dataFormat: string): any {
    return this.data.getData(dataFormat, this.mind);
  }

  getRoot(): MindNode {
    return this.mind.root;
  }

  getNodeById(nodeid: string): MindNode {
    return this.mind.getNodeById(nodeid);
  }

  addNode(
    parentNode: MindNode,
    nodeid: string,
    topic: string
  ): null | MindNode {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
      evt: "add_node",
      data: [parentNode.id, nodeid, topic],
      node: nodeid,
    });
    const node = this.mind.addNode(parentNode, nodeid, topic, null, null, true);
    if (node) {
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
      this.expandNode(parentNode);
      this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
        evt: "add_node",
        data: [parentNode.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  insertNodeBefore(
    nodeBefore: MindNode,
    nodeid: string,
    topic: string
  ): null | MindNode {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
      evt: "insert_node_before",
      data: [nodeBefore.id, nodeid, topic],
      node: nodeid,
    });
    const node = this.mind.insertNodeBefore(nodeBefore, nodeid, topic);
    if (node) {
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
      this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
        evt: "insert_node_before",
        data: [nodeBefore.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  insertNodeAfter(
    nodeAfter: MindNode,
    nodeid: string,
    topic: string
  ): MindNode | null {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return null;
    }

    const node = this.mind.insertNodeAfter(nodeAfter, nodeid, topic);
    if (node) {
      this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
        evt: "insert_node_after",
        data: [nodeAfter.id, nodeid, topic],
        node: nodeid,
      });
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
      this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
        evt: "insert_node_after",
        data: [nodeAfter.id, nodeid, topic],
        node: nodeid,
      });
    }
    return node;
  }

  removeNode(node: MindNode): boolean {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return false;
    }

    if (node.isroot) {
      console.error("fail, can not remove root node");
      return false;
    }

    const nodeid = node.id;
    const parentNode = node.parent;
    const parentid = node.parent.id;
    this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
      evt: "remove_node",
      data: [nodeid],
      node: parentid,
    });
    const nextSelectedNode = this.findUpperBrotherOrParentNode(
      parentNode,
      nodeid
    );
    const location = this.view.takeLocation(node);
    this.view.removeNode(node);
    this.mind.removeNode(node);
    this.layout.layout();
    this.view.show();
    if (parentNode.children.length > 0) {
      this.mind.selected = nextSelectedNode;
      this.view.selectNode(nextSelectedNode);
    }
    this.view.restoreLocation(parentNode, location);
    this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
      evt: "remove_node",
      data: [nodeid],
      node: parentid,
    });
    return true;
  }

  private findUpperBrotherOrParentNode(
    parentNode: MindNode,
    targetNodeId: string
  ) {
    const children = parentNode.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].id == targetNodeId) {
        if (i == 0) {
          return parentNode;
        } else {
          return children[i - 1];
        }
      }
    }
    return parentNode; // return
  }

  // set topic to the node
  updateNode(nodeid: string, topic: string): void {
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return;
    }

    if (isEmpty(topic)) {
      console.warn("fail, topic can not be empty");
      return;
    }

    const node = this.getNodeById(nodeid);
    if (!node) {
      console.warn(`Unknown node: ${nodeid}`);
      return;
    }

    this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
      evt: "update_node",
      data: [nodeid, topic],
      node: nodeid,
    });
    if (node.topic === topic) {
      console.info("nothing changed");
      this.view.updateNode(node);
      return;
    }
    node.topic = topic;
    this.view.updateNode(node);
    this.layout.layout();
    this.view.show();
    this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
      evt: "update_node",
      data: [nodeid, topic],
      node: nodeid,
    });
  }

  /**
   * @param node Target node to move.
   * @param beforeid Move nodeid's node to above of the *beforeid*. You can use BEFOREID_* constants.
   * @param parent
   * @param direction
   */
  moveNode(
    node: MindNode,
    beforeid: string,
    parent: MindNode,
    direction: Direction
  ): void {
    console.log(
      `jm.move_node: ${node.id} ${beforeid} ${parent.id} ${direction}`
    );
    if (!this.isEditable()) {
      console.error("fail, this mind map is not editable");
      return;
    }

    this.eventRouter.invokeEventHandler(EventType.BeforeEdit, {
      evt: "move_node",
      data: [node.id, beforeid, parent.id, direction],
      node: node.id,
    });
    this.mind.moveNode(node, beforeid, parent, direction);
    this.view.updateNode(node);
    this.layout.layout();
    this.view.show();
    this.eventRouter.invokeEventHandler(EventType.AfterEdit, {
      evt: "move_node",
      data: [node.id, beforeid, parent.id, direction],
      node: node.id,
    });
  }

  selectNode(node: MindNode): void {
    if (!node.data.layout.visible) {
      return;
    }
    this.mind.selected = node;
    this.view.selectNode(node);
    this.eventRouter.invokeEventHandler(EventType.Select, {
      evt: "select_node",
      data: [],
      node: node.id,
    });
  }

  getSelectedNode(): MindNode {
    if (this.mind) {
      return this.mind.selected;
    } else {
      return null;
    }
  }

  selectClear(): void {
    if (this.mind) {
      this.mind.selected = null;
      this.view.selectClear();
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
      return this.mind.getNodeBefore(node);
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
      return this.mind.getNodeAfter(node);
    }
  }

  resize(): void {
    console.log("JsMind.resize()");
    this.view.resize();
  }

  addEventListener(eventType: EventType, callback: (data: any) => void): void {
    this.eventRouter.addEventListener(eventType, callback);
  }

  undo(): void {
    this.undoManager.undo();
  }

  moveUp(node: MindNode): void {
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
      this.moveNode(node, upNode.id, node.parent, node.direction);
      return;
    }
  }

  moveDown(node: MindNode) {
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
          this.moveNode(node, BEFOREID_LAST, node.parent, node.direction);
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
          this.moveNode(node, children[i + 2].id, node.parent, node.direction);
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
