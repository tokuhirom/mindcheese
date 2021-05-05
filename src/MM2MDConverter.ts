function renderMd(node: any, level: number): string {
  if (node == null) {
    return "";
  }

  let result = "";
  if (node.topic) {
    const lines = node.topic.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < level; j++) {
        result += "\t";
      }
      if (i === 0) {
        result += node.direction == "left" ? "+ " : "- ";
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
    for (const a of node.children) {
      result += renderMd(a, level + 1);
    }
  }
  return result;
}

export function convertMM2MD(data: any): string {
  const p = {
    // Skip the root node。
    children: data.data.children,
  };
  return renderMd(p, -1);
}
