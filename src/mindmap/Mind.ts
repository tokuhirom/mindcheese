// noinspection JSUnfilteredForInLoop

import MindNode from "./MindNode";
import { BEFOREID_FIRST, BEFOREID_LAST, Direction } from "./MindmapConstants";

export default class Mind {
  name: string;
  author: string;
  version: string;
  root: MindNode;
  selected: MindNode;
  nodes: Record<string, MindNode>;

  constructor() {
    this.name = null;
    this.author = null;
    this.version = null;
    this.root = null;
    this.selected = null;
    this.nodes = {};
  }

  getNodeById(nodeid: string): MindNode {
    if (nodeid in this.nodes) {
      return this.nodes[nodeid];
    } else {
      throw new Error(`the node[id=${nodeid}] can not be found...`);
    }
  }

  setRoot(nodeid: string, topic: string, data: any): void {
    if (this.root == null) {
      this.root = new MindNode(nodeid, 0, topic, data, true, null, null, true);
      this._putNode(this.root);
    } else {
      throw new Error("root node is already exist");
    }
  }

  add_node(
    parent_node: MindNode,
    nodeid: string,
    topic: string,
    data: any,
    idx: number,
    direction: Direction | null,
    expanded: boolean
  ): MindNode {
    const nodeindex: number = idx || -1;
    let node;
    if (typeof expanded === "undefined") {
      // TODO remove this
      expanded = true;
    }
    if (parent_node.isroot) {
      let d;
      if (direction == null) {
        const children = parent_node.children;
        const children_len = children.length;
        let r = 0;
        for (let i = 0; i < children_len; i++) {
          if (children[i].direction === Direction.LEFT) {
            r--;
          } else {
            r++;
          }
        }
        d = children_len > 1 && r > 0 ? Direction.LEFT : Direction.RIGHT;
      } else {
        d = direction === Direction.LEFT ? Direction.LEFT : Direction.RIGHT;
      }
      console.log(
        `add_node source DIRECTION=${direction} DIRECTION=${d} ${topic}`
      );
      node = new MindNode(
        nodeid,
        nodeindex,
        topic,
        data,
        false,
        parent_node,
        d,
        expanded
      );
    } else {
      node = new MindNode(
        nodeid,
        nodeindex,
        topic,
        data,
        false,
        parent_node,
        parent_node.direction,
        expanded
      );
    }

    this._putNode(node);
    parent_node.children.push(node);
    this._reindex(parent_node);

    return node;
  }

  insert_node_before(
    node_before: MindNode,
    nodeid: string,
    topic: string,
    data: any
  ): MindNode {
    const node_index = node_before.index - 0.5;
    return this.add_node(
      node_before.parent,
      nodeid,
      topic,
      data,
      node_index,
      null,
      true
    );
  }

  get_node_before(node: MindNode): MindNode {
    if (node.isroot) {
      return null;
    }

    const idx = node.index - 2;
    if (idx >= 0) {
      return node.parent.children[idx];
    } else {
      return null;
    }
  }

  // add little brother node.
  insert_node_after(
    node_after: MindNode,
    nodeid: string,
    topic: string,
    data: any
  ): MindNode {
    const node_index = node_after.index + 0.5;
    // follow current direction.
    return this.add_node(
      node_after.parent,
      nodeid,
      topic,
      data,
      node_index,
      node_after.direction,
      true
    );
  }

  get_node_after(node: MindNode): MindNode {
    if (node.isroot) {
      return null;
    }
    const idx = node.index;
    const brothers = node.parent.children;
    if (brothers.length >= idx) {
      return node.parent.children[idx];
    } else {
      return null;
    }
  }

  move_node(
    node: MindNode,
    beforeid: string,
    parentid: string,
    direction: Direction
  ): MindNode {
    console.assert(node instanceof MindNode, "node should be Node");
    console.log(`move_node: ${node} ${beforeid} ${parentid} ${direction}`);
    if (!parentid) {
      parentid = node.parent.id;
    }
    return this._move_node(node, beforeid, parentid, direction);
  }

