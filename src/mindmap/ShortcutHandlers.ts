import JsMind from "./JsMind";
import { Direction } from "./MindmapConstants";

export default class ShortcutHandlers {
  static delete(_jm: JsMind): boolean {
    const selected_node = _jm.get_selected_node();
    if (!!selected_node && !selected_node.isroot) {
      _jm.select_node(selected_node.parent);
      _jm.remove_node(selected_node);
    }
    return false;
  }

  static addChild(_jm: JsMind): boolean {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      const nodeid = _jm.generate_new_id();
      const node = _jm.add_node(selected_node, nodeid, "New Node", null);
      if (node) {
        _jm.select_node(node);
        _jm.begin_edit(node);
      }
    }
    return false;
  }

  static addBrother(jm: JsMind, e: Event): boolean {
    e.preventDefault();

    const selected_node = jm.get_selected_node();
    if (!!selected_node && !selected_node.isroot) {
      const nodeid = jm.generate_new_id();
      const node = jm.insert_node_after(
        selected_node,
        nodeid,
        "New Node",
        null
      );
      if (node) {
        jm.select_node(node);
        jm.begin_edit(node);
      }
    }
    return false;
  }

  static editNode(jm: JsMind): boolean {
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      jm.begin_edit(selected_node);
    }
    return false;
  }

  static toggle(jm: JsMind, e: Event): boolean {
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      jm.toggle_node(selected_node);
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static moveUp(jm: JsMind): boolean {
    console.debug(`ShortcutProvider.handle_move_up`);
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      jm.move_up(selected_node);
    }
    return false;
  }

  static moveDown(jm: JsMind): boolean {
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      jm.move_down(selected_node);
    }
    return false;
  }

  static up(jm: JsMind, e: Event): boolean {
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      let up_node = jm.find_node_before(selected_node);
      if (!up_node && selected_node.parent) {
        const np = jm.find_node_before(selected_node.parent);
        if (!!np && np.children.length > 0) {
          up_node = np.children[np.children.length - 1];
        }
      }
      if (up_node) {
        jm.select_node(up_node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static down(jm: JsMind, e: Event): boolean {
    const selected_node = jm.get_selected_node();
    if (selected_node) {
      let down_node = jm.find_node_after(selected_node);
      if (!down_node && selected_node.parent) {
        const np = jm.find_node_after(selected_node.parent);
        if (!!np && np.children.length > 0) {
          down_node = np.children[0];
        }
      }
      if (down_node) {
        jm.select_node(down_node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
    return false;
  }

  static left(jm: JsMind, e: Event): boolean {
    ShortcutHandlers._handle_direction(jm, e, Direction.LEFT);
    return false;
  }

  static right(jm: JsMind, e: Event): boolean {
    ShortcutHandlers._handle_direction(jm, e, Direction.RIGHT);
    return false;
  }

  static _handle_direction(jm: JsMind, e: Event, d: Direction): void {
    let children;
    const selected_node = jm.get_selected_node();
    let node = null;
    if (selected_node) {
      if (selected_node.isroot) {
        const c = selected_node.children;
        children = [];
        for (let i = 0; i < c.length; i++) {
          if (c[i].direction === d) {
            children.push(i);
          }
        }
        node = c[children[Math.floor((children.length - 1) / 2)]];
      } else if (selected_node.direction === d) {
        children = selected_node.children;
        const childrenCount = children.length;
        if (childrenCount > 0) {
          node = children[Math.floor((childrenCount - 1) / 2)];
        }
      } else {
        node = selected_node.parent;
      }
      if (node) {
        jm.select_node(node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  static undo(jm: JsMind, e: KeyboardEvent) {
    console.log("UNDO!");
    jm.undo();
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}
