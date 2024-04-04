import { Direction } from "../MindmapConstants";
import { ViewData } from "./ViewData";
export declare class MindNode {
  readonly id: string;
  index: number;
  topic: string;
  readonly isroot: boolean;
  parent: MindNode | null;
  direction: Direction;
  readonly children: MindNode[];
  color: string | null;
  viewData: ViewData;
  constructor(
    id: string,
    index: number,
    topic: string,
    isRoot: boolean,
    parent: MindNode | null,
    direction: Direction,
  );
  static compare(node1: MindNode, node2: MindNode): number;
  static inherited(pnode: MindNode, node: MindNode): boolean;
  toObject(): Record<string, any>;
  applyColor(color: string): void;
}
