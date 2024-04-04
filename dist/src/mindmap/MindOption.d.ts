import { TextFormatter } from "./renderer/TextFormatter";
import { MindCheese } from "./MindCheese";

export declare class MindOption {
  theme: string;
  view: ViewOption;
  layout: LayoutOption;
  shortcut: ShortcutOption;
}
declare class ViewOption {
  hmargin: number;
  vmargin: number;
  lineWidth: number;
  lineColor: string;
  renderer: TextFormatter;
}
declare class LayoutOption {
  hspace: number;
  vspace: number;
  pspace: number;
}
declare class ShortcutOption {
  enable: boolean;
  mappings: [number, string, (jm: MindCheese, e: Event) => boolean][];
}
export {};
