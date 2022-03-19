import Mind from "../../Mind";
import MindNode from "../../MindNode";
import { Direction } from "../../MindmapConstants";

/*
{
    "format": "node_tree",
    "data": { "id": "root", "topic": "jsMind Example" }
}
 */

export default class NodeTreeImporter {
  getMind(source: any): Mind {
    const mind = new Mind();
    this.parse(mind, source.data);
    return mind;
  }

  private parse(mind: Mind, nodeRoot: MindNode): void {
    mind.setRoot(nodeRoot.id, nodeRoot.topic);
    if ("children" in nodeRoot) {
      const children = nodeRoot.children;
      for (let i = 0; i < children.length; i++) {
        this.extractSubNode(mind, mind.root, children[i]);
      }
    }
  }

  private extractSubNode(
    mind: Mind,
    nodeParent: MindNode,
    nodeJson: any
  ): void {
    let d: Direction = null;
    if (nodeParent.isroot) {
      d = nodeJson.direction == "left" ? Direction.LEFT : Direction.RIGHT;
    }
    console.log(
      `_extract_subnode node_json.direction DIRECTION=${nodeJson.direction} d=${d} ${nodeJson.topic}`
    );
    const node = mind.addNode(
      nodeParent,
      nodeJson.id,
      nodeJson.topic,
      null,
      d,
      nodeJson.expanded
    );
    if ("children" in nodeJson) {
      const children = nodeJson.children;
      for (let i = 0; i < children.length; i++) {
        this.extractSubNode(mind, node, children[i]);
      }
    }
  }
}
