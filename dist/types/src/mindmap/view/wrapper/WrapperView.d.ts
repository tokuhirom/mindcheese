import { Size } from "../../model/Size";
import { LayoutResult } from "../../layout/LayoutResult";
import { Mind } from "../../model/Mind";
import { NodesView } from "../node/NodesView";
import { GraphCanvas } from "../graph/GraphCanvas";
import { MindNode } from "../../model/MindNode";
import { ScrollSnapshot } from "./ScrollSnapshot";
import { MindCheese } from "../../MindCheese";
import { LayoutEngine } from "../../layout/LayoutEngine";
import { TextFormatter } from "../../renderer/TextFormatter";
export declare class WrapperView {
  private readonly wrapperElement;
  private readonly hMargin;
  private readonly vMargin;
  readonly nodesView: NodesView;
  private zoomScale;
  private graphView;
  private readonly mindCheese;
  private selectedNode;
  private editingNode;
  private readonly layoutEngine;
  size: Size;
  private readonly textFormatter;
  private layoutResult;
  private readonly pSpace;
  constructor(
    mindCheese: MindCheese,
    hmargin: number,
    vmargin: number,
    graphCanvas: GraphCanvas,
    textFormatter: TextFormatter,
    layoutEngine: LayoutEngine,
    pSpace: number,
    lineWidth: number,
  );
  private bindEvents;
  getCanvasSize(layoutResult: LayoutResult, mind: Mind): Size;
  attach(container: HTMLElement): void;
  setTheme(themeName: string): void;
  centerRoot(): void;
  setSize(width: number, height: number): void;
  restoreScroll(node: MindNode, scrollSnapshot: ScrollSnapshot): void;
  saveScroll(node: MindNode): ScrollSnapshot;
  zoom(n: number): void;
  appendChild(element: HTMLCanvasElement): void;
  reset(): void;
  selectClear(): void;
  selectNode(node: MindNode | null): void;
  private static adjustScrollBar;
  removeNode(node: MindNode): void;
  isEditing(): boolean;
  editNodeBegin(node: MindNode): void;
  getBindedNodeId(element: HTMLElement): string | null;
  updateNode(node: MindNode): void;
  editNodeEnd(): void;
  resetSize(): void;
  renderAgain(): void;
}
