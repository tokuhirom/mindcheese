import { CenterOfNodeOffsetFromRootNode } from "./CenterOfNodeOffsetFromRootNode";
import MindNode from "../model/MindNode";

export class LayoutResult {
  private readonly _relativeFromRootMap: Record<
    string,
    CenterOfNodeOffsetFromRootNode
  >;

  constructor(
    relativeFromRootMap: Record<string, CenterOfNodeOffsetFromRootNode>
  ) {
    this._relativeFromRootMap = relativeFromRootMap;
  }

  getCenterOffsetOfTheNodeFromRootNode(
    node: MindNode
  ): CenterOfNodeOffsetFromRootNode {
    return this._relativeFromRootMap[node.id];
  }
}
