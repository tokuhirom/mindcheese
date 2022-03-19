// noinspection JSUnusedGlobalSymbols

import LayoutProvider from "./LayoutProvider";
import ViewProvider from "./ViewProvider";
import ShortcutProvider from "./ShortcutProvider";
import MindNode from "./MindNode";
import Mind from "./Mind";
import Draggable from "./Draggable";
import { BEFOREID_LAST, Direction } from "./MindmapConstants";
import UndoManager from "./UndoManager";
import GraphCanvas from "./GraphCanvas";
import NodeTreeImporter from "./format/node_tree/NodeTreeImporter";
import MarkdownImporter from "./format/markdown/MarkdownImporter";
import MarkdownExporter from "./format/markdown/MarkdownExporter";
import NodeTreeExporter from "./format/node_tree/NodeTreeExporter";
import { MindOption } from "./MindOption";

function isEmpty(s: string) {
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

export default class MindCheese {
  options: any;
  public mind: Mind;
  layout: LayoutProvider;
  view: ViewProvider;
  shortcut: ShortcutProvider;
  draggable: Draggable;
  private readonly id: number;
  private undoManager: UndoManager;
  private editable: boolean;
  private readonly container: HTMLElement;

  private nodeTreeImporter = new NodeTreeImporter();
  private markdownImporter = new MarkdownImporter();

  constructor(id: number, container: HTMLElement, options: MindOption) {
    this.container = container;

    this.options = options;
    this.mind = null; // TODO original では null が入っていた
    this.id = id;
    this.editable = true;

    // create instance of function provider
    this.layout = new LayoutProvider(
      this,
      options.layout.hspace,
      options.layout.vspace,
      options.layout.pspace
    );
    const graph = new GraphCanvas(
      options.view.lineColor,
      options.view.lineWidth
    );
    this.view = new ViewProvider(
      this,
      this.container,
      options.view.hmargin,
      options.view.vmargin,
      graph
    );
    this.shortcut = new ShortcutProvider(
      this,
      options.shortcut.enable,
      options.shortcut.mappings
    );
    this.draggable = new Draggable(this);
    this.undoManager = new UndoManager(this);

    this.view.init();
    this.shortcut.init();
    this.draggable.init(this.container);

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

  private doShow(mind: any): void {
    this.mind = mind;
    if (!this.mind) {
      throw new Error("data.load error");
    }

    this.view.load();
    this.layout.layout();
    this.view.show();
    this.view.centerRoot();
  }

  showNodeTree(nodeTree: any): void {
    this.doReset();

    const mind = this.nodeTreeImporter.getMind(nodeTree);
    this.doShow(mind);
  }

  showMarkdown(title: string, body: string): void {
    this.doReset();

    const mind = this.markdownImporter.getMind(title, body);
    this.doShow(mind);
  }

  getMarkdown(): string {
    return new MarkdownExporter().getData(this.mind);
  }

  getNodeTree(): Record<string, any> {
    return new NodeTreeExporter().getData(this.mind);
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

    this.undoManager.recordSnapshot();
    const node = this.mind.addNode(parentNode, nodeid, topic, null, null, true);
    if (node) {
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
      this.expandNode(parentNode);
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

    this.undoManager.recordSnapshot();
    const node = this.mind.insertNodeBefore(nodeBefore, nodeid, topic);
    if (node) {
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
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
      this.undoManager.recordSnapshot();
      this.view.addNode(node);
      this.layout.layout();
      this.view.show();
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
    this.undoManager.recordSnapshot();
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

    this.undoManager.recordSnapshot();
    if (node.topic === topic) {
      console.info("nothing changed");
      this.view.updateNode(node);
      return;
    }
    node.topic = topic;
    this.view.updateNode(node);
    this.layout.layout();
    this.view.show();
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

    this.undoManager.recordSnapshot();
    this.mind.moveNode(node, beforeid, parent, direction);
    this.view.updateNode(node);
    this.layout.layout();
    this.view.show();
  }

  selectNode(node: MindNode): void {
    if (!node.data.layout.visible) {
      return;
    }
    this.mind.selected = node;
    this.view.selectNode(node);
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
