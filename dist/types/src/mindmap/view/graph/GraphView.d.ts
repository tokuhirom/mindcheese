import { GraphCanvas } from "./GraphCanvas";
import { Mind } from "../../model/Mind";
import { LayoutResult } from "../../layout/LayoutResult";
import { RootNodeOffsetFromTopLeftOfMcnodes } from "../../layout/RootNodeOffsetFromTopLeftOfMcnodes";
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
