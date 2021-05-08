import MindmapExporter from "../MindmapExporter";
import Mind from "../../Mind";
import MindNode from "../../MindNode";
import { Direction } from "../../MindmapConstants";

export default class NodeTreeExporter implements MindmapExporter {
  getData(mind: Mind): Record<string, any> {
    const json: Record<string, any> = {};
    json.format = "node_tree";
    json.data = this._buildnode(mind.root);
    return json;
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
        // @ts-ignore
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
