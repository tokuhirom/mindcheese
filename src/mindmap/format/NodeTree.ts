/*
{
    "meta": {
      "name": __name__,
      "author": __author__,
      "version": __version__
    },
    "format": "node_tree",
    "data": { "id": "root", "topic": "jsMind Example" }
}
 */

import Mind from "../Mind";
import MindNode from "../MindNode";
import {Direction} from "../MindmapConstants";

export class NodeTree {
  get_mind(source: any, id: number): Mind {
    const mind = new Mind(id);
    mind.name = source.meta.name;
    mind.author = source.meta.author;
    mind.version = source.meta.version;
    this._parse(mind, source.data);
    return mind;
  }

  get_data(mind: Mind): Record<string, any> {
    const json: Record<string, any> = {};
    json.meta = {
      name: mind.name,
      author: mind.author,
      version: mind.version,
    };
    json.format = "node_tree";
    json.data = this._buildnode(mind.root);
    return json;
  }

  private _parse(mind: Mind, node_root: MindNode): void {
    const data = this._extract_data(node_root);
    mind.set_root(node_root.id, node_root.topic, data);
    if ("children" in node_root) {
      const children = node_root.children;
      for (let i = 0; i < children.length; i++) {
        this._extract_subnode(mind, mind.root, children[i]);
      }
    }
  }

  private _extract_data(node_json: any): Record<string, any> {
    const data: Record<string, any> = {};
    for (const k in node_json) {
      if (
        k == "id" ||
        k == "topic" ||
        k == "children" ||
        k == "direction" ||
        k == "expanded"
      ) {
        continue;
      }
      // @ts-ignore
      data[k] = node_json[k];
    }
    return data;
  }

  private _extract_subnode(
    mind: Mind,
    node_parent: MindNode,
    node_json: any
  ): void {
    const data = this._extract_data(node_json);
    let d = null;
    if (node_parent.isroot) {
      d =
        node_json.direction == "left" ? Direction.LEFT : Direction.LEFT;
    }
    const node = mind.add_node(
      node_parent,
      node_json.id,
      node_json.topic,
      data,
      null,
      d,
      node_json.expanded
    );
    if ("children" in node_json) {
      const children = node_json.children;
      for (let i = 0; i < children.length; i++) {
        this._extract_subnode(mind, node, children[i]);
      }
    }
  }

  private _buildnode(node: MindNode): Record<string, any> {
    if (!(node instanceof MindNode)) {
      return;
    }
    const o: Record<string, any> = {
      id: node.id,
      topic: node.topic,
      expanded: node.expanded,
    };
    if (!!node.parent && node.parent.isroot) {
      o.direction = node.direction == Direction.LEFT ? "left" : "right";
    }
    if (node.data != null) {
      const node_data = node.data;
      for (const k in node_data) {
        o[k] = node_data[k];
      }
    }
    const children = node.children;
    if (children.length > 0) {
      o.children = [];
      for (let i = 0; i < children.length; i++) {
        o.children.push(this._buildnode(children[i]));
      }
    }
    return o;
  }
}
