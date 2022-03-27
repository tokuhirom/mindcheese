/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

/**
 * Modified by tokuhirom.
 * - support npm.
 * - replace var with let/const.
 * Copyright (C) 2021 Tokuhiro Matsuno.
 */

import MindCheese from "./MindCheese";
import MindNode from "./model/MindNode";
import { BEFOREID_FIRST, BEFOREID_LAST, Direction } from "./MindmapConstants";
import { Point } from "./layout/Point";
import { findMcnode } from "./utils/DomUtils";

function getClientFromEvent(e: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if (e instanceof MouseEvent) {
    return e;
  } else if (e instanceof TouchEvent) {
    return e.touches[0];
  } else {
    throw new Error("Unknown event type");
  }
}

class ClosePoint {
  node: MindNode;
  np: Point;
  sp: Point;
  direction: Direction;

  constructor(node: MindNode, direction: Direction, sp: Point, np: Point) {
    this.node = node;
    this.direction = direction;
    this.sp = sp;
    this.np = np;
  }
}

export default class Draggable {
  private readonly mindCheese: MindCheese;
  private readonly canvasElement: HTMLCanvasElement;
  private readonly canvasContext: CanvasRenderingContext2D;
  private readonly shadow: HTMLElement; // <mcnode>
  private shadowW: number;
  private shadowH: number;
  private activeNode: MindNode | null;
  private targetNode: MindNode | null;
  private targetDirect: Direction | null;
  private clientW: number;
  private clientH: number;
  private offsetX: number;
  private offsetY: number;
  private hlookupDelay: number;
  private hlookupTimer: number;
  private capture: boolean;
  private moved: boolean;
  private clientHW = 0;
  private clientHH = 0;
  private readonly lineWidth = 5;
  private readonly lookupDelay = 500;
  private readonly lookupInterval = 80;

  constructor(mindCheese: MindCheese) {
    this.mindCheese = mindCheese;
    this.canvasElement = Draggable.createCanvas();
    this.mindCheese.view.mindCheeseInnerElement.appendChild(this.canvasElement);
    this.canvasContext = this.canvasElement.getContext("2d")!;
    this.shadow = Draggable.createShadow();
    this.shadowW = 0;
    this.shadowH = 0;
    this.activeNode = null;
    this.targetNode = null;
    this.targetDirect = null;
    this.clientW = 0;
    this.clientH = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.hlookupDelay = 0;
    this.hlookupTimer = 0;
    this.capture = false;
    this.moved = false;
  }

  init(container: HTMLElement): void {
    this.eventBind(container);
  }

  resize(width: number, height: number): void {
    this.mindCheese.view.mcnodes.appendChild(this.shadow);
    this.canvasElement.width = width;
    this.canvasElement.height = height;
  }

