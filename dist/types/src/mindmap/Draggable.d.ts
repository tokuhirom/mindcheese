/**
 * Modified by tokuhirom.
 * - support npm.
 * - replace var with let/const.
 * Copyright (C) 2021 Tokuhiro Matsuno.
 */
import { MindCheese } from "./MindCheese";
export declare class Draggable {
  private readonly mindCheese;
  private readonly canvasElement;
  private readonly canvasContext;
  private readonly shadow;
  private shadowW;
  private shadowH;
  private activeNode;
  private targetNode;
  private targetDirect;
  private clientW;
  private clientH;
  private offsetX;
  private offsetY;
  private hlookupDelay;
  private hlookupTimer;
  private capture;
  private moved;
  private clientHW;
  private clientHH;
  private readonly lineWidth;
  private readonly lookupDelay;
  private readonly lookupInterval;
  constructor(mindCheese: MindCheese);
  resize(width: number, height: number): void;
  private static createCanvas;
  private static createShadow;
  private resetShadow;
  showShadow(): void;
  hideShadow(): void;
  private magnetShadow;
  private clearLines;
  private canvasLineTo;
  private doLookupCloseNode;
  lookupCloseNode(): void;
  eventBind(container: HTMLElement): void;
  dragstart(e: MouseEvent | TouchEvent): void;
  drag(e: MouseEvent | TouchEvent): void;
  dragend(): void;
  private moveNode;
}
