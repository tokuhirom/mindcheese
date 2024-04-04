import { TextFormatter } from "./TextFormatter";
export declare class PlainTextRenderer implements TextFormatter {
  render(src: string): string;
  private static escapeHtml;
}
