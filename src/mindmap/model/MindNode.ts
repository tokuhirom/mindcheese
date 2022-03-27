import { Direction } from "../MindmapConstants";
import { ViewData } from "./ViewData";
import { COLORS } from "./COLORS";

export default class MindNode {
  public readonly id: string;
  public index: number;
  public topic: string;
  public readonly isroot: boolean;
  public parent: MindNode | null;
  public direction: Direction;
  public readonly children: MindNode[];
  public color: string | null;
  public readonly data: {
    view: ViewData;
  };

  constructor(
    id: string,
    index: number,
    topic: string,
    isRoot: boolean,
    parent: MindNode | null,
    direction: Direction
  ) {
    if (!id) {
      throw new Error("invalid nodeid");
    }
    this.id = id;
    this.index = index;
    this.topic = topic;
    this.isroot = isRoot;
    this.parent = parent;
    this.direction = direction;
    this.children = [];
    this.data = {
      view: new ViewData(),
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

  toObject(): Record<string, any> {
    const o: Record<string, any> = {
      id: this.id,
      topic: this.topic,
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
