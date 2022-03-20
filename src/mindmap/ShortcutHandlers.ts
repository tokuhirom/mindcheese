import MindCheese from "./MindCheese";
import { Direction } from "./MindmapConstants";

export default class ShortcutHandlers {
  static delete(_jm: MindCheese): boolean {
    const selectedNode = _jm.getSelectedNode();
    if (!!selectedNode && !selectedNode.isroot) {
      _jm.selectNode(selectedNode.parent);
      _jm.removeNode(selectedNode);
    }
    return false;
  }

  static addChild(_jm: MindCheese): boolean {
    const selectedNode = _jm.getSelectedNode();
    if (selectedNode) {
      const nodeid = _jm.generateNewId();
      const node = _jm.addNode(selectedNode, nodeid, "New Node");
      if (node) {
        _jm.selectNode(node);
        _jm.beginEdit(node);
      }
    }
    return false;
  }

  static addBrother(jm: MindCheese, e: Event): boolean {
    e.preventDefault();

    const selectedNode = jm.getSelectedNode();
    if (!!selectedNode && !selectedNode.isroot) {
      const nodeid = jm.generateNewId();
      const node = jm.insertNodeAfter(selectedNode, nodeid, "New Node");
      if (node) {
        jm.selectNode(node);
        jm.beginEdit(node);
      }
    }
    return false;
  }

  static editNode(jm: MindCheese): boolean {
    const selectedNode = jm.getSelectedNode();
    if (selectedNode) {
      jm.beginEdit(selectedNode);
    }
    return false;
  }

  static toggle(jm: MindCheese, e: Event): boolean {
    const selectedNode = jm.getSelectedNode();
    if (selectedNode) {
      jm.toggleNode(selectedNode);
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static moveUp(jm: MindCheese): boolean {
    console.debug(`ShortcutProvider.handle_move_up`);
    const selectedNode = jm.getSelectedNode();
    if (selectedNode) {
      jm.moveUp(selectedNode);
      jm.selectNode(selectedNode);
    }
    return false;
  }

  static moveDown(jm: MindCheese): boolean {
    const selectedNode = jm.getSelectedNode();
    if (selectedNode) {
      jm.moveDown(selectedNode);
      jm.selectNode(selectedNode);
    }
    return false;
  }

  static up(mindCheese: MindCheese, e: Event): boolean {
    const selectedNode = mindCheese.getSelectedNode();
    if (selectedNode.isroot) {
      return false;
    }

    if (selectedNode) {
      let upNode = mindCheese.findNodeBefore(selectedNode);
      if (!upNode) {
        const np = mindCheese.findNodeBefore(selectedNode.parent);
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
    if (selectedNode.isroot) {
      return false;
    }

    if (selectedNode) {
      let downNode = mindCheese.findNodeAfter(selectedNode);
      if (!downNode) {
        const np = mindCheese.findNodeAfter(selectedNode.parent);
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

  static left(jm: MindCheese, e: Event): boolean {
    ShortcutHandlers.handleDirection(jm, e, Direction.LEFT);
    return false;
  }

  static right(jm: MindCheese, e: Event): boolean {
    ShortcutHandlers.handleDirection(jm, e, Direction.RIGHT);
    return false;
  }

  private static handleDirection(jm: MindCheese, e: Event, d: Direction): void {
    let children;
    const selectedNode = jm.getSelectedNode();
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
        jm.selectNode(node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  static undo(jm: MindCheese, e: KeyboardEvent) {
    console.log("UNDO!");
    jm.undo();
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}
