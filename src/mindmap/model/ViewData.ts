import { Point } from "../LayoutProvider";

export class ViewData {
  element: HTMLElement | null = null;
  expander: HTMLElement | null = null;

  width: number = 0;
  height: number = 0;

  location: Point = new Point(0, 0);
}
