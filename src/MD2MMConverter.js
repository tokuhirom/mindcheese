"use strict";

function parse(title, md) {
  const lines = md.split(/\n/)
  let lastSpaces = '';
  const root = {
    id:"root",
    topic: title,
    children: [],
  };
  let i = 0;
  let lastElement = root;
  const anchor = {
    0: root
  };

  for (const line of lines) {
    // skip empty line
    if (!line.match(/\S/)) {
      continue;
    }

    const match = line.match(/^(\s*)-\s*(.*?)\s*$/);
    const leadingSpaces = match[1];
    const body = match[2];

    console.log(`lead=${leadingSpaces.length} body=${body} root=${JSON.stringify(root)}`);

    const el = {
      id: ++i,
      topic: body,
      children: []
    };

    if (lastSpaces.length === leadingSpaces.length) {
      console.log('same')
    } else if (lastSpaces.length < leadingSpaces.length) { // indent
      console.log('indent')
      anchor[leadingSpaces.length] = lastElement;
    } else { // dedend
      console.log('dedent')
    }
    anchor[leadingSpaces.length].children.push(el);
    lastElement = el;
    lastSpaces = leadingSpaces;
  }
  return root;
}

function convertMD2MM(title, md) {
  return {
    "meta": {
      "name": "jsMind remote",
      "author": "hizzgdev@163.com",
      "version": "0.2"
    },
    "format": "node_tree",
    "data": parse(title, md)
  };
}

module.exports = {
  convertMD2MM
}