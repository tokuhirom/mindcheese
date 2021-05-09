// noinspection JSUnusedGlobalSymbols

import { Direction } from "./MindmapConstants";
import { Point } from "./LayoutProvider";

export class ViewData {
  element: HTMLElement;
  savedLocation: Point; // TODO DO NOT store this field in viewdata.
  expander: HTMLElement;
  absX: number;
  absY: number;
  width: number;
  height: number;
}

export class LayoutData {
  constructor() {
    this.visible = true;
  }

  direction: Direction;
  visible: boolean;
  offsetX: number;
  offsetY: number;
  outerHeight: number;
  leftNodes: MindNode[];
  rightNodes: MindNode[];
  outerHeightLeft: number;
  outerHeightRight: number;
}

export default class MindNode {
  public id: string;
  public index: number;
  public topic: string;
  public isroot: boolean;
  public parent: MindNode;
  public direction: Direction;
  public expanded: boolean;
  public children: MindNode[];
  public data: {
    // TODO extract this.data.view to this.view_data
    view: ViewData;
    layout: LayoutData;
  };

  constructor(
    id: string,
    index: number,
    topic: string,
    isRoot: boolean,
    parent: MindNode,
    direction: Direction,
    expanded: boolean
  ) {
    if (!id) {
      throw new Error("invalid nodeid");
    }
    if (typeof index != "number") {
      throw new Error("invalid node index");
    }
    this.id = id;
    this.index = index;
    this.topic = topic;
    this.isroot = isRoot;
    this.parent = parent;
    this.direction = direction;
    this.expanded = expanded;
    this.children = [];
    this.data = {
      view: new ViewData(),
      layout: new LayoutData(),
    };
  }

  static compare(node1: MindNode, node2: MindNode): number {
    // '-1' is alwary the last
    let r: number;
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
    // console.debug(`MindNode.compare: ${i1} <> ${i2}  =  ${r}`);
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

  getLocation(): Point {
    const vd = this.data.view;
    return new Point(vd.absX, vd.absY);
  }

  getSize(): { w: number; h: number } {
    const vd = this.data.view;
    return {
      w: vd.width,
      h: vd.height,
    };
  }
}
