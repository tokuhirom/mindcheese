export default class GraphCanvas {
  private opts: any; // FIXME don't use any
  private e_canvas: HTMLCanvasElement;
  private canvas_ctx: CanvasRenderingContext2D;
  private size: { w: number; h: number };

  constructor(view: any) {
    this.opts = view.opts;
    this.e_canvas = document.createElement("canvas");
    this.e_canvas.className = "jsmind";
    this.canvas_ctx = this.e_canvas.getContext("2d");
    this.size = { w: 0, h: 0 };
  }

  element() {
    return this.e_canvas;
  }

  set_size(w: number, h: number) {
    this.size.w = w;
    this.size.h = h;
    this.e_canvas.width = w;
    this.e_canvas.height = h;
  }

  clear() {
    this.canvas_ctx.clearRect(0, 0, this.size.w, this.size.h);
  }

  // TODO what's the type of **pout**
  draw_line(pout: any, pin: { x: number; y: number }, offset: { x: number; y: number }) {
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

  copy_to(dest_canvas_ctx: CanvasRenderingContext2D, callback: () => void) {
    dest_canvas_ctx.drawImage(this.e_canvas, 0, 0);
    if (callback) {
      callback();
    }
  }

  _bezier_to(ctx: CanvasRenderingContext2D, x1:number, y1:number, x2:number, y2:number) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 + ((x2 - x1) * 2) / 3, y1, x1, y2, x2, y2);
    ctx.stroke();
  }

  _line_to (ctx:CanvasRenderingContext2D, x1:number, y1:number, x2:number, y2:number) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
