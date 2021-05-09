import MindmapImporter from "../MindmapImporter";
import Mind from "../../Mind";
import NodeTreeImporter from "../node_tree/NodeTreeImporter";
import { convertMD2MM } from "../../../MD2MMConverter";

export default class MarkdownImporter implements MindmapImporter {
  private readonly nodeTreeImporter: NodeTreeImporter;

  constructor() {
    this.nodeTreeImporter = new NodeTreeImporter();
  }

  getMind(source: any): Mind {
    const tree = convertMD2MM(source.title, source.markdown);
    return this.nodeTreeImporter.getMind(tree);
  }
}
