import { Size } from "../Size";
import { OffsetFromTopLeftOfMcnodes } from "../layout/OffsetFromTopLeftOfMcnodes";

export class ViewData {
  element: HTMLElement | null = null;
  adder: HTMLElement | null = null;

  elementSizeCache: Size | null = null;
  elementTopLeft: OffsetFromTopLeftOfMcnodes | null = null;
}
