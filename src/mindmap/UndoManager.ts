import MindCheese from "./MindCheese";
import { EventType } from "./MindmapConstants";

export default class UndoManager {
  private readonly mindCheese: MindCheese;
  private undoStack: [string, any][];
  private readonly undoStackLimit: number;

  constructor(jm: MindCheese, undoStackLimit = 10000) {
    this.mindCheese = jm;
    this.undoStack = [];
    this.undoStackLimit = undoStackLimit;
  }

  init(): void {
    this.mindCheese.addEventListener(EventType.BeforeEdit, (data) => {
      if (this.undoStack.length > this.undoStackLimit) {
        console.log(`UndoManager: callback event. too much stacks.`);
        this.undoStack.shift();
      }
      console.log(`UndoManager: callback event pushing. ${data.evt}`);
      this.undoStack.push([data.evt, this.mindCheese.getData("nodeTree")]);
    });
  }

  undo(): void {
    const item = this.undoStack.pop();
    if (item) {
      const [evt, data] = item;
      console.log(`UndoManager: undo. evt=${evt} data=${data}`);
      this.mindCheese.showNodeTree(data);
    } else {
      console.log(`UndoManager: undo. stack is empty.`);
    }
  }
}
