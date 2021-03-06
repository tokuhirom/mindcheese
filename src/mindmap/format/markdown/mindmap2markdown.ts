import { Mind } from "../../model/Mind";
import { MindNode } from "../../model/MindNode";
import { Direction } from "../../MindmapConstants";

export function mindmap2markdown(mind: Mind): string {
  return renderMarkdown(mind.root!, 0);
}

function renderMarkdown(node: MindNode, level: number): string {
  let result = "";
  if (node.topic) {
    const lines = node.topic.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < level; j++) {
        result += "\t";
      }
      if (i === 0) {
        result += node.direction == Direction.LEFT ? "+ " : "- ";
      } else {
        result += "  ";
      }
      result += lines[i];
      if (i + 1 < lines.length) {
        result += " \\";
      }
      result += "\n";
    }
  }

  if (node.children) {
    const children = node.children;
    for (let i = 0, l = children.length; i < l; i++)
      result += renderMarkdown(children[i], level + 1);
  }

  return result;
}
