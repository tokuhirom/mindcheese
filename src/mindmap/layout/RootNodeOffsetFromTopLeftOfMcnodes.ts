import { OffsetFromTopLeftOfMcnodes } from "./OffsetFromTopLeftOfMcnodes";
import { CenterOfNodeOffsetFromRootNode } from "./CenterOfNodeOffsetFromRootNode";

export class RootNodeOffsetFromTopLeftOfMcnodes extends OffsetFromTopLeftOfMcnodes {
  convertCenterOfNodeOffsetFromRootNode(
    offset: CenterOfNodeOffsetFromRootNode
  ): OffsetFromTopLeftOfMcnodes {
    return new OffsetFromTopLeftOfMcnodes(this.x + offset.x, this.y + offset.y);
  }

  // brand field
  __RootNodeOffsetFromTopLeftOfMcnodesBrand: any;
}
