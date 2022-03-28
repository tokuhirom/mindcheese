import { MindCheese } from "./MindCheese";
import { Direction } from "./MindmapConstants";
import { generateNewId } from "./utils/RandomID";

export default class ShortcutHandlers {
  static delete(mindCheese: MindCheese): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (!!selectedNode && !selectedNode.isroot) {
      mindCheese.selectNode(selectedNode.parent!);
      mindCheese.removeNode(selectedNode);
    }
    return false;
  }

  static addChild(mindCheese: MindCheese): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode) {
      const nodeid = generateNewId();
      const node = mindCheese.addNode(selectedNode, nodeid, "New Node");
      if (node) {
        mindCheese.selectNode(node);
        mindCheese.checkEditable();

        mindCheese.view.editNodeBegin(node);
      }
    }
    return false;
  }

  static addBrother(mindCheese: MindCheese, e: Event): boolean {
    e.preventDefault();

    const selectedNode = mindCheese.getSelectedNode();
    if (!!selectedNode && !selectedNode.isroot) {
      const nodeid = generateNewId();
      const node = mindCheese.insertNodeAfter(selectedNode, nodeid, "New Node");
      if (node) {
        mindCheese.selectNode(node);
        mindCheese.checkEditable();

        mindCheese.view.editNodeBegin(node);
      }
    }
    return false;
  }

  static editNode(mindCheese: MindCheese): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode) {
      mindCheese.checkEditable();

      mindCheese.view.editNodeBegin(selectedNode);
    }
    return false;
  }

  static moveUp(mindCheese: MindCheese): boolean {
    console.debug(`ShortcutProvider.handle_move_up`);
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode) {
      mindCheese.moveUp(selectedNode);
      mindCheese.selectNode(selectedNode);
    }
    return false;
  }

  static moveDown(mindCheese: MindCheese): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode) {
      mindCheese.moveDown(selectedNode);
      mindCheese.selectNode(selectedNode);
    }
    return false;
  }

  static up(mindCheese: MindCheese, e: Event): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode!.isroot) {
      return false;
    }

    if (selectedNode) {
      let upNode = mindCheese.findNodeBefore(selectedNode);
      if (!upNode) {
        const np = mindCheese.findNodeBefore(selectedNode.parent!);
        if (!!np && np.children.length > 0) {
          upNode = np.children[np.children.length - 1];
        }
      }
      if (upNode) {
        mindCheese.selectNode(upNode);
      }
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static down(mindCheese: MindCheese, e: Event): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode!.isroot) {
      return false;
    }

    if (selectedNode) {
      let downNode = mindCheese.findNodeAfter(selectedNode);
      if (!downNode) {
        const np = mindCheese.findNodeAfter(selectedNode.parent!);
        if (!!np && np.children.length > 0) {
          downNode = np.children[0];
        }
      }
      if (downNode) {
        mindCheese.selectNode(downNode);
      }
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static left(mindCheese: MindCheese, e: Event): boolean {
    ShortcutHandlers.handleDirection(mindCheese, e, Direction.LEFT);
    return false;
  }

  static right(mindCheese: MindCheese, e: Event): boolean {
    ShortcutHandlers.handleDirection(mindCheese, e, Direction.RIGHT);
    return false;
  }

  private static handleDirection(
    mindCheese: MindCheese,
    e: Event,
    d: Direction
  ): void {
    let children; // TODO maybe optimizable
    const selectedNode = mindCheese.getSelectedNode();
    let node = null;
    if (selectedNode) {
      if (selectedNode.isroot) {
        const c = selectedNode.children;
        children = [];
        for (let i = 0; i < c.length; i++) {
          if (c[i].direction === d) {
            children.push(i);
          }
        }
        node = c[children[Math.floor((children.length - 1) / 2)]];
      } else if (selectedNode.direction === d) {
        children = selectedNode.children;
        const childrenCount = children.length;
        if (childrenCount > 0) {
          node = children[Math.floor((childrenCount - 1) / 2)];
        }
      } else {
        node = selectedNode.parent;
      }
      if (node) {
        mindCheese.selectNode(node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  static undo(mindCheese: MindCheese, e: KeyboardEvent) {
    console.log("UNDO!");
    mindCheese.undo();
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}
