import { Mind } from "../../model/Mind";
import { MindNode } from "../../model/MindNode";
import { Direction } from "../../MindmapConstants";

/*
{
    { "id": "root", "topic": "mindCheese Example" }
}
 */

// Convert plain node tree to Mind object.
export function object2mindmap(source: Record<string, any>): Mind {
  const mind = new Mind();
  parse(mind, source);
  return mind;
}

function parse(mind: Mind, nodeRoot: Record<string, any>): void {
  mind.setRoot(nodeRoot.id, nodeRoot.topic);
  if ("children" in nodeRoot) {
    const children = nodeRoot.children;
    for (let i = 0; i < children.length; i++) {
      extractSubNode(mind, mind.root!, children[i]);
    }
  }
}

function extractSubNode(
  mind: Mind,
  nodeParent: MindNode,
  nodeJson: Record<string, any>,
): void {
  let d: Direction | null = null;
  if (nodeParent.isroot) {
    d = nodeJson.direction == "left" ? Direction.LEFT : Direction.RIGHT;
  }
  // console.log(
  //   `_extract_subnode node_json.direction DIRECTION=${nodeJson.direction} d=${d} ${nodeJson.topic}`
  // );
  const node = mind.addNode(nodeParent, nodeJson.id, nodeJson.topic, null, d);
  if ("children" in nodeJson) {
    const children = nodeJson.children;
    for (let i = 0; i < children.length; i++) {
      extractSubNode(mind, node, children[i]);
    }
  }
}
