import JsMind from "./JsMind";
import Mind from "./Mind";
import MindmapExporter from "./format/MindmapExporter";
import MindmapImporter from "./format/MindmapImporter";
import NodeTreeImporter from "./format/node_tree/NodeTreeImporter";
import NodeTreeExporter from "./format/node_tree/NodeTreeExporter";
import MarkdownImporter from "./format/markdown/MarkdownImporter";
import MarkdownExporter from "./format/markdown/MarkdownExporter";

class DataFormat {
  importer: MindmapImporter;
  exporter: MindmapExporter;

  constructor(importer: MindmapImporter, exporter: MindmapExporter) {
    this.importer = importer;
    this.exporter = exporter;
  }
  get_data(mind: Mind): any {
    return this.exporter.get_data(mind);
  }
  get_mind(source: any): Mind {
    return this.importer.get_mind(source);
  }
}

export default class DataProvider {
  private readonly format_map: Record<string, DataFormat>;
  private jm: JsMind;

  constructor(jm: JsMind) {
    this.jm = jm;
    this.format_map = {
      node_tree: new DataFormat(new NodeTreeImporter(), new NodeTreeExporter()),
      markdown: new DataFormat(new MarkdownImporter(), new MarkdownExporter()),
    };
  }

  load(format: string, mind_data: any): Mind {
    const data_format = this.format_map[format];
    return data_format.get_mind(mind_data);
  }

  get_data(format: string): any {
    const data_format = this.format_map[format];
    if (data_format) {
      return data_format.get_data(this.jm.mind);
    } else {
      throw new Error(`Unknown format: ${data_format}`);
    }
  }
}
