// noinspection JSUnfilteredForInLoop

import { Direction, EventType } from "./MindmapConstants";

import MindNode from "./MindNode";
import MindCheese from "./MindCheese";
import EventRouter from "./EventRouter";

export class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  readonly x: number;
  readonly y: number;
}

export default class LayoutProvider {
  private readonly jm: MindCheese;
  bounds: { n: number; s: number; w: number; e: number };
  private readonly _hspace: number;
  private readonly _vspace: number;
  private readonly _pspace: number;
  private readonly _eventRouter: EventRouter;

  constructor(
    jm: MindCheese,
    eventRouter: EventRouter,
    hspace = 30,
    vspace = 20,
    pspace = 13
  ) {
    this._eventRouter = eventRouter;
    this._hspace = hspace;
    this._vspace = vspace;
    this._pspace = pspace;
    this.jm = jm;
    this.bounds = null;
  }

  init(): void {
    // TODO remove this
    console.debug("layout.init");
  }

  reset(): void {
    console.debug("layout.reset");
    this.bounds = { n: 0, s: 0, w: 0, e: 0 };
  }

  layout(): void {
    console.debug("layout.layout");
    this.layout_direction();
    this.layout_offset();
  }

  layout_direction(): void {
    this._layout_direction_root();
  }

  _layout_direction_root(): void {
    const node = this.jm.mind.root;

    // console.debug(node);
    const layout_data = node._data.layout;
    const children = node.children;
    const children_count = children.length;
    layout_data.direction = Direction.CENTER;

    let i = children_count;
    let subnode = null;
    while (i--) {
      subnode = children[i];
      if (subnode.direction == Direction.LEFT) {
        this._layout_direction_side(subnode, Direction.LEFT);
      } else {
        this._layout_direction_side(subnode, Direction.RIGHT);
      }
    }
  }

  private _layout_direction_side(node: MindNode, direction: Direction): void {
    const layout_data = node._data.layout;
    const children = node.children;
    const children_count = children.length;

    layout_data.direction = direction;
    let i = children_count;
    while (i--) {
      this._layout_direction_side(children[i], direction);
    }
  }

  layout_offset(): void {
    const node = this.jm.mind.root;
    const layout_data = node._data.layout;
    layout_data.offset_x = 0;
    layout_data.offset_y = 0;
    layout_data.outer_height = 0;
    const children = node.children;
    let i = children.length;
    const left_nodes = [];
    const right_nodes = [];
    let subnode = null;
    while (i--) {
      subnode = children[i];
      if (subnode._data.layout.direction == Direction.RIGHT) {
        right_nodes.unshift(subnode);
      } else {
        left_nodes.unshift(subnode);
      }
    }
    layout_data.left_nodes = left_nodes;
    layout_data.right_nodes = right_nodes;
    layout_data.outer_height_left = this._layout_offset_subnodes(left_nodes);
    layout_data.outer_height_right = this._layout_offset_subnodes(right_nodes);
    this.bounds.e = node._data.view.width / 2;
    this.bounds.w = 0 - this.bounds.e;
    //console.debug(this.bounds.w);
    this.bounds.n = 0;
    this.bounds.s = Math.max(
      layout_data.outer_height_left,
      layout_data.outer_height_right
    );
  }

