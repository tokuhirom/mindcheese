import JsMind from "./JsMind";
import { EventType } from "./MindmapConstants";

export default class UndoManager {
  private readonly _jm: JsMind;
  private undoStack: [string, any][];
  private readonly undoStackLimit: number;

  constructor(jm: JsMind, undoStackLimit: number = 10000) {
    this._jm = jm;
    this.undoStack = [];
    this.undoStackLimit = undoStackLimit;
  }

  init(): void {
    this._jm.add_event_listener(EventType.BEFORE_EDIT, (data) => {
      if (this.undoStack.length > this.undoStackLimit) {
        console.log(`UndoManager: callback event. too much stacks.`);
        this.undoStack.shift();
      }
      console.log(`UndoManager: callback event pushing. ${data.evt}`);
      this.undoStack.push([data.evt, this._jm.get_data("node_tree")]);
    });
  }

  undo(): void {
    const item = this.undoStack.pop();
    if (item) {
      const [evt, data] = item;
      console.log(`UndoManager: undo. evt=${evt} data=${data}`);
      this._jm.show(data);
    } else {
      console.log(`UndoManager: undo. stack is empty.`);
    }
  }
}
