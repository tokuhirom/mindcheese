export default class GraphCanvas {
  private opts: { line_color: any; line_width: number };
  private readonly e_canvas: HTMLCanvasElement;
  private readonly canvas_ctx: CanvasRenderingContext2D;
  private size: { w: number; h: number };

  constructor(view: any) {
    this.opts = view.opts;
    this.e_canvas = document.createElement("canvas");
    this.e_canvas.className = "jsmind";
    this.canvas_ctx = this.e_canvas.getContext("2d");
    this.size = { w: 0, h: 0 };
  }

  element(): HTMLCanvasElement {
    return this.e_canvas;
  }

  set_size(w: number, h: number): void {
    this.size.w = w;
    this.size.h = h;
    this.e_canvas.width = w;
    this.e_canvas.height = h;
  }

  clear(): void {
    this.canvas_ctx.clearRect(0, 0, this.size.w, this.size.h);
  }

  draw_line(
    pout: { x: number; y: number },
    pin: { x: number; y: number },
    offset: { x: number; y: number }
  ): void {
    const ctx = this.canvas_ctx;
    ctx.strokeStyle = this.opts.line_color;
    ctx.lineWidth = this.opts.line_width;
    ctx.lineCap = "round";

    this._bezier_to(
      ctx,
      pin.x + offset.x,
      pin.y + offset.y,
      pout.x + offset.x,
      pout.y + offset.y
    );
  }

  _bezier_to(
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
