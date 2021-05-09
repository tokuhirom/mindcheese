import Mind from "./Mind";
import MindmapExporter from "./format/MindmapExporter";
import MindmapImporter from "./format/MindmapImporter";
import NodeTreeImporter from "./format/node_tree/NodeTreeImporter";
import NodeTreeExporter from "./format/node_tree/NodeTreeExporter";
import MarkdownImporter from "./format/markdown/MarkdownImporter";
import MarkdownExporter from "./format/markdown/MarkdownExporter";

class DataFormat {
  private readonly importer: MindmapImporter;
  private readonly exporter: MindmapExporter;

  constructor(importer: MindmapImporter, exporter: MindmapExporter) {
    this.importer = importer;
    this.exporter = exporter;
  }
  getData(mind: Mind): any {
    return this.exporter.getData(mind);
  }
  get_mind(source: any): Mind {
    return this.importer.get_mind(source);
  }
}

export default class DataProvider {
  private readonly format_map: Record<string, DataFormat>;

  constructor() {
    this.format_map = {
      node_tree: new DataFormat(new NodeTreeImporter(), new NodeTreeExporter()),
      markdown: new DataFormat(new MarkdownImporter(), new MarkdownExporter()),
    };
  }

  load(format: string, mind_data: any): Mind {
    const data_format = this.format_map[format];
    return data_format.get_mind(mind_data);
  }

  getData(format: string, mind: Mind): any {
    const data_format = this.format_map[format];
    if (data_format) {
      return data_format.getData(mind);
    } else {
      throw new Error(`Unknown format: ${data_format}`);
    }
  }
}
