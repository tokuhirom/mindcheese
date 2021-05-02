"use strict";

function renderMd(node, level) {
  if (node == null) {
    return '';
  }
  let result = '';
  if (node.topic) {
    for (let i=0; i<level; i++) {
      result += '\t';
    }
    result += '- ' + node.topic + "\n";
  }

  if (node.children) {
    for (const a of node.children) {
      result += renderMd(a, level+1);
    }
  }
  return result;
}

 function convertMM2MD(data) {
  return renderMd(data.data, 0);
}

module.exports = {
  convertMM2MD
}