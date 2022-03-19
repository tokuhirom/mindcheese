import Mind from "../../Mind";
import NodeTreeImporter from "../node_tree/NodeTreeImporter";
import { convertMD2MM } from "../../../MD2MMConverter";

export default class MarkdownImporter {
  private readonly nodeTreeImporter: NodeTreeImporter;

  constructor() {
    this.nodeTreeImporter = new NodeTreeImporter();
  }

  getMind(title: string, markdown: string): Mind {
    const tree = convertMD2MM(title, markdown);
    return this.nodeTreeImporter.getMind(tree);
  }
}
