// TODO convert to typescript
class Node {
  // TODO eDirection maybe the ENUM.

  constructor(sId, iIndex, sTopic, oData, bIsRoot, oParent, eDirection, bExpanded) {
    if (!sId) { throw new Error('invalid nodeid'); }
    if (typeof iIndex != 'number') { throw new Error('invalid node index'); }
    if (typeof bExpanded === 'undefined') { bExpanded = true; }
    this.id = sId;
    this.index = iIndex;
    this.topic = sTopic;
    this.data = oData || {};
    this.isroot = bIsRoot;
    this.parent = oParent;
    this.direction = eDirection;
    this.expanded = !!bExpanded;
    this.children = [];
    this._data = {};
  }

  static compare(node1, node2) {
    // '-1' is alwary the last
    let r = 0;
    const i1 = node1.index;
    const i2 = node2.index;
    if (i1 >= 0 && i2 >= 0) {
      r = i1 - i2;
    } else if (i1 === -1 && i2 === -1) {
      r = 0;
    } else if (i1 === -1) {
      r = 1;
    } else if (i2 === -1) {
      r = -1;
    } else {
      r = 0;
    }
    //logger.debug(i1+' <> '+i2+'  =  '+r);
    return r;
  }

  static inherited(pnode, node) {
    if (!!pnode && !!node) {
      if (pnode.id === node.id) {
        return true;
      }
      if (pnode.isroot) {
        return true;
      }
      const pid = pnode.id;
      let p = node;
      while (!p.isroot) {
        p = p.parent;
        if (p.id === pid) {
          return true;
        }
      }
    }
    return false;
  }

  get_location() {
    const vd = this._data.view;
    return {
      x: vd.abs_x,
      y: vd.abs_y
    };
  }

  get_size() {
    const vd = this._data.view;
    return {
      w: vd.width,
      h: vd.height
    }
  }
}

module.exports = {
  Node
}