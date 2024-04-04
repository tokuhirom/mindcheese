import { Size } from "./Size";
import { OffsetFromTopLeftOfMcnodes } from "../layout/OffsetFromTopLeftOfMcnodes";
export declare class ViewData {
  element: HTMLElement | null;
  adder: HTMLElement | null;
  elementSizeCache: Size | null;
  elementTopLeft: OffsetFromTopLeftOfMcnodes | null;
}
