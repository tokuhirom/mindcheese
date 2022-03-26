import { object2mindmap } from "../node_tree/object2mindmap";
import Mind from "../../Mind";

function parse(md: string) {
  if (md == null) {
    throw new Error("md should not be null");
  }

  const lines = md.split(/\n/);
  let lastSpaces = "";
  const root: Record<string, any> = {
    id: "root",
    topic: "DUMMY",
    children: [],
  };
  let i = 0;
  let lastElement = root;
  const anchor: Record<number, any> = {
    0: root,
  };

  let isContinuous = false;
  for (const line of lines) {
    // skip empty line
    if (!line.match(/\S/)) {
      continue;
    }

    if (isContinuous) {
      let body = line;
      if (body.match(/ [\\ ]$/)) {
        // multi-line bullet list.
        body = body.replace(/ [\\ ]$/, "");
        isContinuous = true;
      } else {
        isContinuous = false;
      }
      for (let j = 0; j < lastSpaces.length + 2; j++) {
        body = body.replace(/^\s/, "");
      }
      lastElement.topic += "\n" + body;
    } else {
      const match = line.match(/^(\s*)([+-])\s*(.*?)$/);
      if (!match) {
        console.log(`'${line}' is not a bullet list.`);
        continue;
      }
      const leadingSpaces = match[1];
      const directionCharacter = match[2];
      let body = match[3];
      if (body.match(/ [\\ ]$/)) {
        // multi-line bullet list.
        body = body.replace(/ [\\ ]$/, "");
        isContinuous = true;
      } else {
        isContinuous = false;
      }

      // console.log(`lead=${leadingSpaces.length} body=${body} root=${JSON.stringify(root)}`);

      const el: Record<string, any> = {
        id: ++i,
        topic: body,
        direction: directionCharacter === "+" ? "left" : "right",
        children: [],
      };

      if (lastSpaces.length === leadingSpaces.length) {
        // console.log('same')
      } else if (lastSpaces.length < leadingSpaces.length) {
        // indent
        // console.log('indent')
        anchor[leadingSpaces.length] = lastElement;
      } else {
        // dedend
        // console.log('dedent')
      }
      anchor[leadingSpaces.length].children.push(el);
      lastElement = el;
      lastSpaces = leadingSpaces;
    }
  }
  const realRoot = root.children[0];
  if (!realRoot) {
    throw new Error(
      "MindCheese can't parse this markdown as a mindmap: '" + md + "'"
    );
  }
  return realRoot;
}

export function markdown2mindmap(md: string): Mind {
  const tree = parse(md.replace(/^---$.*^---$/ms, ""));
  return object2mindmap(tree);
}
