import { CenterOfNodeOffsetFromRootNode } from "../../layout/CenterOfNodeOffsetFromRootNode";
import { GraphCanvas } from "./GraphCanvas";
import { Mind } from "../../model/Mind";
import { LayoutResult } from "../../layout/LayoutResult";
import { RootNodeOffsetFromTopLeftOfMcnodes } from "../../layout/RootNodeOffsetFromTopLeftOfMcnodes";

export class GraphView {
  private readonly graphCanvas: GraphCanvas;
  private readonly lineWidth: number;

  constructor(graphCanvas: GraphCanvas) {
    this.graphCanvas = graphCanvas;
    this.lineWidth = this.graphCanvas.lineWidth;
  }

  renderLines(
    mind: Mind,
    layoutResult: LayoutResult,
    offset: RootNodeOffsetFromTopLeftOfMcnodes
  ): void {
    this.graphCanvas.clear();

    for (const node of Object.values(mind.nodes).filter((it) => !it.isroot)) {
      const pin = layoutResult.getNodePointIn(node);
      {
        // Draw line between previous node and next node
        const pout = layoutResult.getNodePointOut(node.parent!, node);
        this.graphCanvas.drawLine(
          offset.convertCenterOfNodeOffsetFromRootNode(pout),
          offset.convertCenterOfNodeOffsetFromRootNode(pin),
          node.color!,
          "round"
        );
      }
      {
        // Draw line under the bottom of the node
        const pout = new CenterOfNodeOffsetFromRootNode(
          pin.x + node.view.elementSizeCache!.width * node.direction,
          pin.y
        );
        this.graphCanvas.drawLine(
          offset.convertCenterOfNodeOffsetFromRootNode(pout),
          offset.convertCenterOfNodeOffsetFromRootNode(pin),
          node.color!,
          "butt"
        );
      }
    }
  }

  setSize(width: number, height: number) {
    this.graphCanvas.setSize(width, height);
  }

  clear() {
    this.graphCanvas.clear();
  }
}
