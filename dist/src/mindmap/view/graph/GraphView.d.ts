import { RootNodeOffsetFromTopLeftOfMcnodes } from "../../layout/RootNodeOffsetFromTopLeftOfMcnodes";
import { LayoutResult } from "../../layout/LayoutResult";
import { Mind } from "../../model/Mind";
import { GraphCanvas } from "./GraphCanvas";

export declare class GraphView {
  private readonly graphCanvas;
  private readonly lineWidth;
  constructor(graphCanvas: GraphCanvas);
  renderLines(
    mind: Mind,
    layoutResult: LayoutResult,
    offset: RootNodeOffsetFromTopLeftOfMcnodes,
  ): void;
  setSize(width: number, height: number): void;
  clear(): void;
}
