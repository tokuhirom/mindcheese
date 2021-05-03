function parse(title: string, md:string) {
  if (md == null) {
    throw new Error("md should not be null");
  }

  const lines = md.split(/\n/);
  let lastSpaces = "";
  const root: Record<string, any> = {
    id: "root",
    topic: title,
    children: [],
  };
  let i = 0;
  let lastElement = root;
  const anchor: Record<number, any> = {
    0: root,
  };

  for (const line of lines) {
    // skip empty line
    if (!line.match(/\S/)) {
      continue;
    }

    const match = line.match(/^(\s*)([+-])\s*(.*?)\s*$/);
    const leadingSpaces = match[1];
    const directionCharacter = match[2];
    const body = match[3];

    // console.log(`lead=${leadingSpaces.length} body=${body} root=${JSON.stringify(root)}`);

    const el: Record<string, any> = {
      id: ++i,
      topic: body,
      direction: directionCharacter === '+' ? 'left' : 'right',
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
  return root;
}

export function convertMD2MM(title: string, md: string): any {
  return {
    meta: {
      name: "jsMind remote",
      author: "hizzgdev@163.com",
      version: "0.2",
    },
    format: "node_tree",
    data: parse(title, md.replace(/^---$.*^---$/ms, "")),
  };
}

