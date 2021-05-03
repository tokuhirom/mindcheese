// TODO convert to typescript
export default class Node {
  // TODO eDirection maybe the ENUM.
  public id: string;
  public index: number;
  public topic: string;
  public data: any;
  public isroot: boolean;
  public parent: any;
  public direction: any;
  public expanded: boolean;
  public children: any[];
  public _data: any;

  constructor(
    sId: string,
    iIndex: number,
    sTopic: string,
    oData: any,
    bIsRoot: boolean,
    oParent: any,
    eDirection: any,
    bExpanded: boolean
  ) {
    if (!sId) {
      throw new Error("invalid nodeid");
    }
    if (typeof iIndex != "number") {
      throw new Error("invalid node index");
    }
    if (typeof bExpanded === "undefined") {
      bExpanded = true;
    }
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

  static compare(node1: Node, node2: Node): number {
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

  static inherited(pnode: Node, node: Node): boolean {
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

  get_location(): { x: number; y: number } {
    const vd = this._data.view;
    return {
      x: vd.abs_x,
      y: vd.abs_y,
    };
  }

  get_size(): { w: number; h: number } {
    const vd = this._data.view;
    return {
      w: vd.width,
      h: vd.height,
    };
  }
}
