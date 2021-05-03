// TODO convert to typescript
import {Direction} from "./MindmapConstants";

export class ViewData {
  element: HTMLElement
  _saved_location: any
  expander: HTMLElement
  abs_x: number
  abs_y: number
  width: number
  height: number
}

export class LayoutData {
  direction: Direction
  visible: boolean
  offset_x: number;
  offset_y: number;
  outer_height: number;
  left_nodes: MindNode[];
  right_nodes: MindNode[];
  outer_height_left: number;
  outer_height_right: number;
  _offset_: { x: number; y: number };
  _pout_: { x: number; y: number };
  side_index: number;
}

export default class MindNode {
  // TODO eDirection maybe the ENUM.
  public id: string;
  public index: number;
  public topic: string;
  public data: any;
  public isroot: boolean;
  public parent: any;
  public direction: Direction;
  public expanded: boolean;
  public children: MindNode[];
  public _data: {
    view: ViewData,
    layout: LayoutData,
  };

  constructor(
    sId: string,
    iIndex: number,
    sTopic: string,
    oData: any,
    bIsRoot: boolean,
    oParent: MindNode,
    eDirection: Direction,
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
    this._data = {
      view: new ViewData(),
      layout: new LayoutData(),
    };
  }

  static compare(node1: MindNode, node2: MindNode): number {
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

  static inherited(pnode: MindNode, node: MindNode): boolean {
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
