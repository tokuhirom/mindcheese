import { MindCheese } from "./MindCheese";
export declare class ShortcutHandlers {
  static delete(mindCheese: MindCheese): boolean;
  static addChild(mindCheese: MindCheese): boolean;
  static addBrother(mindCheese: MindCheese, e: Event): boolean;
  static editNode(mindCheese: MindCheese): boolean;
  static moveUp(mindCheese: MindCheese): boolean;
  static moveDown(mindCheese: MindCheese): boolean;
  static up(mindCheese: MindCheese, e: Event): boolean;
  static down(mindCheese: MindCheese, e: Event): boolean;
  static left(mindCheese: MindCheese, e: Event): boolean;
  static right(mindCheese: MindCheese, e: Event): boolean;
  private static handleDirection;
  static undo(mindCheese: MindCheese, e: KeyboardEvent): boolean;
}
