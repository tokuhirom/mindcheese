import { Direction } from "./MindmapConstants";
import { Point } from "./LayoutProvider";
import { RoundRobin } from "./utils/RoundRobin";

export class ViewData {
  element: HTMLElement;
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

export class Size {
  w: number;
  h: number;

  constructor(width: number, height: number) {
    this.w = width;
    this.h = height;
  }
}

const COLORS = new RoundRobin([
  "#cc0000",
  "#00cc00",
  "#0000cc",
  "#00cccc",
  "#cc00cc",
  "#cccc00",
]);

export default class MindNode {
  public readonly id: string;
  public index: number;
  public topic: string;
  public readonly isroot: boolean;
  public parent: MindNode;
  public direction: Direction;
  public expanded: boolean;
  public readonly children: MindNode[];
  public color: string;
  public readonly data: {
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

    console.log(`ID: ${id}`);
    if (!parent) {
      this.color = null;
    } else if (parent && parent.color) {
      // inherit parent's color
      this.color = parent.color;
    } else {
      this.color = COLORS.take();
    }
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

  getSize(): Size {
    const vd = this.data.view;
    return new Size(vd.width, vd.height);
  }

  toObject(): Record<string, any> {
    const o: Record<string, any> = {
      id: this.id,
      topic: this.topic,
      expanded: this.expanded,
      children: this.children.map((it) => it.toObject()),
    };
    if (!!this.parent && this.parent.isroot) {
      o.direction = this.direction == Direction.LEFT ? "left" : "right";
    }
    return o;
  }

  applyColor(color: string) {
    this.color = color;
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.children[i].applyColor(color);
    }
  }
}
