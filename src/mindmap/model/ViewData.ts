import { OffsetFromTopLeftOfMcnodes } from "../LayoutProvider";
import { Size } from "../Size";

export class ViewData {
  element: HTMLElement | null = null;
  adder: HTMLElement | null = null;

  elementSizeCache: Size | null = null;
  elementTopLeft: OffsetFromTopLeftOfMcnodes | null = null;
}
