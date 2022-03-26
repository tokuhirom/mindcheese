import {OffsetFromTopLeftOfMcnodes} from "../LayoutProvider";

export class ViewData {
  element: HTMLElement | null = null;
  expander: HTMLElement | null = null;

  width = 0;
  height = 0;

  location: OffsetFromTopLeftOfMcnodes = new OffsetFromTopLeftOfMcnodes(0, 0);
}
