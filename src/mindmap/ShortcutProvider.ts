import { Direction } from "./MindmapConstants";
import JsMind from "./JsMind";

// Generate new ID of the node
function generateId(): string {
  return (
    new Date().getTime().toString(16) + Math.random().toString(16).substr(2)
  ).substr(2, 16);
}

export default class ShortcutProvider {
  private jm: JsMind;
  private mapping: Record<string, number>; // handlerName2keycode
  private handles: Record<string, (arg0: JsMind, arg1: Event) => void>;
  private _newid: () => string;
  private _mapping: Record<number, (arg0: JsMind, arg1: Event) => void>; // number2callback
  private enable: boolean;

  constructor(
    jm: JsMind,
    enable: boolean,
    mapping: Record<string, number>,
    handles: Record<string, (arg0: JsMind, arg1: Event) => void>,
    newid: () => string = generateId
  ) {
    this.jm = jm;
    this.enable = enable;
    this.mapping = mapping;
    this.handles = handles;
    this._newid = newid;
    this._mapping = {};
  }

  init() {
    // TODO do not hook to the global object.
    // this.jm.options.container.addEventListener('keydown',
    //     this.handler.bind(this))
    document.addEventListener("keydown", this.handler.bind(this));

    this.handles["addchild"] = this.handle_addchild;
    this.handles["addbrother"] = this.handle_addbrother;
    this.handles["editnode"] = this.handle_editnode;
    this.handles["delnode"] = this.handle_delnode;
    this.handles["toggle"] = this.handle_toggle;
    this.handles["up"] = this.handle_up;
    this.handles["down"] = this.handle_down;
    this.handles["left"] = this.handle_left;
    this.handles["right"] = this.handle_right;

    for (const handle in this.mapping) {
      if (!!this.mapping[handle] && handle in this.handles) {
        this._mapping[this.mapping[handle]] = this.handles[handle];
      }
    }
  }

  enable_shortcut(): void {
    this.enable = true;
  }

  disable_shortcut(): void {
    this.enable = false;
  }

  handler(e: KeyboardEvent): boolean {
    if (e.which == 9) {
      e.preventDefault();
    } //prevent tab to change focus in browser
    if (this.jm.view.is_editing()) {
      return;
    }
    if (!this.enable) {
      return true;
    }
    const kc =
      e.keyCode +
      ((e.metaKey ? 1 : 0) << 13) +
      ((e.ctrlKey ? 1 : 0) << 12) +
      ((e.altKey ? 1 : 0) << 11) +
      ((e.shiftKey ? 1 : 0) << 10);
    if (kc in this._mapping) {
      const container = this.jm.options.container as HTMLElement;
      const isConnected = container.isConnected;
      // offsetParent=${container.offsetParent}
      // VISIBILITY=${getComputedStyle(container).visibility}
      //     TOP=${getComputedStyle(container).top}

      // TODO this.jm is redundant handler.
      if (isConnected) {
        console.log(`Invoking shortcut handler: TIMESTAMP=${this.jm.mind.timestamp}  ID=${this.jm.mind.id}/${this.jm.id} connected=${isConnected}
      target=${e.target}
      `);
        this._mapping[kc].call(this, this.jm, e);
      }
    }
  }

  handle_addchild(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      const nodeid = this._newid();
      const node = _jm.add_node(selected_node, nodeid, "New Node", null);
      if (node) {
        _jm.select_node(node);
        _jm.begin_edit(node);
      }
    }
  }

  handle_addbrother(jm: JsMind, e: Event): void {
    const selected_node = jm.get_selected_node();
    if (!!selected_node && !selected_node.isroot) {
      const nodeid = this._newid();
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
  }

  handle_editnode(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      _jm.begin_edit(selected_node);
    }
  }

  handle_delnode(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (!!selected_node && !selected_node.isroot) {
      _jm.select_node(selected_node.parent);
      _jm.remove_node(selected_node);
    }
  }

  handle_toggle(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      _jm.toggle_node(selected_node.id);
      e.stopPropagation();
      e.preventDefault();
    }
  }

  handle_up(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      let up_node = _jm.find_node_before(selected_node);
      if (!up_node) {
        const np = _jm.find_node_before(selected_node.parent);
        if (!!np && np.children.length > 0) {
          up_node = np.children[np.children.length - 1];
        }
      }
      if (up_node) {
        _jm.select_node(up_node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  handle_down(_jm: JsMind, e: Event): void {
    const selected_node = _jm.get_selected_node();
    if (selected_node) {
      let down_node = _jm.find_node_after(selected_node);
      if (!down_node) {
        const np = _jm.find_node_after(selected_node.parent);
        if (!!np && np.children.length > 0) {
          down_node = np.children[0];
        }
      }
      if (down_node) {
        _jm.select_node(down_node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  handle_left(_jm: JsMind, e: Event): void {
    this._handle_direction(_jm, e, Direction.LEFT);
  }

  handle_right(_jm: JsMind, e: Event): void {
    this._handle_direction(_jm, e, Direction.RIGHT);
  }

  _handle_direction(_jm: JsMind, e: Event, d: Direction): void {
    let children;
    const selected_node = _jm.get_selected_node();
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
        const childrencount = children.length;
        if (childrencount > 0) {
          node = children[Math.floor((childrencount - 1) / 2)];
        }
      } else {
        node = selected_node.parent;
      }
      if (node) {
        _jm.select_node(node);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }
}
