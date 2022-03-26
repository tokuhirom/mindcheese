import { OffsetFromTopLeftOfMcnodes, Point } from "../LayoutProvider";

export class ViewData {
  element: HTMLElement | null = null;
  expander: HTMLElement | null = null;

  width: number = 0;
  height: number = 0;

  location: OffsetFromTopLeftOfMcnodes = new OffsetFromTopLeftOfMcnodes(0, 0);
}
