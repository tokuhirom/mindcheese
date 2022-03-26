import { OffsetFromTopLeftOfMcnodes } from "../LayoutProvider";

export class ViewData {
  element: HTMLElement | null = null;
  adder: HTMLElement | null = null;

  width = 0;
  height = 0;

  location: OffsetFromTopLeftOfMcnodes | null = null;
}
