import {Direction, EventType} from "./MindmapConstants";

const jm = {
  direction: {
    left: -1,
    center: 0,
    right: 1,
  },
  event_type: { show: 1, resize: 2, edit: 3, select: 4 },
};

import MindNode from "./MindNode";
import JsMind from "./JsMind";

export default class LayoutProvider {
  private readonly jm: JsMind;
  private readonly isside: boolean;
  bounds: { n: number; s: number; w: number; e: number };
  private cache_valid: boolean;
  private readonly _hspace: number;
  private readonly _vspace: number;
  private readonly _pspace: number;

  constructor(jm: JsMind,
              mode: string='full' /* 'full' or 'side' */,
              hspace: number=30,
              vspace: number=20,
              pspace: number=13) {
    this._hspace = hspace;
    this._vspace = vspace;
    this._pspace = pspace;
    this.jm = jm;
    this.isside = mode == "side";
    this.bounds = null;
    this.cache_valid = false;
  }

  init() {
    // TODO remove this
    console.debug("layout.init");
  }

  reset() {
    console.debug("layout.reset");
    this.bounds = { n: 0, s: 0, w: 0, e: 0 };
  }

  layout() {
    console.debug("layout.layout");
    this.layout_direction();
    this.layout_offset();
  }

  layout_direction() {
    this._layout_direction_root();
  }

  _layout_direction_root() {
    const node = this.jm.mind.root;
    // console.debug(node);
    let layout_data;
    if ("layout" in node._data) {
      layout_data = node._data.layout;
    } else {
      layout_data = {};
      node._data.layout = layout_data;
    }
    const children = node.children;
    const children_count = children.length;
    layout_data.direction = jm.direction.center;
    layout_data.side_index = 0;
    if (this.isside) {
      let i = children_count;
      while (i--) {
        this._layout_direction_side(children[i], jm.direction.right, i);
      }
    } else {
      let i = children_count;
      let subnode = null;
      while (i--) {
        subnode = children[i];
        if (subnode.direction == jm.direction.left) {
          this._layout_direction_side(subnode, jm.direction.left, i);
        } else {
          this._layout_direction_side(subnode, jm.direction.right, i);
        }
      }
      /*
              var boundary = Math.ceil(children_count/2);
              var i = children_count;
              while(i--){
                  if(i>=boundary){
                      this._layout_direction_side(children[i],jm.direction.left, children_count-i-1);
                  }else{
                      this._layout_direction_side(children[i],jm.direction.right, i);
                  }
              }*/
    }
  }

  _layout_direction_side(node: MindNode, direction: Direction, side_index: number) {
    let layout_data = null;
    if ("layout" in node._data) {
      layout_data = node._data.layout;
    } else {
      layout_data = {};
      node._data.layout = layout_data;
    }
    const children = node.children;
    const children_count = children.length;

    layout_data.direction = direction;
    layout_data.side_index = side_index;
    let i = children_count;
    while (i--) {
      this._layout_direction_side(children[i], direction, i);
    }
  }

  layout_offset() {
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
      if (subnode._data.layout.direction == jm.direction.right) {
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
  _layout_offset_subnodes(nodes: MindNode[]) {
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
  _layout_offset_subnodes_height(nodes: MindNode[]) {
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

  get_node_offset(node: MindNode) : {x: number, y: number} {
    const layout_data = node._data.layout;
    let offset_cache = null;
    if ("_offset_" in layout_data && this.cache_valid) {
      offset_cache = layout_data._offset_;
    } else {
      offset_cache = { x: -1, y: -1 };
      layout_data._offset_ = offset_cache;
    }
    if (offset_cache.x == -1 || offset_cache.y == -1) {
      let x = layout_data.offset_x;
      let y = layout_data.offset_y;
      if (!node.isroot) {
        const offset_p = this.get_node_offset(node.parent);
        x += offset_p.x;
        y += offset_p.y;
      }
      offset_cache.x = x;
      offset_cache.y = y;
    }
    return offset_cache;
  }

  get_node_point(node: MindNode) : {x: number, y: number} {
    const view_data = node._data.view;
    const offset_p = this.get_node_offset(node);
    //console.debug(offset_p);
    const p: any = {};
    p.x =
      offset_p.x + (view_data.width * (node._data.layout.direction - 1)) / 2;
    p.y = offset_p.y - view_data.height / 2;
    //console.debug(p);
    return p;
  }

  get_node_point_in(node: MindNode) {
    return this.get_node_offset(node);
  }

  get_node_point_out(node: MindNode) {
    const layout_data = node._data.layout;
    let pout_cache = null;
    if ("_pout_" in layout_data && this.cache_valid) {
      pout_cache = layout_data._pout_;
    } else {
      pout_cache = { x: -1, y: -1 };
      layout_data._pout_ = pout_cache;
    }
    if (pout_cache.x == -1 || pout_cache.y == -1) {
      if (node.isroot) {
        pout_cache.x = 0;
        pout_cache.y = 0;
      } else {
        const view_data = node._data.view;
        const offset_p = this.get_node_offset(node);
        pout_cache.x =
          offset_p.x +
          (view_data.width + this._pspace) * node._data.layout.direction;
        pout_cache.y = offset_p.y;
        //console.debug('pout');
        //console.debug(pout_cache);
      }
    }
    return pout_cache;
  }

  get_expander_point(node: MindNode) {
    const p = this.get_node_point_out(node);
    const ex_p: any = {};
    if (node._data.layout.direction == jm.direction.right) {
      ex_p.x = p.x - this._pspace;
    } else {
      ex_p.x = p.x;
    }
    ex_p.y = p.y - Math.ceil(this._pspace / 2);
    return ex_p;
  }

  get_min_size() {
    const nodes = this.jm.mind.nodes;
    let pout = null;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      pout = this.get_node_point_out(node);
      if (pout.x > this.bounds.e) {
        this.bounds.e = pout.x;
      }
      if (pout.x < this.bounds.w) {
        this.bounds.w = pout.x;
      }
    }
    return {
      w: this.bounds.e - this.bounds.w,
      h: this.bounds.s - this.bounds.n,
    };
  }

  toggle_node(node: MindNode) {
    if (node.isroot) {
      return;
    }
    if (node.expanded) {
      this.collapse_node(node);
    } else {
      this.expand_node(node);
    }
  }

  expand_node(node: MindNode) {
    node.expanded = true;
    this.part_layout(node);
    this.set_visible(node.children, true);
    this.jm.invoke_event_handle(EventType.SHOW, {
      evt: "expand_node",
      data: [],
      node: node.id,
    });
  }

  collapse_node(node: MindNode) {
    node.expanded = false;
    this.part_layout(node);
    this.set_visible(node.children, false);
    this.jm.invoke_event_handle(EventType.SHOW, {
      evt: "collapse_node",
      data: [],
      node: node.id,
    });
  }

  expand_all() {
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

  collapse_all() {
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

  part_layout(node: MindNode) {
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
        if (node._data.layout.direction == jm.direction.right) {
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
      this.cache_valid = false;
    } else {
      console.warn("can not found root node");
    }
  }

  set_visible(nodes: MindNode[], visible: boolean) {
    let i = nodes.length;
    let node = null;
    let layout_data = null;
    while (i--) {
      node = nodes[i];
      layout_data = node._data.layout;
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

  is_expand(node: MindNode) {
    // TODO remove this method
    return node.expanded;
  }

  is_visible(node: MindNode) {
    const layout_data = node._data.layout;
    return !("visible" in layout_data && !layout_data.visible);
  }
}
