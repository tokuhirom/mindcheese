import { Renderer } from "./Renderer";

export default class PlainTextRenderer implements Renderer {
  render(src: string): string {
    return PlainTextRenderer.escapeHtml(src).replace(/\n/g, "<br>");
  }

  private static escapeHtml(src: string): string {
    const pre = document.createElement("pre");
    const text = document.createTextNode(src);
    pre.appendChild(text);
    return pre.innerHTML;
  }
}
