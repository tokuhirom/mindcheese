import { Direction } from "../MindmapConstants";
import { Size } from "../Size";
import { ViewData } from "./ViewData";
import { LayoutData } from "./LayoutData";
import { COLORS } from "./COLORS";
import {CenterOfNodeOffsetFromRootNode} from "../LayoutProvider";

export default class MindNode {
  public readonly id: string;
  public index: number;
  public topic: string;
  public readonly isroot: boolean;
  public parent: MindNode | null;
  public direction: Direction;
  public expanded: boolean;
  public readonly children: MindNode[];
  public color: string | null;
  public readonly data: {
    view: ViewData;
    layout: LayoutData;
  };

  constructor(
    id: string,
    index: number,
    topic: string,
    isRoot: boolean,
    parent: MindNode | null,
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

    // console.log(`ID: ${id}`);
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
      let p: MindNode | null = node;
      while (!p!.isroot) {
        p = p!.parent;
        if (p!.id === pid) {
          return true;
        }
      }
    }
    return false;
  }

  getSize(): Size {
    const viewData = this.data.view;
    return new Size(viewData.width, viewData.height);
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

  getCenterOffsetOfTheNodeFromRootNode(): CenterOfNodeOffsetFromRootNode {
    let x = 0;
    let y = 0;
    let n: MindNode | null = this;
    do {
      x += n!.data.layout.relativeCenterOffsetX;
      y += n!.data.layout.relativeCenterOffsetY;

      n = n!.parent
    } while (n)

    return new CenterOfNodeOffsetFromRootNode(x, y);
  }
}