  private static createCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    canvasElement.className = "mindcheese-draggable-graph";
    return canvasElement;
  }

  private static createShadow(): HTMLElement {
    const mcnode = document.createElement("mcnode");
    mcnode.style.visibility = "hidden";
    mcnode.style.zIndex = "3";
    mcnode.style.cursor = "move";
    mcnode.style.opacity = "0.7";
    return mcnode;
  }

  resetShadow(el: HTMLElement): void {
    const s = this.shadow.style;
    this.shadow.innerHTML = el.innerHTML;
    s.left = el.style.left;
    s.top = el.style.top;
    s.width = el.style.width;
    s.height = el.style.height;
    s.backgroundImage = el.style.backgroundImage;
    s.backgroundSize = el.style.backgroundSize;
    s.transform = el.style.transform;
    this.shadowW = this.shadow.clientWidth;
    this.shadowH = this.shadow.clientHeight;
  }

  showShadow(): void {
    if (!this.moved) {
      this.shadow.style.visibility = "visible";
    }
  }

  hideShadow(): void {
    this.shadow.style.visibility = "hidden";
  }

  private magnetShadow(sp: Point, np: Point): void {
    this.canvasContext.lineWidth = this.lineWidth;
    this.canvasContext.strokeStyle = "rgba(0,0,0,0.3)";
    this.canvasContext.lineCap = "round";
    this.clearLines();
    this.canvasLineTo(sp.x, sp.y, np.x, np.y);
  }

  private clearLines(): void {
    this.canvasContext.clearRect(
      0,
      0,
      this.mindCheese.view.size.width,
      this.mindCheese.view.size.height
    );
  }

  private canvasLineTo(x1: number, y1: number, x2: number, y2: number): void {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x1, y1);
    this.canvasContext.bezierCurveTo(
      x1 + ((x2 - x1) * 2) / 3,
      y1,
      x1,
      y2,
      x2,
      y2
    );
    this.canvasContext.stroke();
  }

  private doLookupCloseNode(): ClosePoint | null {
    const root = this.mindCheese.mind.root!;
    const rootLocation = root.data.view.elementTopLeft!;
    const rootSize = root.data.view.elementSizeCache!;
    const rootX = rootLocation.x + rootSize.width / 2;

    const sw = this.shadowW;
    const sh = this.shadowH;
    const sx = this.shadow.offsetLeft; // offset of the moving node
    const sy = this.shadow.offsetTop;

    const direct = sx + sw / 2 >= rootX ? Direction.RIGHT : Direction.LEFT;
    const nodes = this.mindCheese.mind.nodes;
    let minDistance = Number.MAX_VALUE;
    let closestNode = null;
    let closestPoint: Point | null = null;
    let shadowPoint: Point | null = null;
    for (const nodeid in nodes) {
      let np: Point, sp: Point;
      const node = nodes[nodeid];
      let distance = 0;
      if (node.isroot || node.direction == direct) {
        if (node.id == this.activeNode!.id) {
          continue;
        }
        const ns = node.data.view.elementSizeCache!;
        const nl = node.data.view.elementTopLeft!;
        if (direct == Direction.RIGHT) {
          if (sx - nl.x - ns.width <= 0) {
            continue;
          }
          distance =
            Math.abs(sx - nl.x - ns.width) +
            Math.abs(sy + sh / 2 - nl.y - ns.height / 2);
          np = new Point(
            nl.x + ns.width - this.lineWidth,
            nl.y + (node.isroot ? ns.height / 2 : ns.height)
          );
          sp = new Point(sx + this.lineWidth, sy + sh);
        } else {
          if (nl.x - sx - sw <= 0) {
            continue;
          }
          distance =
            Math.abs(sx + sw - nl.x) +
            Math.abs(sy + sh / 2 - nl.y - ns.height / 2);
          np = new Point(
            nl.x + this.lineWidth,
            nl.y + (node.isroot ? ns.height / 2 : ns.height)
          );
          sp = new Point(sx + sw - this.lineWidth, sy + sh);
        }
        if (distance < minDistance) {
          closestNode = node;
          closestPoint = np;
          shadowPoint = sp;
          minDistance = distance;
        }
      }
    }
    if (closestNode) {
      return new ClosePoint(closestNode, direct, shadowPoint!, closestPoint!);
    } else {
      return null;
    }
  }

  lookupCloseNode(): void {
    const closePointOrNull = this.doLookupCloseNode();
    if (closePointOrNull) {
      this.magnetShadow(closePointOrNull.sp, closePointOrNull.np);
      this.targetNode = closePointOrNull.node;
      this.targetDirect = closePointOrNull.direction;
    }
  }

  private eventBind(container: HTMLElement): void {
    container.addEventListener("mousedown", this.dragstart.bind(this), false);
    container.addEventListener("mousemove", this.drag.bind(this), false);
    container.addEventListener("mouseup", this.dragend.bind(this), false);
    {
      let tapCount = 0;
      container.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          if (!tapCount) {
            // single tap
            ++tapCount;

            this.dragstart(e);

            setTimeout(function () {
              tapCount = 0;
            }, 350);
          } else {
            // double tap
            this.mindCheese.dblclickHandle(e);
          }
        },
        { passive: true }
      );
    }
    container.addEventListener("touchmove", this.drag.bind(this), {
      passive: true,
    });
    container.addEventListener("touchend", this.dragend.bind(this), false);
  }

  private static findMcnode(htmlElement: HTMLElement): HTMLElement | null {
    return findMcnode(htmlElement);
  }

  dragstart(e: MouseEvent | TouchEvent): void {
    if (!this.mindCheese.isEditable()) {
      return;
    }
    if (this.capture) {
      return;
    }
    this.activeNode = null;

    const viewProvider = this.mindCheese.view;
    const el = findMcnode(e.target as HTMLElement);
    if (!el) {
      return;
    }
    const nodeid = viewProvider.getBindedNodeId(el);
    if (nodeid) {
      const node = this.mindCheese.mind.getNodeById(nodeid);
      if (!node.isroot) {
        this.resetShadow(el);
        this.activeNode = node;
        const client = getClientFromEvent(e);
        this.offsetX = client.clientX - el.offsetLeft;
        this.offsetY = client.clientY - el.offsetTop;
        // this.offsetX = (e.clientX || e.touches[0].clientX) - el.offsetLeft;
        // this.offset_y = (e.clientY || e.touches[0].clientY) - el.offsetTop;
        this.clientHW = Math.floor(el.clientWidth / 2);
        this.clientHH = Math.floor(el.clientHeight / 2);
        if (this.hlookupDelay !== 0) {
          window.clearTimeout(this.hlookupDelay);
        }
        if (this.hlookupTimer !== 0) {
          window.clearInterval(this.hlookupTimer);
        }
        this.hlookupDelay = window.setTimeout(() => {
          this.hlookupDelay = 0;
          this.hlookupTimer = window.setInterval(
            this.lookupCloseNode.bind(this),
            this.lookupInterval
          );
        }, this.lookupDelay);
        this.capture = true;
      }
    }
  }

  drag(e: MouseEvent | TouchEvent): void {
    if (!this.mindCheese.isEditable()) {
      return;
    }
    if (this.capture) {
      e.preventDefault();
      this.showShadow();
      this.moved = true;
      window.getSelection()!.removeAllRanges();
      const client = getClientFromEvent(e);
      const px = client.clientX - this.offsetX;
      const py = client.clientY - this.offsetY;
      // const px = (e.clientX || e.touches[0].clientX) - this.offsetX;
      // const py = (e.clientY || e.touches[0].clientY) - this.offset_y;
      this.shadow.style.left = px + "px";
      this.shadow.style.top = py + "px";
      window.getSelection()!.removeAllRanges();
    }
  }

  dragend(): void {
    if (!this.mindCheese.isEditable()) {
      return;
    }
    if (this.capture) {
      if (this.hlookupDelay !== 0) {
        window.clearTimeout(this.hlookupDelay);
        this.hlookupDelay = 0;
        this.clearLines();
      }
      if (this.hlookupTimer !== 0) {
        window.clearInterval(this.hlookupTimer);
        this.hlookupTimer = 0;
        this.clearLines();
      }
      if (this.moved) {
        const srcNode = this.activeNode;
        const targetNode = this.targetNode;
        const targetDirect = this.targetDirect;
        this.moveNode(srcNode!, targetNode!, targetDirect!);
      }
      this.hideShadow();
    }
    this.moved = false;
    this.capture = false;
  }

  moveNode(
    srcNode: MindNode,
    targetNode: MindNode,
    targetDirect: Direction
  ): void {
    console.log(`Draggable.moveNode: ${srcNode} ${targetNode} ${targetDirect}`);
    const shadowH = this.shadow.offsetTop;
    if (!!targetNode && !!srcNode && !MindNode.inherited(srcNode, targetNode)) {
      console.log(`let's move!`);
      // lookup before_node
      const siblingNodes = targetNode.children;
      let sc = siblingNodes.length;
      let node = null;
      let deltaY = Number.MAX_VALUE;
      let nodeBefore = null;
      let beforeid = BEFOREID_LAST;
      while (sc--) {
        node = siblingNodes[sc];
        if (node.direction === targetDirect && node.id !== srcNode.id) {
          const dy = node.data.view.elementTopLeft!.y - shadowH;
          if (dy > 0 && dy < deltaY) {
            deltaY = dy;
            nodeBefore = node;
            beforeid = BEFOREID_FIRST;
          }
        }
      }
      if (nodeBefore) {
        beforeid = nodeBefore.id;
      }
      console.log(
        `Calling jm.move_node: ${srcNode.id}, ${beforeid}, ${targetNode.id}, ${targetDirect}`
      );
      this.mindCheese.moveNode(srcNode, beforeid, targetNode, targetDirect);
    }
    this.activeNode = null;
    this.targetNode = null;
    this.targetDirect = null;
  }
}
