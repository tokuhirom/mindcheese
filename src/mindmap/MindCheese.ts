import LayoutProvider from "./LayoutProvider";
import ViewProvider from "./ViewProvider";
import ShortcutProvider from "./ShortcutProvider";
import MindNode from "./MindNode";
import Mind from "./Mind";
import Draggable from "./Draggable";
import { BEFOREID_LAST, Direction } from "./MindmapConstants";
import UndoManager from "./UndoManager";
import GraphCanvas from "./GraphCanvas";
import { object2mindmap } from "./format/node_tree/object2mindmap";
import { MindOption } from "./MindOption";
import { mindmap2markdown } from "./format/markdown/mindmap2markdown";
import { markdown2mindmap } from "./format/markdown/markdown2mindmap";

function isEmpty(s: string) {
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

export default class MindCheese {
  options: MindOption;
  public mind: Mind;
  layout: LayoutProvider;
  view: ViewProvider;
  shortcut: ShortcutProvider;
  draggable: Draggable;
  private readonly id: number;
  private undoManager: UndoManager;
  private editable: boolean;
  private readonly container: HTMLElement;

  constructor(
    id: number,
    container: HTMLElement,
    options: MindOption = new MindOption()
  ) {
    if (!container) {
      throw new Error("container shouldn't be null!");
    }

    this.container = container;

    this.options = options;
    this.mind = new Mind();
    this.id = id;
    this.editable = true;

    // create instance of function provider
    const graph = new GraphCanvas(
      options.view.lineColor,
      options.view.lineWidth
    );
    this.layout = new LayoutProvider(
      this,
      options.layout.hspace,
      options.layout.vspace,
      options.layout.pspace,
      graph
    );
    this.view = new ViewProvider(
      this,
      options.view.hmargin,
      options.view.vmargin,
      graph,
      options.view.renderer
    );
    this.shortcut = new ShortcutProvider(
      this,
      options.shortcut.enable,
      options.shortcut.mappings
    );
    this.draggable = new Draggable(this);
    this.undoManager = new UndoManager(this);

    this.view.init(this.container);
    this.draggable.init(this.container);

    this.shortcut.bindKeyEvents();

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

  checkEditable() {
    if (!this.editable) {
      throw new Error("fail, this mind map is not editable");
    }
  }

  setTheme(theme: string): void {
    const themeOld = this.options.theme;
    this.options.theme = theme ? theme : null;
    if (themeOld !== this.options.theme) {
      this.view.resetTheme();
    }
  }

  private bindEvent(): void {
    this.view.mcnodes.addEventListener(
      "mousedown",
      this.mousedownHandle.bind(this)
    );
    this.view.mcnodes.addEventListener("click", this.clickHandle.bind(this));
    this.view.mcnodes.addEventListener(
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
      if (element.tagName.toLowerCase() === "mcnode") {
        const theNode = this.getNodeById(nodeid);
        if (!theNode) {
          throw new Error("the node[id=" + nodeid + "] can not be found.");
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
          throw new Error("the node[id=" + nodeid + "] can not be found.");
        } else {
          return this.toggleNode(theNode);
        }
      }
    }
  }

  dblclickHandle(e: Event): boolean {
    this.checkEditable();
    e.preventDefault();
    e.stopPropagation();

    const element = e.target as HTMLElement;
    const nodeid = this.view.getBindedNodeId(element);
    if (nodeid) {
      const theNode = this.getNodeById(nodeid);
      if (theNode.data.view.element.contentEditable == "true") {
        // The node is already in the editing mode.
        return false;
      }

      if (!theNode) {
        throw new Error(`the node[id=${nodeid}] can not be found.`);
      }

      this.beginEdit(theNode);
      return false;
    }
  }

  beginEdit(node: MindNode): void {
    this.checkEditable();

    this.view.editNodeBegin(node);
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

  private doShow(mind: Mind): void {
    this.mind = mind;

    this.view.load();
    this.layout.layout();
    this.view.show();
    this.view.centerRoot();
  }

  // nodeTree = object representation of the mindmap.
  showNodeTree(nodeTree: any): void {
    this.doReset();
    this.doShow(object2mindmap(nodeTree));
  }

  showMarkdown(body: string): void {
    this.doReset();
    this.doShow(markdown2mindmap(body));
  }

  getMarkdown(): string {
    // return convertMM2MD(this.mind.root.toObject());
    return mindmap2markdown(this.mind);
  }

  getNodeTree(): Record<string, any> {
    return this.mind.root.toObject();
  }

  getRoot(): MindNode {
    return this.mind.root;
  }

  getNodeById(nodeid: string): MindNode {
    return this.mind.getNodeById(nodeid);
  }

  addNode(parentNode: MindNode, nodeid: string, topic: string): MindNode {
    this.checkEditable();

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
  ): MindNode {
    this.checkEditable();

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
  ): MindNode {
    this.checkEditable();

    this.undoManager.recordSnapshot();

    const node = this.mind.insertNodeAfter(nodeAfter, nodeid, topic);
    this.view.addNode(node);
    this.layout.layout();
    this.view.show();
    return node;
  }

  removeNode(node: MindNode): boolean {
    this.checkEditable();

    if (node.isroot) {
      throw new Error("fail, can not remove root node");
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
    this.checkEditable();

    if (isEmpty(topic)) {
      throw new Error("fail, topic can not be empty");
    }

    const node = this.getNodeById(nodeid);
    if (!node) {
      throw new Error(`Unknown node: ${nodeid}`);
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
    this.checkEditable();

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
    console.log("MindCheese.resize()");
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
            `MindCheese.moveDown: topic=${node.topic} before.topic=${
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
