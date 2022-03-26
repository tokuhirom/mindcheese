/**
 * GraphCanvas renders bezier lines between nodes on the canvas element.
 */
import {OffsetFromTopLeftOfMcnodes, Point} from "./LayoutProvider";

export default class GraphCanvas {
  private readonly canvasElement: HTMLCanvasElement;
  private readonly canvasContext: CanvasRenderingContext2D;
  private readonly lineColor: string;
  readonly lineWidth: number;

  /**
   * Create new instance of GraphCanvas.
   *
   * @param lineColor color of lines. CSS compatible colors are ok. e.g. "#ffffff"
   * @param lineWidth Pixel of line width.
   */
  constructor(lineColor: string, lineWidth: number) {
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.className = "mindcheese-graph-canvas";
    this.canvasContext = this.canvasElement.getContext("2d")!;
  }

  element(): HTMLCanvasElement {
    return this.canvasElement;
  }

  setSize(w: number, h: number): void {
    this.canvasElement.width = w;
    this.canvasElement.height = h;
  }

  clear(): void {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
  }

  drawLine(
    pout: OffsetFromTopLeftOfMcnodes,
    pin: OffsetFromTopLeftOfMcnodes,
    color: string,
    lineCap: CanvasLineCap
  ): void {
    const ctx = this.canvasContext;
    ctx.strokeStyle = color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = lineCap;

    GraphCanvas.bezierTo(
      ctx,
      pin.x, pin.y,
      pout.x, pout.y
    );
  }

  private static bezierTo(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 + ((x2 - x1) * 2) / 3, y1, x1, y2, x2, y2);
    ctx.stroke();
  }
}