  _flow_node_direction(node: MindNode, direction: Direction): void {
    if (typeof direction === "undefined") {
      direction = node.direction;
    } else {
      node.direction = direction;
    }
    let len = node.children.length;
    while (len--) {
      this._flow_node_direction(node.children[len], direction);
    }
  }

  _move_node_internal(node: MindNode, beforeid: string): MindNode {
    if (!!node && !!beforeid) {
      if (beforeid === BEFOREID_LAST) {
        node.index = -1;
        this._reindex(node.parent);
      } else if (beforeid === BEFOREID_FIRST) {
        node.index = 0;
        this._reindex(node.parent);
      } else {
        /*
         * Before:
         *   - B <- beforeid = 3
         *   - A <- node     = 4
         *
         * After:
         *   - A <- node     = 3-0.5=2.5
         *   - B <- beforeid = 3
         */
        const node_before = beforeid ? this.getNodeById(beforeid) : null;
        if (
          node_before != null &&
          node_before.parent != null &&
          node_before.parent.id === node.parent.id
        ) {
          node.index = node_before.index - 0.5;
          this._reindex(node.parent);
        } else {
          console.error(`Missing node_before: ${beforeid}`);
        }
      }
    }
    return node;
  }

  _move_node(
    node: MindNode,
    beforeid: string,
    parentid: string,
    direction: Direction
  ): MindNode {
    console.log(
      `_move_node: node=${node}, ${beforeid}, parentid=${parentid}, ${direction}`
    );
    if (!!node && !!parentid) {
      console.assert(node.parent, `node.parent is null: ${node}`);
      if (node.parent.id !== parentid) {
        console.log(`_move_node: node.parent.id!==parentid`);
        // remove from parent's children
        const sibling = node.parent.children;
        let si = sibling.length;
        while (si--) {
          console.assert(sibling[si], "sibling[si] is null");
          if (sibling[si].id === node.id) {
            sibling.splice(si, 1);
            break;
          }
        }
        node.parent = this.getNodeById(parentid);
        node.parent.children.push(node);
      }

      if (node.parent.isroot) {
        if (direction === Direction.LEFT) {
          node.direction = direction;
        } else {
          node.direction = Direction.RIGHT;
        }
      } else {
        node.direction = node.parent.direction;
      }
      this._move_node_internal(node, beforeid);
      this._flow_node_direction(node, direction);
    }
    return node;
  }

  removeNode(node: MindNode): boolean {
    if (node.isroot) {
      throw new Error("fail, can not remove root node");
    }
    if (this.selected != null && this.selected.id === node.id) {
      this.selected = null;
    }

    // clean all subordinate nodes
    const children = node.children;
    let ci = children.length;
    while (ci--) {
      this.removeNode(children[ci]);
    }

    // clean all children
    children.length = 0;

    // remove from parent's children
    const sibling = node.parent.children;
    let si = sibling.length;
    while (si--) {
      if (sibling[si].id === node.id) {
        sibling.splice(si, 1);
        break;
      }
    }

    // remove from global nodes
    delete this.nodes[node.id];

    return true;
  }

  private _putNode(node: MindNode): void {
    if (node.id in this.nodes) {
      throw new Error("the nodeid '" + node.id + "' has been already exist.");
    }

    this.nodes[node.id] = node;
  }

  _reindex(node: MindNode): void {
    console.debug(
      `Before Mind._reindex: ` +
        node.children.map((n) => `${n.topic}: ${n.index}`).join("\n")
    );
    node.children.sort(MindNode.compare);
    for (let i = 0; i < node.children.length; i++) {
      node.children[i].index = i + 1;
    }
    console.debug(
      `After Mind._reindex: ` +
        node.children.map((n) => `${n.topic}: ${n.index}`).join("\n")
    );
  }
}
