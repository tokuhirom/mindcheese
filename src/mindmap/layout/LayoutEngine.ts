import { Direction } from "../MindmapConstants";
import { MindNode } from "../model/MindNode";
import { Mind } from "../Mind";
import { RelativeOffsetFromParent } from "./RelativeOffsetFromParent";
import { CenterOfNodeOffsetFromRootNode } from "./CenterOfNodeOffsetFromRootNode";
import { LayoutResult } from "./LayoutResult";

export class LayoutEngine {
  private readonly hSpace: number;
  private readonly vSpace: number;
  private readonly pSpace: number;

  /**
   * The constructor
   *
   * @param hspace horizontal spacing between nodes
   * @param vspace vertical spacing between nodes
   * @param pspace Horizontal spacing between node and connection line (to place node adder)
   */
  constructor(hspace: number, vspace: number, pspace: number) {
    this.hSpace = hspace;
    this.vSpace = vspace;
    this.pSpace = pspace;
  }

  layout(mind: Mind): LayoutResult {
    const rootNode = mind.root!;

    const relativeFromParentMap: Record<string, RelativeOffsetFromParent> = {};
    relativeFromParentMap[mind.root!.id] = new RelativeOffsetFromParent(0, 0);

    this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.LEFT),
      relativeFromParentMap
    );
    this.layoutOffsetSubNodes(
      rootNode.children.filter((it) => it.direction == Direction.RIGHT),
      relativeFromParentMap
    );

    const relativeFromRootMap: Record<string, CenterOfNodeOffsetFromRootNode> =
      {};
    for (const node of Object.values(mind.nodes)) {
      relativeFromRootMap[node.id] = LayoutEngine.calcRelativeOffsetFromRoot(
        node,
        relativeFromParentMap
      );
    }
    return new LayoutResult(relativeFromRootMap);
  }

  private static calcRelativeOffsetFromRoot(
    node: MindNode,
    relativeMap: Record<string, RelativeOffsetFromParent>
  ): CenterOfNodeOffsetFromRootNode {
    let x = 0;
    let y = 0;
    let n: MindNode | null = node;

    do {
      x += relativeMap[n.id].x;
      y += relativeMap[n.id].y;

      n = n!.parent;
    } while (n && !n.isroot);

    return new CenterOfNodeOffsetFromRootNode(x, y);
  }

  // layout both the x and y axis
  private layoutOffsetSubNodes(
    nodes: MindNode[],
    relativeMap: Record<string, RelativeOffsetFromParent>
  ): number {
    if (nodes.length == 0) {
      return 0;
    }

    let totalHeight = 0;
    {
      let baseY = 0;
      for (let i = 0, l = nodes.length; i < l; i++) {
        const node = nodes[i];

        const childrenHeight = this.layoutOffsetSubNodes(
          node.children,
          relativeMap
        );
        const nodeOuterHeight = Math.max(
          node.data.view.elementSizeCache!.height,
          childrenHeight
        );

        const x =
          this.hSpace * node.direction +
          (node.parent!.data.view.elementSizeCache!.width / 2) *
            node.direction +
          this.hSpace * node.direction +
          (node.data.view.elementSizeCache!.width / 2) * node.direction +
          (node.parent?.isroot ? 0 : this.pSpace * node.direction);

        const y = baseY + nodeOuterHeight / 2;

        relativeMap[node.id] = new RelativeOffsetFromParent(x, y);

        baseY += nodeOuterHeight + this.vSpace;
        totalHeight += nodeOuterHeight;
      }
    }

    if (nodes.length > 1) {
      totalHeight += this.vSpace * (nodes.length - 1);
    }

    {
      const middleHeight = totalHeight / 2;
      for (let i = 0, l = nodes.length; i < l; i++) {
        relativeMap[nodes[i].id].y -= middleHeight;
      }
    }

    return totalHeight;
  }
}
