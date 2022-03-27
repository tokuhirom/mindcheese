import MindCheese from "../MindCheese";
import GraphCanvas from "../GraphCanvas";

export default class LayoutProvider {
  private readonly mindCheese: MindCheese;
  private readonly hSpace: number;
  private readonly vSpace: number;
  private readonly pSpace: number;
  private readonly graphCanvas: GraphCanvas;

  /**
   * The constructor
   * @param mindCheese MindCheese instance
   * @param hspace horizontal spacing between nodes
   * @param vspace vertical spacing between nodes
   * @param pspace Horizontal spacing between node and connection line (to place node adder)
   * @param graphCanvas
   */
  constructor(
    mindCheese: MindCheese,
    hspace: number,
    vspace: number,
    pspace: number,
    graphCanvas: GraphCanvas
  ) {
    this.hSpace = hspace;
    this.vSpace = vspace;
    this.pSpace = pspace;
    this.mindCheese = mindCheese;
    this.graphCanvas = graphCanvas;
  }
}