  // layout both the x and y axis
  _layout_offset_subnodes(nodes: MindNode[]): number {
    let total_height = 0;
    const nodes_count = nodes.length;
    let i = nodes_count;
    let node = null;
    let node_outer_height = 0;
    let layout_data = null;
    let base_y = 0;
    let pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layout_data = node._data.layout;
      if (pd == null) {
        pd = node.parent._data;
        if (pd == null) {
          throw new Error("Cannot get parent's data");
        }
      }

      node_outer_height = this._layout_offset_subnodes(node.children);
      if (!node.expanded) {
        node_outer_height = 0;
        this.set_visible(node.children, false);
      }
      node_outer_height = Math.max(node._data.view.height, node_outer_height);

      layout_data.outer_height = node_outer_height;
      layout_data.offset_y = base_y - node_outer_height / 2;
      layout_data.offset_x =
        this._hspace * layout_data.direction +
        (pd.view.width * (pd.layout.direction + layout_data.direction)) / 2;
      if (!node.parent.isroot) {
        layout_data.offset_x += this._pspace * layout_data.direction;
      }

      base_y = base_y - node_outer_height - this._vspace;
      total_height += node_outer_height;
    }
    if (nodes_count > 1) {
      total_height += this._vspace * (nodes_count - 1);
    }
    i = nodes_count;
    const middle_height = total_height / 2;
    while (i--) {
      node = nodes[i];
      node._data.layout.offset_y += middle_height;
    }
    return total_height;
  }

  // layout the y axis only, for collapse/expand a node
  _layout_offset_subnodes_height(nodes: MindNode[]): number {
    let total_height = 0;
    const nodes_count = nodes.length;
    let i = nodes_count;
    let node = null;
    let node_outer_height = 0;
    let layout_data = null;
    let base_y = 0;
    let pd = null; // parent._data
    while (i--) {
      node = nodes[i];
      layout_data = node._data.layout;
      if (pd == null) {
        pd = node.parent._data;
      }

      node_outer_height = this._layout_offset_subnodes_height(node.children);
      if (!node.expanded) {
        node_outer_height = 0;
      }
      node_outer_height = Math.max(node._data.view.height, node_outer_height);

      layout_data.outer_height = node_outer_height;
      layout_data.offset_y = base_y - node_outer_height / 2;
      base_y = base_y - node_outer_height - this._vspace;
      total_height += node_outer_height;
    }
    if (nodes_count > 1) {
      total_height += this._vspace * (nodes_count - 1);
    }
    i = nodes_count;
    const middle_height = total_height / 2;
    while (i--) {
      node = nodes[i];
      node._data.layout.offset_y += middle_height;
      //console.debug(node.topic);
      //console.debug(node._data.layout.offset_y);
    }
    return total_height;
  }

  getNodeOffset(node: MindNode): Point {
    const layout_data = node._data.layout;

    let x = layout_data.offset_x;
    let y = layout_data.offset_y;
    if (!node.isroot) {
      const offset_p = this.getNodeOffset(node.parent);
      x += offset_p.x;
      y += offset_p.y;
    }

    return new Point(x, y);
  }

  get_node_point(node: MindNode): Point {
    const view_data = node._data.view;
    const offset_p = this.getNodeOffset(node);
    const x =
      offset_p.x + (view_data.width * (node._data.layout.direction - 1)) / 2;
    const y = offset_p.y - view_data.height / 2;
    return new Point(x, y);
  }

  get_node_point_in(node: MindNode): Point {
    return this.getNodeOffset(node);
  }

  getNodePointOut(node: MindNode): Point {
    if (node.isroot) {
      return new Point(0, 0);
    } else {
      const offset_p = this.getNodeOffset(node);
      const x =
        offset_p.x +
        (node._data.view.width + this._pspace) * node._data.layout.direction;
      return new Point(x, offset_p.y);
    }
  }

  get_expander_point(node: MindNode): Point {
    const p = this.getNodePointOut(node);
    let x: number;
    if (node._data.layout.direction == Direction.RIGHT) {
      x = p.x - this._pspace;
    } else {
      x = p.x;
    }
    const y = p.y - Math.ceil(this._pspace / 2);
    return new Point(x, y);
  }

  get_min_size(): { w: number; h: number } {
    const nodes = this.jm.mind.nodes;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      const pout = this.getNodePointOut(node);
      // e = Math.max(x, e)
      if (pout.x > this.bounds.e) {
        this.bounds.e = pout.x;
      }
      // w = Math.min(x, w)
      if (pout.x < this.bounds.w) {
        this.bounds.w = pout.x;
      }
    }
    return {
      w: this.bounds.e - this.bounds.w,
      h: this.bounds.s - this.bounds.n,
    };
  }

  toggle_node(node: MindNode): void {
    if (node.isroot) {
      return;
    }
    if (node.expanded) {
      this.collapse_node(node);
    } else {
      this.expand_node(node);
    }
  }

  expand_node(node: MindNode): void {
    node.expanded = true;
    this.part_layout(node);
    this.set_visible(node.children, true);
    this._eventRouter.invokeEventHandler(EventType.SHOW, {
      evt: "expand_node",
      data: [],
      node: node.id,
    });
  }

  collapse_node(node: MindNode): void {
    node.expanded = false;
    this.part_layout(node);
    this.set_visible(node.children, false);
    this._eventRouter.invokeEventHandler(EventType.SHOW, {
      evt: "collapse_node",
      data: [],
      node: node.id,
    });
  }

  expand_all(): void {
    const nodes = this.jm.mind.nodes;
    let c = 0;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      if (!node.expanded) {
        node.expanded = true;
        c++;
      }
    }
    if (c > 0) {
      const root = this.jm.mind.root;
      this.part_layout(root);
      this.set_visible(root.children, true);
    }
  }

  collapse_all(): void {
    const nodes = this.jm.mind.nodes;
    let c = 0;
    let node;
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      if (node.expanded && !node.isroot) {
        node.expanded = false;
        c++;
      }
    }
    if (c > 0) {
      const root = this.jm.mind.root;
      this.part_layout(root);
      this.set_visible(root.children, true);
    }
  }

  expand_to_depth(
    target_depth: number,
    curr_nodes: MindNode[],
    curr_depth: number
  ): void {
    if (target_depth < 1) {
      return;
    }
    const nodes = curr_nodes || this.jm.mind.root.children;
    const depth = curr_depth || 1;
    let i = nodes.length;
    let node = null;
    while (i--) {
      node = nodes[i];
      if (depth < target_depth) {
        if (!node.expanded) {
          this.expand_node(node);
        }
        this.expand_to_depth(target_depth, node.children, depth + 1);
      }
      if (depth == target_depth) {
        if (node.expanded) {
          this.collapse_node(node);
        }
      }
    }
  }

  part_layout(node: MindNode): void {
    const root = this.jm.mind.root;
    if (root) {
      const root_layout_data = root._data.layout;
      if (node.isroot) {
        root_layout_data.outer_height_right = this._layout_offset_subnodes_height(
          root_layout_data.right_nodes
        );
        root_layout_data.outer_height_left = this._layout_offset_subnodes_height(
          root_layout_data.left_nodes
        );
      } else {
        if (node._data.layout.direction == Direction.RIGHT) {
          root_layout_data.outer_height_right = this._layout_offset_subnodes_height(
            root_layout_data.right_nodes
          );
        } else {
          root_layout_data.outer_height_left = this._layout_offset_subnodes_height(
            root_layout_data.left_nodes
          );
        }
      }
      this.bounds.s = Math.max(
        root_layout_data.outer_height_left,
        root_layout_data.outer_height_right
      );
    } else {
      console.warn("can not found root node");
    }
  }

  set_visible(nodes: MindNode[], visible: boolean): void {
    let i = nodes.length;
    let node = null;
    while (i--) {
      node = nodes[i];
      if (node.expanded) {
        this.set_visible(node.children, visible);
      } else {
        this.set_visible(node.children, false);
      }
      if (!node.isroot) {
        node._data.layout.visible = visible;
      }
    }
  }

  is_visible(node: MindNode): boolean {
    const layout_data = node._data.layout;
    return !("visible" in layout_data && !layout_data.visible);
  }
}
