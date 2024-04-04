import { OffsetFromTopLeftOfMcnodes } from "../../layout/OffsetFromTopLeftOfMcnodes";
/**
 * GraphCanvas renders bezier lines between nodes on the canvas element.
 */
export declare class GraphCanvas {
  private readonly canvasElement;
  private readonly canvasContext;
  private readonly lineColor;
  readonly lineWidth: number;
  /**
   * Create new instance of GraphCanvas.
   *
   * @param lineColor color of lines. CSS compatible colors are ok. e.g. "#ffffff"
   * @param lineWidth Pixel of line width.
   */
  constructor(lineColor: string, lineWidth: number);
  element(): HTMLCanvasElement;
  setSize(w: number, h: number): void;
  clear(): void;
  drawLine(
    pout: OffsetFromTopLeftOfMcnodes,
    pin: OffsetFromTopLeftOfMcnodes,
    color: string,
    lineCap: CanvasLineCap,
  ): void;
  private static bezierTo;
}
