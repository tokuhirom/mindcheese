import MindmapImporter from "../MindmapImporter";
import Mind from "../../Mind";
import MindNode from "../../MindNode";
import { Direction } from "../../MindmapConstants";

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

export default class NodeTreeImporter implements MindmapImporter {
  get_mind(source: any, id: number): Mind {
    const mind = new Mind(id);
    mind.name = source.meta.name;
    mind.author = source.meta.author;
    mind.version = source.meta.version;
    this._parse(mind, source.data);
    return mind;
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
      d = node_json.direction == "left" ? Direction.LEFT : Direction.RIGHT;
    }
    console.log(
      `_extract_subnode node_json.direction DIRECTION=${node_json.direction} d=${d} ${node_json.topic}`
    );
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
}
