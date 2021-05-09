import MindmapExporter from "../MindmapExporter";
import Mind from "../../Mind";
import NodeTreeExporter from "../node_tree/NodeTreeExporter";
import { convertMM2MD } from "../../../MM2MDConverter";

export default class MarkdownExporter implements MindmapExporter {
  private nodeTreeExporter: NodeTreeExporter;

  constructor() {
    this.nodeTreeExporter = new NodeTreeExporter();
  }

  getData(mind: Mind): string {
    const data = this.nodeTreeExporter.getData(mind);
    return convertMM2MD(data);
  }
}
