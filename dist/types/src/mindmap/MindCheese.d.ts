import { ShortcutProvider } from "./ShortcutProvider";
import { MindNode } from "./model/MindNode";
import { Mind } from "./model/Mind";
import { Draggable } from "./Draggable";
import { Direction, EventType } from "./MindmapConstants";
import { MindOption } from "./MindOption";
import { WrapperView } from "./view/wrapper/WrapperView";
import { EventCallback } from "./EventRouter";
export declare class MindCheese {
  options: MindOption;
  mind: Mind;
  wrapperView: WrapperView;
  shortcut: ShortcutProvider;
  draggable: Draggable;
  private undoManager;
  private editable;
  private readonly container;
  private eventRouter;
  constructor(container: HTMLElement, options?: MindOption);
  addEventListener(eventType: EventType, callback: EventCallback): void;
  enableEdit(): void;
  disableEdit(): void;
  isEditable(): boolean;
  checkEditable(): void;
  setTheme(theme: string): void;
  private bindEvent;
  private showMind;
  showNodeTree(nodeTree: any): void;
  showMarkdown(body: string): void;
  getMarkdown(): string;
  getNodeTree(): Record<string, any>;
  addNode(parentNode: MindNode, nodeid: string, topic: string): MindNode;
  insertNodeAfter(nodeAfter: MindNode, nodeid: string, topic: string): MindNode;
  removeNode(node: MindNode): boolean;
  private static findUpperBrotherOrParentNode;
  updateNode(nodeid: string, topic: string): void;
  /**
   * @param node Target node to move.
   * @param beforeid Move nodeid's node to above of the *beforeid*. You can use BEFOREID_* constants.
   * @param parent
   * @param direction
   */
  moveNode(
    node: MindNode,
    beforeid: string,
    parent: MindNode,
    direction: Direction,
  ): void;
  selectNode(node: MindNode): void;
  getSelectedNode(): MindNode | null;
  selectClear(): void;
  findNodeBefore(node: MindNode): null | MindNode;
  findNodeAfter(node: MindNode): null | MindNode;
  resize(): void;
  undo(): void;
  moveUp(node: MindNode): void;
  moveDown(node: MindNode): void;
}
