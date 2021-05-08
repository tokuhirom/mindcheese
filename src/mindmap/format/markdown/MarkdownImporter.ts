import MindmapImporter from "../MindmapImporter";
import Mind from "../../Mind";
import NodeTreeImporter from "../node_tree/NodeTreeImporter";
import { convertMD2MM } from "../../../MD2MMConverter";

export default class MarkdownImporter implements MindmapImporter {
  private node_tree_importer: NodeTreeImporter;
  constructor() {
    this.node_tree_importer = new NodeTreeImporter();
  }

  get_mind(source: any): Mind {
    const tree = convertMD2MM(source.title, source.markdown);
    return this.node_tree_importer.get_mind(tree);
  }
}
