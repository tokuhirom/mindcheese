import { MindCheese } from "./MindCheese";

export declare class UndoManager {
  private readonly mindCheese;
  private readonly undoStack;
  private readonly undoStackLimit;
  constructor(jm: MindCheese, undoStackLimit?: number);
  /**
   * Before every editing graph, call this method.
   */
  recordSnapshot(): void;
  undo(): void;
}
