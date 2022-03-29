import { ViewProvider } from "./ViewProvider";
import { ShortcutProvider } from "./ShortcutProvider";
import { MindNode } from "./model/MindNode";
import { Mind } from "./Mind";
import { Draggable } from "./Draggable";
import { BEFOREID_LAST, Direction } from "./MindmapConstants";
import { UndoManager } from "./UndoManager";
import { object2mindmap } from "./format/node_tree/object2mindmap";
import { MindOption } from "./MindOption";
import { mindmap2markdown } from "./format/markdown/mindmap2markdown";
import { markdown2mindmap } from "./format/markdown/markdown2mindmap";
import { generateNewId } from "./utils/RandomID";
import { LayoutEngine } from "./layout/LayoutEngine";
import { findMcnode } from "./utils/DomUtils";
import { GraphCanvas } from "./view/graph/GraphCanvas";

export class MindCheese {
  options: MindOption;
  public mind: Mind;
  view: ViewProvider;
  shortcut: ShortcutProvider;
  draggable: Draggable;
  private readonly id: number;
  private undoManager: UndoManager;
  private editable: boolean;
  private readonly container: HTMLElement;
  private zoomScale = 1.0;

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
    const layoutEngine = new LayoutEngine(
      options.layout.hspace,
      options.layout.vspace,
      options.layout.pspace
    );
    this.view = new ViewProvider(
      this,
      options.view.hmargin,
      options.view.vmargin,
      graph,
      options.view.renderer,
      layoutEngine,
      options.layout.pspace
    );
    this.shortcut = new ShortcutProvider(
      this,
      options.shortcut.enable,
      options.shortcut.mappings
    );
    this.draggable = new Draggable(this);
    this.undoManager = new UndoManager(this);

    this.view.init(this.container);
    this.draggable.eventBind(this.container);

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
    this.options.theme = theme;
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
    this.view.mindCheeseInnerElement.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) {
          e.stopPropagation();
          if (e.deltaY > 0) {
            this.zoomScale -= 0.1;
          } else {
            this.zoomScale += 0.1;
          }
          this.zoomScale = Math.min(Math.max(this.zoomScale, 0.2), 20);
          this.zoom(this.zoomScale);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", () => {
      this.resize();
      return false;
    });
  }

  private mousedownHandle(e: Event): void {
    const element = e.target as HTMLElement;
    const nodeid = this.view.getBindedNodeId(element);
    if (nodeid) {
      if (findMcnode(element)) {
        const theNode = this.mind.getNodeById(nodeid);
        return this.selectNode(theNode);
      }
    } else {
      this.selectClear();
    }
  }

  private clickHandle(e: Event): boolean {
    const element = e.target as HTMLElement;
    switch (element.tagName.toLowerCase()) {
      case "mcadder": {
        const nodeid = this.view.getBindedNodeId(element);
        if (nodeid) {
          const theNode = this.mind.getNodeById(nodeid);
          if (!theNode) {
            throw new Error("the node[id=" + nodeid + "] can not be found.");
          } else {
            console.log(`element: ${element.tagName.toLowerCase()}`);
            const nodeid = generateNewId();
            const node = this.addNode(theNode, nodeid, "New Node");
            if (node) {
              this.selectNode(node);

              this.checkEditable();
              this.view.editNodeBegin(node);
            }
          }
        }
        return false;
      }
    }
    return true;
  }

  dblclickHandle(e: Event): boolean {
    this.checkEditable();
    e.preventDefault();
    e.stopPropagation();

    const element = e.target as HTMLElement;
    const nodeid = this.view.getBindedNodeId(element);
    if (nodeid) {
      const theNode = this.mind.getNodeById(nodeid);
      if (theNode.data.view.element!.contentEditable == "true") {
        // The node is already in the editing mode.
        return false;
      }

      if (!theNode) {
        throw new Error(`the node[id=${nodeid}] can not be found.`);
      }

      this.view.editNodeBegin(theNode);

      return false;
    }
    return true;
  }

  zoom(n: number): void {
    console.log(`set zoom scale to ${n}`);
    this.view.mindCheeseInnerElement.style.transform = `scale(${n})`;
  }

  private showMind(mind: Mind): void {
    this.view.reset();

    this.mind = mind;

    this.view.createNodes();
    this.view.cacheNodeSize();
    this.view.renderAgain();
    this.view.centerRoot();
  }

  // nodeTree = object representation of the mindmap.
  showNodeTree(nodeTree: any): void {
    this.showMind(object2mindmap(nodeTree));
  }

  showMarkdown(body: string): void {
    this.showMind(markdown2mindmap(body));
  }

  getMarkdown(): string {
    return mindmap2markdown(this.mind);
  }

  getNodeTree(): Record<string, any> {
    return this.mind.root!.toObject();
  }

  addNode(parentNode: MindNode, nodeid: string, topic: string): MindNode {
    this.checkEditable();

    this.undoManager.recordSnapshot();
    parentNode.data.view.adder!.style.display = "none";
    const node = this.mind.addNode(parentNode, nodeid, topic, null, null);
    if (node) {
      this.view.addNode(node);
      this.view.renderAgain();
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
    this.view.renderAgain();
    return node;
  }

  removeNode(node: MindNode): boolean {
    this.checkEditable();

    if (node.isroot) {
      throw new Error("fail, cannot remove root node");
    }

    const nodeid = node.id;
    const parentNode = node.parent!;
    this.undoManager.recordSnapshot();
    const nextSelectedNode = MindCheese.findUpperBrotherOrParentNode(
      parentNode,
      nodeid
    );

    const scrollSnapshot = this.view.saveScroll(node);
    this.view.removeNode(node);
    this.mind.removeNode(node);
    this.view.renderAgain();
    if (parentNode.children.length > 0) {
      this.mind.selected = nextSelectedNode;
      this.view.selectNode(nextSelectedNode);
    }
    this.view.restoreScroll(parentNode, scrollSnapshot);

    return true;
  }

  private static findUpperBrotherOrParentNode(
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

    if (!topic || topic.replace(/\s*/, "").length == 0) {
      throw new Error("fail, topic can not be empty");
    }

    const node = this.mind.getNodeById(nodeid)!;

    this.undoManager.recordSnapshot();
    if (node.topic === topic) {
      console.info("nothing changed");
      this.view.updateNode(node);
      return;
    }
    node.topic = topic;
    this.view.updateNode(node);
    this.view.renderAgain();
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
    this.view.renderAgain();
  }

  selectNode(node: MindNode): void {
    this.mind.selected = node;
    this.view.selectNode(node);
  }

  getSelectedNode(): MindNode | null {
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

    if (node.parent!.isroot) {
      const children = node.parent!.children.filter(
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

    if (node.parent!.isroot) {
      const children = node.parent!.children.filter(
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
      this.moveNode(node, upNode.id, node.parent!, node.direction);
    }
  }

  moveDown(node: MindNode) {
    const children = node.parent!.children.filter(
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
          this.moveNode(node, BEFOREID_LAST, node.parent!, node.direction);
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
          this.moveNode(node, children[i + 2].id, node.parent!, node.direction);
          console.log(this.mind);
          return;
        }
      }
    }
  }
}
