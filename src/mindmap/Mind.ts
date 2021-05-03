"use strict";

import Node from "./Node";
import { Direction } from "./MindmapConstants";

export default class Mind {
  name: string;
  author: string;
  version: string;
  root: any;
  selected: any;
  nodes: any;

  constructor() {
    this.name = null;
    this.author = null;
    this.version = null;
    this.root = null;
    this.selected = null;
    this.nodes = {};
  }

  get_node(nodeid: string): Node {
    if (nodeid in this.nodes) {
      return this.nodes[nodeid];
    } else {
      throw new Error(`the node[id=${nodeid}] can not be found...`);
    }
  }

  set_root(nodeid: string, topic: string, data: any): void {
    console.log("set_root!");
    if (this.root == null) {
      console.log("set_root----------");
      console.log(Node);
      this.root = new Node(nodeid, 0, topic, data, true, null, null, null);
      this._put_node(this.root);
    } else {
      console.error("root node is already exist");
    }
  }

  // XXX jsMind では parent_node に nodeid も受け付けていたっぽい。
  add_node(
    parent_node: Node,
    nodeid: string,
    topic: string,
    data: any,
    idx: number,
    direction: any,
    expanded: boolean
  ): Node {
    const nodeindex = idx || -1;
    let node;
    if (parent_node.isroot) {
      let d;
      if (isNaN(direction)) {
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
        d = direction !== Direction.LEFT ? Direction.RIGHT : Direction.LEFT;
      }
      node = new Node(
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
      node = new Node(
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
    if (this._put_node(node)) {
      parent_node.children.push(node);
      this._reindex(parent_node);
    } else {
      console.error(
        "fail, the nodeid '" + node.id + "' has been already exist."
      );
      node = null;
    }
    return node;
  }

  // XXX jsMind では node_before に nodeid も受け付けていたっぽい。
  insert_node_before(
    node_before: Node,
    nodeid: string,
    topic: string,
    data: any
  ): Node {
    const node_index = node_before.index - 0.5;
    return this.add_node(
      node_before.parent,
      nodeid,
      topic,
      data,
      node_index,
      null,
      null
    );
  }

  // XXX jsMind では node に nodeid も受け付けていたっぽい。
  get_node_before(node: Node) {
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

  // XXX jsMind では node_after に nodeid も受け付けていたっぽい。
  insert_node_after(
    node_after: Node,
    nodeid: string,
    topic: string,
    data: any
  ): Node {
    const node_index = node_after.index + 0.5;
    return this.add_node(
      node_after.parent,
      nodeid,
      topic,
      data,
      node_index,
      null,
      null
    );
  }

  // XXX jsMind では node に nodeid も受け付けていたっぽい。
  get_node_after(node: Node) {
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

  // XXX jsMind では node に nodeid も受け付けていたっぽい。
  move_node(
    node: Node,
    beforeid: string,
    parentid: string,
    direction: any
  ): Node {
    console.assert(node instanceof Node, "node should be Node");
    console.log(`move_node: ${node} ${beforeid} ${parentid} ${direction}`);
    if (!parentid) {
      parentid = node.parent.id;
    }
    return this._move_node(node, beforeid, parentid, direction);
  }

  _flow_node_direction(node: Node, direction: any): void {
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

  _move_node_internal(node: Node, beforeid: string): Node {
    if (!!node && !!beforeid) {
      if (beforeid === "_last_") {
        node.index = -1;
        this._reindex(node.parent);
      } else if (beforeid === "_first_") {
        node.index = 0;
        this._reindex(node.parent);
      } else {
        const node_before = beforeid ? this.get_node(beforeid) : null;
        if (
          node_before != null &&
          node_before.parent != null &&
          node_before.parent.id === node.parent.id
        ) {
          node.index = node_before.index - 0.5;
          this._reindex(node.parent);
        }
      }
    }
    return node;
  }

  _move_node(
    node: Node,
    beforeid: string,
    parentid: string,
    direction: any
  ): Node {
    console.log(`_move_node: ${node}, ${beforeid}, ${parentid}, ${direction}`);
    if (!!node && !!parentid) {
      console.assert(node.parent, `node.parent is null: ${node}`);
      if (node.parent.id !== parentid) {
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
        node.parent = this.get_node(parentid);
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
      this._flow_node_direction(node, null);
    }
    return node;
  }

  // XXX jsMind では Node ではなく string も受け付けていた。
  remove_node(node: Node): boolean {
    if (!node) {
      console.error("fail, the node can not be found");
      return false;
    }
    if (node.isroot) {
      console.error("fail, can not remove root node");
      return false;
    }
    if (this.selected != null && this.selected.id === node.id) {
      this.selected = null;
    }
    // clean all subordinate nodes
    const children = node.children;
    let ci = children.length;
    while (ci--) {
      this.remove_node(children[ci]);
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
    // clean all properties
    for (const k in node) {
      // @ts-ignore
      delete node[k];
    }
    // remove it's self
    node = null;
    //delete node;
    return true;
  }

  _put_node(node: Node): boolean {
    if (node.id in this.nodes) {
      console.warn("the nodeid '" + node.id + "' has been already exist.");
      return false;
    } else {
      this.nodes[node.id] = node;
      return true;
    }
  }

  _reindex(node: Node): void {
    if (node instanceof Node) {
      node.children.sort(Node.compare);
      for (let i = 0; i < node.children.length; i++) {
        node.children[i].index = i + 1;
      }
    }
  }
}

// module.exports.Mind = Mind;
